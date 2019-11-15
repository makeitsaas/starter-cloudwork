const order2 = `
action: "drop"
environment_id: "3"
`;

const order1 = `
action: "update"
environment_id: "3"
domains:
  - manager-api.lab.makeitsaas.com
services:
  - id: "6"
    path: /auth
    repo_url: 'https://github.com/makeitsaas/makeitsaas-auth-instance'
    type: api-node-v1
  - id: "7"
    path: /
    repo_url: 'https://github.com/Duwab/makeitsaas-manager-api'
    type: api-node-v1
  - id: "8"
    path: /
    repo_url: 'https://github.com/Duwab/makeitsaas-manager-front'
    type: angular
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
