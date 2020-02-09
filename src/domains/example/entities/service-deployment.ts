import {
    Column,
    CreateDateColumn,
    Entity, EntityManager,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import { Environment } from './environment';
import { em } from '@decorators';

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
    type: ('angular' | 'api-node-v1' | 'default') = 'default';

    @ManyToOne(type => Environment, {eager: true})
    environment: Environment;

    @Column()
    path: string;

    @Column("simple-array")
    tags: string[] = [];

    @Column({nullable: true})
    repositoryVersion?: string;

    @CreateDateColumn({type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({type: 'timestamp'})
    updatedAt: Date;

    isAPIDeployment() {
        return /^(api|node)/.test(this.type);
    }

}
