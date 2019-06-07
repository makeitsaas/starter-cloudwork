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

    @ManyToOne(type => Order, order => order.sequences, { cascade: true, eager: true })
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

    saveDeep(em: EntityManager): Promise<Sequence> {
        // em only saves the first level entity, not sub-ones
        // https://github.com/typeorm/typeorm/issues/1025
        return em.save(this).then(savedSeq => {
            return Promise.all([
                ...this.tasks.map(task => this.saveTask(em, task))
            ]).then(() => savedSeq);
        });
    }

    private saveTask(em: EntityManager, task: SequenceTask): Promise<SequenceTask> {
        task.sequence = this;
        return em.save(task);
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

    taskRequirement() {
        // list all services required in order specifications
        // list previous service deployments
        // if a service is new, setup vault, register for allocation, database setup, compute setup
        // if a service already exists and is still required, register for database and compute update
        // if a service is no longer required, register for deletion (cleanup task)
    }

    taskProxy() {
        // get config from order specs
        // execute proxy ansible script
    }
}
