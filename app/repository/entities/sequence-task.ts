import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Sequence } from '@entities/sequence';

@Entity()
export class SequenceTask {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => Sequence, sequence => sequence.tasks, { onDelete: 'CASCADE' })
    sequence: Sequence;

    @Column()
    taskType: string;

    @Column('json')
    parameters: any;

    @Column()
    position: number;

    @Column()
    isStarted: boolean = false;

    @Column()
    isOver: boolean = false;

    @Column({type: "text", nullable: true})
    error?: string;
}
