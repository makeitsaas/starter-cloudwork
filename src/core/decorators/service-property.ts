import { Container } from '@core';

export function service(target: Object, propertyName: string, index?: number) {
    const metadata = Reflect.getMetadata('design:type', target, propertyName);
    Container.ready.then(() => {
        const service = Container.getService(metadata);
        Object.defineProperty(target, propertyName, {
            value: service
        });
    });
}
