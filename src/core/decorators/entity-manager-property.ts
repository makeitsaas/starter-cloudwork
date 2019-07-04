import { Container } from '@core';

export const _EM_: {[key in ('deployment'|'infrastructure'|'vault')]: 'main'|'vault'} = {
    deployment: 'main',
    infrastructure: 'main',
    vault: 'vault'
};

export function em(type: 'main'|'vault') {
    return function (target: Object, propertyName: string, index?: number) {
        Container.ready.then(() => {
            Object.defineProperty(target, propertyName, {
                value: Container.databases[type].manager
            });
        });
    }
}
