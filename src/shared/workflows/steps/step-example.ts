import { StepInterface } from '../interfaces/step.interface';

export class StepExample implements StepInterface {
    check() {}
    prepare() {}
    pre() {}
    async run() {
        console.log('run step example');
        console.log('this step will launch a playbook');
    }
    post() {}
    rollback() {}
}
