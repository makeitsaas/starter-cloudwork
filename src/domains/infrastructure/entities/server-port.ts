import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Server } from '@entities';

@Entity()
export class ServerPort {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    status: string = 'busy';    // available, to release

    @Column()
    port: number;

    @ManyToOne(type => Server, server => server.ports, { onDelete: 'CASCADE' })
    server: Promise<Server>;

    @CreateDateColumn({type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({type: 'timestamp'})
    updatedAt: Date;
}
