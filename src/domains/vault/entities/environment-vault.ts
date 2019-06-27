import { Column, Entity } from 'typeorm';
import { AbstractBaseVault } from '@entities';

@Entity()
export class EnvironmentVault extends AbstractBaseVault {
    @Column()
    environmentUuid: string = '';
}
