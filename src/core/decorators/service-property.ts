import { Container } from '@core';

let Singletons: {
    [key: string]: any
} = {};

export function service(target: Object, propertyName: string, index?: number) {
    const metadata = Reflect.getMetadata('design:type', target, propertyName);
    Container.ready.then(() => {
        if(!Singletons[metadata.name]) {
            Singletons[metadata.name] = new metadata();
        }
        Object.defineProperty(target, propertyName, {
            value: Singletons[metadata.name]
        });
    });
}
