import { FakeDelay } from '@fake';

export const ExampleClassDecorator = function(target: any) {
    const original = target;
    if(original.prototype.post) {
        const originalPostHook = original.prototype.post;
        original.prototype.post = async function (...args: any[]) {
            console.log('overridden post function');
            await FakeDelay.wait(4000);
            return await originalPostHook.apply(this, args);
        }
    }
    return target;
};
