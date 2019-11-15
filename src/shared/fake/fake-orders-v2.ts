const order1 = `
action: "update"
environment_id: "3"
api:
    domains:
      - manager-api.lab.makeitsaas.com
    services:
      - id: "6"
        path: /core
        repository: 
          url: 'https://github.com/makeitsaas/makeitsaas-auth-instance'
        roles: [auth, discovery, upload]
        variables: [] # vault id list 
        type: node
      - id: "7"
        path: /
        repository: 
          url: 'https://github.com/Duwab/makeitsaas-manager-api'
        type: node
front:
    domains:
      - manager-angular.lab.makeitsaas.com
    services:
      - id: "8"
        path: /
        repository: 
          url: 'https://github.com/Duwab/makeitsaas-manager-front'
        type: angular
`;

const order2 = `
action: "drop"
environment_id: "3"
`;

const order3 = `
action: "update"
environment_id: "4"
domains:
  - simplelanding.lab.makeitsaas.com
  - api.simplelanding.io
services:
  - id: "9"
    path: /
    repo_url: 'https://github.com/makeitsaas/simple-landing'
    type: api-node-v1
`;

export const FakeOrders: {[id: number]: string} = {
    1: order1,
    2: order2,
    3: order3
};
