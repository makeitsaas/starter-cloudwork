import { service } from '@decorators';
import { InfrastructureService } from './services/infrastructure.service';
import * as AWS from 'aws-sdk';

AWS.config.update({region: 'eu-central-1'});

/**
 * For the moment, this module is used to load infrastructure service test
 */
export class InfrastructureModule {
    @service
    infrastructure: InfrastructureService;

    async test() {
        return this.infrastructure.testAWSConnection();
    }
}
