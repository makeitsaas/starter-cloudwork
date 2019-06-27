import { FakeDelay } from '@fake';

export const ExampleMethodDecorator = function() {
    return function(target: any, key:string, descriptor: PropertyDescriptor) {
        console.log('example method decorator called', target, key);
        const originalMethod = descriptor.value;

        descriptor.value = async function(...args: any[]) {
            console.log('this is an interceptor');
            await FakeDelay.wait(2000);
            await originalMethod.apply(this, args);
        };

        return descriptor;
    }
};
