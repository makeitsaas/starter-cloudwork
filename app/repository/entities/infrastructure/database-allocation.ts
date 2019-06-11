import {
    Column,
    CreateDateColumn,
    Entity, ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import { Server } from '@entities';

@Entity()
export class DatabaseAllocation {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    status: string = 'running';

    @Column()
    type: string = 'devkit';

    @ManyToOne(type => Server, { cascade: true, nullable: true, eager: true })
    server?: Promise<Server>;

    @ManyToOne(type => Server, { cascade: true, nullable: true, eager: true })
    bastion?: Promise<Server>;

    @CreateDateColumn({type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({type: 'timestamp'})
    updatedAt: Date;
}
