import {
    Column,
    CreateDateColumn,
    Entity, ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import { ServerPort } from '@entities';

@Entity()
export class ComputingAllocation {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    status: string = 'running';

    @Column()
    type: string = 'server-port';    // available, to release

    @ManyToOne(type => ServerPort, {cascade: true, nullable: true, eager: true})
    allocatedPort: Promise<ServerPort>;

    @CreateDateColumn({type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({type: 'timestamp'})
    updatedAt: Date;
}
