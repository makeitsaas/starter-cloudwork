import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import { Service } from '@entities/infrastructure/service';
import { Environment } from '@entities';
import { ComputingAllocation } from '@entities/infrastructure/computing-allocation';
import { DatabaseAllocation } from '@entities/infrastructure/database-allocation';

@Entity()
export class ServiceDeployment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    status: string = 'init';     // pending, running, failed, stopped, down

    @Column()
    type: string = 'default';

    @ManyToOne(type => Service, { eager: true })
    service: Service;

    @ManyToOne(type => Environment, { eager: true })
    environment: Environment;

    @ManyToOne(() => ComputingAllocation, {eager: true, nullable: true})
    computingAllocation?: ComputingAllocation;

    @ManyToOne(() => DatabaseAllocation, {eager: true, nullable: true})
    databaseAllocation?: DatabaseAllocation;

    @CreateDateColumn({type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({type: 'timestamp'})
    updatedAt: Date;
}
