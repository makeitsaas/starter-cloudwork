import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { Order, Sequence, Server } from '@entities';

@Entity()
export class Environment {
    @PrimaryColumn()
    uuid: string;

    @OneToMany(type => Order, order => order.environment, {onDelete: 'CASCADE'})
    orders: Order[];

    @ManyToOne(type => Server, { nullable: true })
    proxy?: Promise<Server>;

    @CreateDateColumn({type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({type: 'timestamp'})
    updatedAt: Date;
}
