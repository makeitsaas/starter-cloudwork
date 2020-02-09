import { Container } from '@core';

export const _EM_: {[key in ('deployment'|'infrastructure')]: 'main'} = {
    deployment: 'main',
    infrastructure: 'main',
    // vault: 'vault'
};

export function em(type: 'main') {
    return function (target: Object, propertyName: string, index?: number) {
        Container.ready.then(() => {
            Object.defineProperty(target, propertyName, {
                value: Container.databases[type].manager
            });
        });
    }
}
