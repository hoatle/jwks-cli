#!/usr/bin/env node

const fs = require('fs');
const { readdirSync, readFileSync } = require('fs')
const { join } = require('path');
const https = require('https');

const program = require('commander');
const { JWK: { generateSync, asKey }, JWKS, JWT } = require('jose')

const pkg = require('../package.json')

const getDirectories = source =>
  readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

let stdin = '';

program
  .version(pkg.version, '-v, --version');

program
  .command('generate [dir]')
  .description('generate a JWK key to a specified directory, default dir: .keys')
  .action(function (dir) {
    dir = dir || '.keys'
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }
    const key = generateSync('RSA', 2048, { alg: 'RS256', use: 'sig' })
    const keyPath = join(dir, key.kid);
    fs.mkdirSync(keyPath)
    const publicKeyPath = join(keyPath, `${key.kid}-rsa.pub`)
    const privateKeyPath = join(keyPath, `${key.kid}-rsa`)
    fs.writeFileSync(publicKeyPath, key.toPEM())
    fs.writeFileSync(privateKeyPath, key.toPEM(true)) //TODO(hoatle): add support for passphrase?
    fs.chmodSync(privateKeyPath, '400');
    console.log(`public and private keys were successfully created at ${keyPath}`)
  });

program
  .command('ls [dir]')
  .description('list the JWK key ids from a specified directory, default dir: .keys')
  .action(function (dir) {
    dir = dir || '.keys'
    keyIds = getDirectories(dir)
    console.log(keyIds) //TODO(hoatle): need to verify valid keys?
  });

program
  .command('export [dir] [path]')
  .description('export all the public keys from the specified dir to the jwks.json file format; default dir: .keys, default path: .well-known/jwks.json')
  .action(function (dir, path) {
    dir = dir || '.keys'
    if (!path) {
      // create the default .well-known if not exists
      const wellKnownDir = '.well-known'
      if (!fs.existsSync(wellKnownDir)) {
        fs.mkdirSync(wellKnownDir)
      }
      path = path || join(wellKnownDir, 'jwks.json')
    }
    keyIds = getDirectories(dir)
    const keystore = new JWKS.KeyStore();
    keyIds.forEach(function (kid) {
      keystore.add(asKey(readFileSync(join(dir, kid, `${kid}-rsa.pub`))));

    })
    fs.writeFileSync(path, JSON.stringify(keystore.toJWKS(), null, 2));
    console.log(`${path} was successfully updated`)
  });

program
  .command('sign [payload]')
  .description('sign a JWT token by a specified key id from the specified JWK keys directory')
  .option('-d, --dir <dir>', 'the directory of JWK keys', '.keys')
  .option('-k, --key-id <key-id>', 'the available key id to be used to sign')
  .action(function (payload, opts) {
    if(stdin) {
      payload = JSON.parse(stdin);
    }
    console.log(`payload: ${JSON.stringify(payload, null, 2)}`)
    console.log(`opts.dir: ${opts.dir}`)
    console.log(`opts.keyId: ${opts.keyId}`)
    const key = asKey(readFileSync(join(opts.dir, opts.keyId, `${opts.keyId}-rsa`)));
    const token = JWT.sign(payload, key);
    console.log(`signed token: ${token}`);
  });


program
  .command('verify [token]')
  .description('verify the signed JWT token from a specified JWKS json file')
  .requiredOption('-j, --jwks <jwks>', 'the JWKS json file path, can be a http remote or local location', '.well-known/jwks.json')
  .action(async function(token, opts) {
    if (stdin) {
      token = stdin
    }
    console.log(`opts.jwks: ${opts.jwks}`)

    const keystore = await _get_keystore(opts.jwks);
    const verified = JWT.verify(token, keystore, { complete: true });
    if (verified) {
      console.log('the token is verified as follows:')
      console.log(verified)
    }
  });

if(process.stdin.isTTY) {
  program.parse(process.argv);
}
else {
  process.stdin.on('readable', function() {
    var chunk = this.read();
    if (chunk !== null) {
      stdin += chunk;
    }
  });
  process.stdin.on('end', function() {
    program.parse(process.argv); 
  });
}


async function _get_keystore(location) {
  if (location.startsWith('http://') || location.startsWith('https://')) {
    return new Promise(function(resolve, reject) {
      https.get(location, (resp) => {
        let data = '';

        resp.on('data', (chunk) => {
          data += chunk;
        });

        resp.on('end', () => {
          resolve(JWKS.asKeyStore(JSON.parse(data)));
        });

      }).on("error", (err) => {
        reject(err);
      });
    });
  } else {
    // local filesystem
    return JWKS.asKeyStore(JSON.parse(fs.readFileSync(location)));
  }
}
