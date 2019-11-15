# Proxy

User has initially to add CNAME rules to make its domains point to proxy location.
Then proxy will automatically reroute traffic according to environments configurations

```
# cat /srv/proxy/config/routes/eXXX.yml 
vhosts:
  - domains:
      - manager-api.lab.makeitsaas.com
    services:
      - behavior: api
        path: /auth
        host: localhost
        port: 3009
        secure: False
        outputBasePath: 
        repositoryVersion: 
      - behavior: api
        path: /
        host: localhost
        port: 3010
        secure: False
        outputBasePath: 
        repositoryVersion: 
  - domains:
      - angular-manager-api.lab.makeitsaas.com
    services:
      - behavior: web
        path: /
        host: s3.eu-central-1.amazonaws.com
        port: 443
        secure: True
        outputBasePath: /makeitsaas-public/auto/angular/initial-test
        repositoryVersion: 

```
