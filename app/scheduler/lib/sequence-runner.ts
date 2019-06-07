// A SequenceRunner coordinates macro-tasks
// A SequenceOperator executes macro-tasks
// A Sequence is a list of things to do/done (create/update/delete environment, ...)

import { Environment, EnvironmentVault, Order, Sequence, SequenceTask, Session } from '@entities';
import { SequenceOperator } from '@entities/local/sequence-operator';
import { FakeDelay } from '../../fake/fake-delay';

export class SequenceRunner {
    readonly ready: Promise<any>;
    private sequence: Sequence;
    private order: Order;
    private environment: Environment;
    private orderedTasks: SequenceTask[];
    private vault: EnvironmentVault;
    private operator: SequenceOperator;

    constructor(
        readonly _session: Session,
        readonly sequenceId: number
    ) {
        this.ready = this.prepareRunner();
    }

    private async prepareRunner(): Promise<any> {
        console.log(`prepare runner for Sequence ${this.sequenceId}`);
        this.sequence = await this.retrieveSequence();
        this.order = this.sequence.order;
        this.environment = this.order.environment;
        this.orderedTasks = this.sequence.getTasksInOrder();
        this.vault = await this.getVault(this.environment.uuid);
        this.operator = new SequenceOperator(this._session, this.environment, this.sequence, this.order, this.vault);
        await this.operator.prepare();
    }

    /*
     * ---------------
     * Public methods
     * ---------------
     */

    async runSequence(): Promise<Sequence> {
        await this.ready;
        await this.checkIfCanBeStartedOrFail();
        await this.markAsStarted();

        for (let i in this.orderedTasks) {
            await this.runSequenceTask(this.orderedTasks[i]);
        }

        await this.markAsOver();

        return this.sequence;
    }

    // async reRunFromBeginning() {
    //     console.log('xxxx cleanup not implemented');
    //     console.log('xxxx this.runSequence()');
    // }

    /*
     * ---------------
     * Private methods
     * ---------------
     */

    private async checkIfCanBeStartedOrFail(): Promise<boolean> {
        console.log('-> check if can start', true);
        return true;
    }

    private async markAsStarted() {
        console.log('-> mark sequence as started');
        this.sequence.isStarted = true;
        await this._session.saveEntity(this.sequence);
    }

    private async markAsOver() {
        console.log('-> mark sequence as over');
        this.sequence.isOver = true;
        await this._session.saveEntity(this.sequence);
    }

    private async retrieveSequence(): Promise<Sequence> {
        const em = await this._session.em();
        return await em.getRepository(Sequence).findOneOrFail({where: {id: this.sequenceId}, relations: ['tasks']});
    }

    private async runSequenceTask(task: SequenceTask) {
        if (!task.isOver) {

            if (task.hasPendingScript()) {
                throw new Error(`task(${task.id}) has pending script`);
            }

            console.log(`----> run task (position: ${task.position}, type: ${task.taskType})`);
            // task.isStarted = true;
            // await this._session.saveEntity(task);

            await this.runTaskOperations(task);

            // task.isOver = true;
            // await this._session.saveEntity(task);

            await FakeDelay.wait();
        } else {
            console.log(`---> task already done (position: ${task.position}, type: ${task.taskType})`);
        }
    }

    private async getVault(environmentUuid: string): Promise<EnvironmentVault> {
        const vault: EnvironmentVault = await this._session.getVault(environmentUuid);
        // vault.addValue('password', 'secret1234');
        // await vault.save();

        return vault;
    }

    private async runTaskOperations(task: SequenceTask) {
        switch (task.taskType) {
            case 'allocate':
                await this.operator.launchAllocations();
                break;
            case 'setup-vaults':
                await this.operator.launchVaultsSetup();
                break;
            case 'setup-compute':
                await this.operator.launchServicesSetup();
                break;
            case 'drop-compute':
                await this.operator.launchServicesDrop();
                break;
            case 'update-proxy':
                await this.operator.launchProxyRefresh();
                break;
            case 'drop-proxy':
                await this.operator.launchProxyDrop();
                break;
            case 'cleanup':
                await this.operator.launchCleanup();
                break;
            default:
                console.log('-----> nothing to do');
        }
    }
}
