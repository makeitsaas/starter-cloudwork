import {
    Column,
    CreateDateColumn,
    Entity, EntityManager,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import { Service } from '@entities';
import { Environment } from '@entities';
import { ComputingAllocation } from '@entities';
import { DatabaseAllocation } from '@entities';
import { em } from '@decorators';
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
    @em('main')
    private em: EntityManager;

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    computingStatus: string = 'init';     // pending, running, failed, stopped, down

    @Column()
    databaseStatus: string = 'init';     // pending, running, failed, stopped, down

    @Column()
    cdnStatus: string = 'init';     // pending, running, failed, stopped, down

    @Column()
    type: ('angular'|'api-node-v1'|'default') = 'default';

    @ManyToOne(type => Service, { eager: true })
    service: Service;

    @ManyToOne(type => Environment, { eager: true })
    environment: Environment;

    @Column()
    path: string;

    @Column("simple-array")
    tags: string[] = [];

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

    saveCDNDeploymentStatus(newStatus: string): Promise<ServiceDeployment> {
        if(COMPUTING_STATUS_LIST.indexOf(newStatus) === -1) {
            throw new InvalidEnumValue('CDN status is wrong');
        }

        this.cdnStatus = newStatus;
        return this.em.save(this);
    }

    isSPADeployment() {
        return this.type === 'angular';
    }

    isAPIDeployment() {
        return /^api/.test(this.type);
    }

    async serviceLazy(): Promise<Service> {
        // when loaded via jointure, eager option is "ignored".
        // For example, after a 'await environment.deployment', deployment.service is undefined
        // only use lazy relations instead

        const deploymentWithEagerRelations = await this.em.getRepository(ServiceDeployment).findOneOrFail(this.id);

        return deploymentWithEagerRelations.service;
    }
}
