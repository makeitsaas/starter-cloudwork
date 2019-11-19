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
description: "Simple Landing prod"
api:
    domains:
      - simplelanding-api.lab.makeitsaas.com
      - api.simplelanding.io
    services:
      - uuid: "9"
        path: /
        repository: 
          url: 'https://github.com/makeitsaas/simple-landing'
        type: node
      - uuid: "10"
        path: /auth
        repository: 
          url: 'https://github.com/makeitsaas/makeitsaas-auth-instance'
        type: node
        tags: ["api:authentication"]
`;
const order4 = `
action: "update"
environment_id: "5"
description: "Simple Landing test"
api:
    domains:
      - simplelanding-api-test.lab.makeitsaas.com
      - test.api.simplelanding.io
    services:
      - uuid: "9"
        path: /core
        repository: 
          url: 'https://github.com/makeitsaas/simple-landing'
        type: node
        tags: ["api:discovery", "api:authentication"]
`;
const order5 = `
action: "update"
environment_id: "6"
description: "Simple deployment for testing purpose"
api:
    domains:
      - test-deployer.lab.makeitsaas.com
    services:
      - uuid: "9"
        path: /core
        repository: 
          url: 'https://github.com/makeitsaas/simple-landing'
        type: node
`;

const order6 = `
action: "update"
environment_id: "4"
description: "Simple Landing angular"
front:
    domains:
      - simple-landing-front.lab.makeitsaas.com
      - app.simplelanding.io
    services:
      - uuid: "11"
        path: /
        repository: 
          url: 'https://github.com/makeitsaas/simple-landing-front'
        type: angular
`;

export const CustomOrders: {[id: number]: string} = {
    1: order1,
    2: order2,
    3: order3,
    4: order4,
    5: order5,
    6: order6
};
