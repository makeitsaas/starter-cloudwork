import { Column, Entity } from 'typeorm';
import { AbstractBaseVault } from '@entities';

@Entity()
export class ServiceDeploymentVault extends AbstractBaseVault {
    @Column()
    serviceDeploymentUuid: string = '';
}
