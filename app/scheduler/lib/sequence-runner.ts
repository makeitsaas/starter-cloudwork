// takes a Sequences, read it step by step and launches playbooks

import { EnvironmentVault, Sequence, SequenceTask, Session } from '@entities';

export class SequenceRunner {
    readonly _session: Session;

    constructor(session: Session) {
        this._session = session
    }

    async runSequence(sequenceId: number) {
        console.log(`run Sequence ${sequenceId}`);
        const em = await this._session.em();
        const seq = await em.getRepository(Sequence).findOneOrFail({where: {id: sequenceId}, relations: ['tasks']});
        seq.isStarted = true;
        await this._session.saveEntity(seq);
        await this.testVault();

        const orderedTasks = seq.getTasksInOrder();

        for(let i in orderedTasks) {
            await this.runSequenceTask(seq, orderedTasks[i]);
        }

        seq.isOver = true;
        await this._session.saveEntity(seq);

        return seq;
    }

    continueSequence() {

    }

    reRunFromBeginning() {

    }

    async runSequenceTask(sequence: Sequence, task: SequenceTask) {
        if(!task.isOver) {
            console.log(`run task (position: ${task.position}, type: ${task.taskType})`);
            task.isStarted = true;
            await this._session.saveEntity(task);
            await this.fakeDelay();
            task.isOver = true;
            await this._session.saveEntity(task);
        } else {
            console.log(`task already done (position: ${task.position}, type: ${task.taskType})`);
        }
    }

    fakeDelay(): Promise<void> {
        return new Promise(resolve => setTimeout(() => resolve(), 1000));
    }

    async testVault(): Promise<void> {
        const vault: EnvironmentVault = await this._session.getVault('1');
        console.log('vault id =', vault.id);
        console.log('password', vault.getValue('password'));
        vault.addValue('password', 'secret1234');

        await vault.save();
    }
}
