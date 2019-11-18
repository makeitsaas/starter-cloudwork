import { Main } from '../../../src/main';
import { DeployServiceTask } from '@custom-modules/workflows/steps/deploy-service.task';

export const CliTestHandler = (program: any, app: Main): Promise<any> => {
    /*
    let infra = new InfrastructureModule();
        return infra.test().then(() => {
            // app.exit();
        });
     */
    console.log('test');
    let task = new DeployServiceTask();
    return task.run().then(() => {
        console.log('exit');
        app.exit();
    });
};
