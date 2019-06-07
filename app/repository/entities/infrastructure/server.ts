import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ServerPort } from '@entities';

@Entity()
export class Server {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    status: 'starting'|'running'|'stopped'|'unhealthy' = 'starting';

    @Column()
    type: 'computing'|'devkit' = 'computing';

    @Column()
    ip: string;

    @OneToMany(type => ServerPort, port => port.server, {onDelete: 'CASCADE'})
    ports: ServerPort[];

    @CreateDateColumn({type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({type: 'timestamp'})
    updatedAt: Date;
}
