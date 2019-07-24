import { Column, CreateDateColumn, Entity, EntityManager, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { _EM_, em } from '../../../core/decorators/entity-manager-property';
import { service } from '../../../core/decorators/service-property';
import { AwsService } from '../services/aws.service';

@Entity()
export class LambdaServer {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    status: 'starting'|'running'|'stopped'|'unhealthy' = 'starting';

    @Column()
    type: 'nodejs'|'python'|'docker' = 'nodejs';

    @Column()
    ip: string;

    @Column()
    instanceId: string;

    @Column()
    tmpDirectory: string = '/srv/lambda-0';

    @Column()
    timeout: number = 5 * 60;

    @Column()
    stoppedAfterTimeout: boolean = false;

    @CreateDateColumn({type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({type: 'timestamp'})
    updatedAt: Date;

    @em(_EM_.infrastructure)
    private em: EntityManager;

    @service
    awsService: AwsService;

    hasReachedTimeout(): boolean {
        const timeoutTimestamp = this.createdAt.getTime() + this.timeout * 1000,
                nowTimestamp = (new Date()).getTime();

        return timeoutTimestamp > nowTimestamp;
    }

    async release(): Promise<LambdaServer> {
        await this.awsService.terminateEC2Instance(this.instanceId);
        this.stoppedAfterTimeout = this.hasReachedTimeout();
        this.status = 'stopped';

        return this.em.save(this);
    }
}
