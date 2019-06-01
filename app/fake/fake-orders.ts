const order1 = `
action: "update"
environment_id: "3"
domains:
  - manager-api.lab.makeitsaas.com
services:
  - id: "6"
    path: /auth
    repo_url: 'https://github.com/makeitsaas/makeitsaas-auth-instance'
  - id: "7"
    path: /
    repo_url: 'https://github.com/Duwab/makeitsaas-manager-api'
`;

export const FakeOrders: {[id: number]: string} = {
    1: order1
};
