import {
    Column,
    CreateDateColumn,
    Entity,
    EntityManager,
    OneToMany,
    PrimaryColumn,
    UpdateDateColumn
} from 'typeorm';
import { ServiceDeployment } from './service-deployment';
import { em } from '@decorators';

interface DiscoveryElement {
    url: string;
    hosts: string[];
    secureHosts: string[];
    path: string;
    tags: string[];
    mode: string;
}

type DiscoveryConfigType = {
    front: { [key: string]: DiscoveryElement }
    api: { [key: string]: DiscoveryElement }
}

@Entity()
export class Environment {
    @em('main')
    private em: EntityManager;

    @PrimaryColumn()
    uuid: string;

    @Column({type: 'json'})
    configuration: { domains: { front: string[], api: string[] } } = {domains: {front: [], api: []}};

    @OneToMany(type => ServiceDeployment, deployment => deployment.environment, {onDelete: 'CASCADE'})
    deployments: Promise<ServiceDeployment[]>;

    @CreateDateColumn({type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({type: 'timestamp'})
    updatedAt: Date;

    async generateDiscoveryConfig(): Promise<DiscoveryConfigType> {
        // const deployments = await this.deployments;
        const discovery: DiscoveryConfigType = {
            front: {},
            api: {}
        };
        // await Promise.all(deployments.map(async deployment => {
        //     const code = `code`;
        //     const path = deployment.path;
        //     if (code) {
        //         if (deployment.isAPIDeployment()) {
        //             discovery.api[code] = {
        //                 url: `http://${this.configuration.domains.api[0]}${path}`,
        //                 hosts: this.configuration.domains.api,
        //                 secureHosts: [],
        //                 path: path,
        //                 tags: deployment.tags,
        //                 mode: 'normal'
        //             }
        //         } else {
        //             discovery.front[code] = {
        //                 url: `http://${this.configuration.domains.front[0]}${path}`,
        //                 hosts: this.configuration.domains.front,
        //                 secureHosts: [],
        //                 path: path,
        //                 tags: deployment.tags,
        //                 mode: 'normal'
        //             }
        //         }
        //     }
        //
        // }));

        return discovery;
    }
}
