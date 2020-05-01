# jwks-cli

JWKS CLI is used to manage JWKs to sign, verify JWTs:

- generate a JWK RSA public/private key pairs to a specified directory
- list the JWK key ids from a specified directory
- export JWK public keys to the jwks.json file format
- export all the public keys from the specified dir to the jwks.json file format
- sign a JWT token by a specified key id from the specified JWK keys directory
- verify the signed JWT token from a specified a JWKS json file

This is extremely useful and secured for any JWT token authorizator to create, manage keys and sign
JWT tokens with those created keys.


## How to use

- Install:

```bash
# Install the develop version
$ npm install -g teracyhq-incubator/jwks-cli#develop
# Install from npmjs.com (not yet)
```

- Use:

```bash
$ jwks -h
Usage: jwks [options] [command]

Options:
  -v, --version             output the version number
  -h, --help                display help for command

Commands:
  generate [dir]            generate a JWK key to a specified directory, default dir: .keys
  ls [dir]                  list the JWK key ids from a specified directory, default dir: .keys
  export [dir] [path]       export all the public keys from the specified dir to the jwks.json file format; default dir: .keys, default path:
                            .well-known/jwks.json
  sign [options] [payload]  sign a JWT token by a specified key id from the specified JWK keys directory
  verify [options] [token]  verify the signed JWT token from a specified a JWKS json file
  help [command]            display help for command
```

- Examples:

```bash
$ jwks generate
public and private keys were successfully created at .keys/u53Nq85gp2jQl4W0PPReN4MYmDw_m_JhVL6qk7clGOE
$ jwks generate
public and private keys were successfully created at .keys/vKgNgISEqVFwTSLeuGcLhttlend_eSljwzgOX5WCtTk
```

```bash
$ tree .keys/
.keys/
├── u53Nq85gp2jQl4W0PPReN4MYmDw_m_JhVL6qk7clGOE
│   ├── u53Nq85gp2jQl4W0PPReN4MYmDw_m_JhVL6qk7clGOE-rsa
│   └── u53Nq85gp2jQl4W0PPReN4MYmDw_m_JhVL6qk7clGOE-rsa.pub
└── vKgNgISEqVFwTSLeuGcLhttlend_eSljwzgOX5WCtTk
    ├── vKgNgISEqVFwTSLeuGcLhttlend_eSljwzgOX5WCtTk-rsa
    └── vKgNgISEqVFwTSLeuGcLhttlend_eSljwzgOX5WCtTk-rsa.pub

2 directories, 4 files
```

```bash
$ jwks ls
[
  'u53Nq85gp2jQl4W0PPReN4MYmDw_m_JhVL6qk7clGOE',
  'vKgNgISEqVFwTSLeuGcLhttlend_eSljwzgOX5WCtTk'
]
```

```bash
$ jwks export
.well-known/jwks.json was successfully updated
$ cat .well-known/jwks.json 
{
  "keys": [
    {
      "e": "AQAB",
      "n": "8dxpprNUb1Uy7sHbDAl12LFgu2PmZS5WGNDMa1TxCmsuFTPt5sD7DzXLtTGWcT2L5kdjrPsA-yuLN2J8uMTWZ3UXUwp5K9IwvfcXlOW2afGy38h4T8HN1cHKjsgLoVEbJeaek5BD62sS-9OKlJFMHMal9pqsJM5dHHaNqxV63liZ6Vek---AXx5X--azgO7h7YQeAuTpVaF_phdfOJyFUWrEtYs3VgrSIYM_qctDAy-iTlpkQs47RorD6ltHqkiLoIv7oeEkdS4fIIoFI95cmIFHzNQ7zaNsrhjEyJzgwxxi20W6xPYhv5SplotLKt9QwHIXRRyuGgG8pBq30mkNoQ",
      "kty": "RSA",
      "kid": "u53Nq85gp2jQl4W0PPReN4MYmDw_m_JhVL6qk7clGOE"
    },
    {
      "e": "AQAB",
      "n": "xopfTRFkXW-rLhB64PP_njp-ldIa-AzwNfIzS7xmPySvd_jaKgJRfMEhF-hx2DbDunjZ3zEakp2QJ2eSH3KGHs2NwLwuJdKjt4uQKaigRcv5qv_vw5i95r-2poFWOj1-QhCtTOAYrYicTsGQOhFtbdZIuM0RDqStpuUN8t1Nyr936IJ0YMY74x3WPjGKkNqPU8MWN5py8HSbbRTpHSjPGKju5R1UHWrUT-rAODNno41rIOIv5PCo2i6DOUxWWhYygS3QUxNH1dFJn53rIMObhvkzkjOgKr1kktXqDT9xNm3kawJ_RoeiCfQlYLauZ0D5XT4yp77CUvOJaaHCUWFN5Q",
      "kty": "RSA",
      "kid": "vKgNgISEqVFwTSLeuGcLhttlend_eSljwzgOX5WCtTk"
    }
  ]
}
```

```bash
$ cat <<EOF >test.json
{
  "sub": "1234567890",
  "name": "John Doe",
  "iat": 1516239022
}
EOF
```

```bash
$ cat test.json | jwks sign -k vKgNgISEqVFwTSLeuGcLhttlend_eSljwzgOX5WCtTk
payload: {
  "sub": "1234567890",
  "name": "John Doe",
  "iat": 1516239022
}
opts.dir: .keys
opts.keyId: vKgNgISEqVFwTSLeuGcLhttlend_eSljwzgOX5WCtTk
token: eyJraWQiOiJ2S2dOZ0lTRXFWRndUU0xldUdjTGh0dGxlbmRfZVNsand6Z09YNVdDdFRrIiwiYWxnIjoiUFMyNTYifQ.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTg4MzU2NDI3fQ.JQisO8uGr2RkBCrHaTRkLHWnP2TcG4hHVQl1kGnPL_s65ui_hdRxY4ZxlaIHr4BCNfNq2CPyKoZ-isg52l1tfHOc20ScqkPKEpuKCpSodfDNAHLkcfwPyLc9v8Fv5ib15dsMtXA8Kzvq00FLpLjewtDWLzK2Zk2X5wJRorG92-iLqKPI951Xqvn2pnwiaew9OQnWT7zNK_tcHM7DSsAKO5Cb_zntZfwb3YaIq39ZeikN-SyO7a_jxcGdheR31PrZAzXYQn2MulAf3JjqCH0VWpwosCwgFruHftI0p2fGkphDfkr4wIXXrbMJrnxe1Rn8zu_2lnmiT77zVtc7V-j-SQ
```

```bash
$ jwks verify eyJraWQiOiJ2S2dOZ0lTRXFWRndUU0xldUdjTGh0dGxlbmRfZVNsand6Z09YNVdDdFRrIiwiYWxnIjoiUFMyNTYifQ.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTg4MzU2NDI3fQ.JQisO8uGr2RkBCrHaTRkLHWnP2TcG4hHVQl1kGnPL_s65ui_hdRxY4ZxlaIHr4BCNfNq2CPyKoZ-isg52l1tfHOc20ScqkPKEpuKCpSodfDNAHLkcfwPyLc9v8Fv5ib15dsMtXA8Kzvq00FLpLjewtDWLzK2Zk2X5wJRorG92-iLqKPI951Xqvn2pnwiaew9OQnWT7zNK_tcHM7DSsAKO5Cb_zntZfwb3YaIq39ZeikN-SyO7a_jxcGdheR31PrZAzXYQn2MulAf3JjqCH0VWpwosCwgFruHftI0p2fGkphDfkr4wIXXrbMJrnxe1Rn8zu_2lnmiT77zVtc7V-j-SQ
opts.jwks: .well-known/jwks.json
the token is verified as follows:
{ sub: '1234567890', name: 'John Doe', iat: 1588356427 }
```

Now you can publish the `.well-known/jwks.json` file to https://yourdomain.com/.well-known/jwks.json
and distribute the generated JWT token to your users. The users can use those tokens to
access any other services that trust you to verify those token for resource access grant.


## LICENSE

MIT License
