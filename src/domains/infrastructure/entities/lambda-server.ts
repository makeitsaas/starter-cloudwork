import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class LambdaServer {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    status: 'starting'|'running'|'stopped'|'unhealthy' = 'starting';

    @Column()
    type: 'angular'|'python'|'docker' = 'angular';

    @Column()
    ip: string;

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

    hasReachedTimeout(): boolean {
        const timeoutTimestamp = this.createdAt.getTime() + this.timeout * 1000,
                nowTimestamp = (new Date()).getTime();

        return timeoutTimestamp > nowTimestamp;
    }
}
