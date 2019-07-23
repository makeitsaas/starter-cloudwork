import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Service {
    @PrimaryColumn()
    uuid: string;

    @Column()
    repositoryUrl: string;

    @Column()
    type: ('angular'|'api-node-v1'|'default') = 'default';

    @CreateDateColumn({type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({type: 'timestamp'})
    updatedAt: Date;
}
