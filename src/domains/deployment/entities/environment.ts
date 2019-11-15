import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { Order, Sequence, Server, ServiceDeployment } from '@entities';

@Entity()
export class Environment {
    @PrimaryColumn()
    uuid: string;

    @Column({type: 'json'})
    configuration: {domains:{front: string[], api: string[]}} = {domains: {front: [], api: []}};

    @OneToMany(type => Order, order => order.environment, {onDelete: 'CASCADE'})
    orders: Order[];

    @OneToMany(type => ServiceDeployment, deployment => deployment.environment, {onDelete: 'CASCADE'})
    deployments: Promise<ServiceDeployment[]>;

    @ManyToOne(type => Server, { nullable: true })
    proxy?: Promise<Server>;

    @CreateDateColumn({type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({type: 'timestamp'})
    updatedAt: Date;
}
