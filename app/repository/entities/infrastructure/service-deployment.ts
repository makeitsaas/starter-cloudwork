import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Service } from '@entities/infrastructure/service';
import { Environment } from '@entities';

@Entity()
export class ServiceDeployment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    status: string;     // pending, running, failed, stopped, down

    @Column()
    type: string;

    @ManyToOne(type => Service)
    service: Service;

    @ManyToOne(type => Environment)
    environment: Environment;

    @CreateDateColumn({type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({type: 'timestamp'})
    updatedAt: Date;
}
