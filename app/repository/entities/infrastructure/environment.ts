import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { Order, Sequence } from '@entities';

@Entity()
export class Environment {
    @PrimaryColumn()
    uuid: string;

    @OneToMany(type => Order, order => order.environment, {onDelete: 'CASCADE'})
    orders: Order[];

    @CreateDateColumn({type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({type: 'timestamp'})
    updatedAt: Date;
}
