const order1 = `
action: "update"
environment_id: "3"
api:
    domains:
      - manager-api.lab.makeitsaas.com
    services:
      - uuid: "6"
        path: /core
        repository: 
          url: 'https://github.com/makeitsaas/makeitsaas-auth-instance'
        tags: ["api:discovery", "api:authentication", "api:upload"]
        type: node
      - uuid: "7"
        path: /manager
        repository: 
          url: 'https://github.com/Duwab/makeitsaas-manager-api'
        type: node
front:
    domains:
      - manager-angular.lab.makeitsaas.com
    services:
      - uuid: "8"
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
api:
    domains:
      - simplelanding.lab.makeitsaas.com
      - api.simplelanding.io
    services:
      - uuid: "9"
        path: /core
        repository: 
          url: 'https://github.com/makeitsaas/simple-landing'
        type: node
        tags: ["api:discovery", "api:authentication"]
`;

export const FakeOrders: {[id: number]: string} = {
    1: order1,
    2: order2,
    3: order3
};
