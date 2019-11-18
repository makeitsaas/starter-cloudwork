import { Main } from '../../../src/main';
import { Order } from '../../../src/domains/pipeline/entities/order';
import { PipelineModule } from '../../../src/domains/pipeline/pipeline.module';

export const CliOrderHandler = (order: string, app: Main): Promise<any> => {
    console.log('order :', order);
    const o = new Order(order);
    return o.saveDeep().then(o => {
        const pipelineModule = new PipelineModule();
        return pipelineModule
            .processOrder(o)
    });
};
