// mettre en place la séquence et les jobs
// operations de bases pour situer le statut des jobs, lequel à traiter, puis mettre à jour
// conversion order => sequence

import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { SequenceTask } from '@entities/sequence-task';

@Entity()
export class Sequence {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    orderId?: string;   // add foreign key when order.id origin is stabilized (local id or uuid from outside)

    @Column()
    sequenceType: string;

    @Column({type: 'json', nullable: true})
    parameters?: string|null = null;

    @OneToMany(type => SequenceTask, task => task.sequence)
    tasks: SequenceTask[];

    @Column()
    isStarted: boolean = false;

    @Column()
    isOver: boolean = false;

    @CreateDateColumn({type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({type: 'timestamp'})
    updatedAt: Date;
}
