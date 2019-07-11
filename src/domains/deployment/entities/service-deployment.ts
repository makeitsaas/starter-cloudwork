import {
    Column,
    CreateDateColumn,
    Entity, EntityManager,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import { Service } from '@entities';
import { Environment } from '@entities';
import { ComputingAllocation } from '@entities';
import { DatabaseAllocation } from '@entities';
import { em } from '../../../core/decorators/entity-manager-property';
import { InvalidEnumValue } from '../errors';

const COMPUTING_STATUS_LIST = [
    'init',
    'pending',
    'deployed',
    'failed',
    'stopped',
    'down'
];

@Entity()
export class ServiceDeployment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    computingStatus: string = 'init';     // pending, running, failed, stopped, down

    @Column()
    databaseStatus: string = 'init';     // pending, running, failed, stopped, down

    @Column()
    type: string = 'default';

    @ManyToOne(type => Service, { eager: true })
    service: Service;

    @ManyToOne(type => Environment, { eager: true })
    environment: Environment;

    @Column()
    path: string;

    @Column({nullable: true})
    repositoryVersion?: string;

    @ManyToOne(() => ComputingAllocation, {eager: true, nullable: true})
    computingAllocation: Promise<ComputingAllocation>;

    @ManyToOne(() => DatabaseAllocation, {eager: true, nullable: true})
    databaseAllocation: Promise<DatabaseAllocation>;

    @CreateDateColumn({type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({type: 'timestamp'})
    updatedAt: Date;

    @em('main')
    private em: EntityManager;

    saveComputingDeploymentStatus(newStatus: string): Promise<ServiceDeployment> {
        if(COMPUTING_STATUS_LIST.indexOf(newStatus) === -1) {
            throw new InvalidEnumValue('Computing status is wrong');
        }

        this.computingStatus = newStatus;
        return this.em.save(this);
    }

    saveDatabaseDeploymentStatus(newStatus: string): Promise<ServiceDeployment> {
        if(COMPUTING_STATUS_LIST.indexOf(newStatus) === -1) {
            throw new InvalidEnumValue('Database status is wrong');
        }

        this.databaseStatus = newStatus;
        return this.em.save(this);
    }
}
