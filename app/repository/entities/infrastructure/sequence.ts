import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne, EntityManager
} from "typeorm";
import { SequenceTask } from '@entities';
import { Order } from '@entities';
import { ConfigReader } from '../../../scheduler/lib/config-reader';

@Entity()
export class Sequence {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => Order, order => order.sequences, { onDelete: 'CASCADE' })
    order: Order;

    @Column()
    sequenceType: string;

    @Column({type: 'json', nullable: true})
    parameters?: string|null = null;

    @OneToMany(type => SequenceTask, task => task.sequence, { onDelete: 'CASCADE' })
    tasks: SequenceTask[];

    @Column()
    isStarted: boolean = false;

    @Column()
    isOver: boolean = false;

    @CreateDateColumn({type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({type: 'timestamp'})
    updatedAt: Date;

    constructor(order?: Order) {
        if(order) {
            this.fromOrder(order);
        }
    }

    fromOrder(order: Order) {
        this.order = order;
        this.sequenceType = 'environment-update';

        const blueprint = ConfigReader.sequenceBlueprint(this.sequenceType);
        this.tasks = blueprint.tasks.map((taskCode: any, i: number) => {
            let task = new SequenceTask();
            task.taskType = taskCode;
            task.parameters = {};
            task.position = i;
            return task;
        });
    }

    saveDeep(em: EntityManager) {
        // em only saves the first level entity, not sub-ones
        // https://github.com/typeorm/typeorm/issues/1025
        return em.save(this).then(savedSeq => {
            return Promise.all([
                ...this.tasks.map(task => em.save(task))
            ]).then(() => savedSeq);
        });
    }

    getTasksInOrder() {
        return this.tasks.sort((t1, t2) => {
           if(t1.position < t2.position) {
               return -1;
           } else if(t1.position > t2.position) {
               return 1;
           } else {
               return 0;
           }
        });
    }
}
