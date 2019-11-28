import {
    Column,
    CreateDateColumn,
    Entity, EntityManager, JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import * as yaml from 'js-yaml';
import { Environment, ServiceSpecification } from '@entities';
import { em } from '../../../core/decorators/entity-manager-property';

class OrderSpecUpdate {
    action = "update";
    environment_id: string;
    api?: {
        domains: string[],
        services: ServiceSpecification[]
    };
    front?: {
        domains: string[],
        services: ServiceSpecification[]
    };
}

type OrderSpec = OrderSpecUpdate;


@Entity()
export class Order {

    @em('main')
    private em: EntityManager;

    @PrimaryGeneratedColumn()
    id: number;

    // todo : add index and type CHAR 36
    @Column("text")
    orderUuid: string;

    @Column("text")
    userUuid: string;

    @Column("text")
    specs: string;

    @Column()
    isValid: boolean = false;

    @ManyToOne(type => Environment, env => env.orders, {cascade: true, eager: true})
    @JoinColumn()
    environment: Environment;

    // @OneToMany(type => Sequence, sequence => sequence.order, {onDelete: 'CASCADE'})
    // sequences: Sequence[];

    @CreateDateColumn({type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({type: 'timestamp'})
    updatedAt: Date;

    parsedSpecs: OrderSpec;

    constructor(specs?: string) { // maybe uuid + specs
        if (specs) {
            this.specs = specs;
            if (!!this.getParsedSpecs()) {
                const env = new Environment();
                env.uuid = this.getEnvironmentUuid();
                this.environment = env;
                this.isValid = true;
            }
        }
    }

    getEnvironmentUuid() {
        return this.getParsedSpecs().environment_id;
    }

    getAPIDomains(): string[] {
        const parsed = this.getParsedSpecs();
        return parsed.api && parsed.api.domains || [];
    }

    getFrontDomains(): string[] {
        const parsed = this.getParsedSpecs();
        return parsed.front && parsed.front.domains || [];
    }

    getServicesSpecifications(): ServiceSpecification[] {
        return [
            ...this.getFrontServicesSpecifications(),
            ...this.getAPIServicesSpecifications()
        ];
    }

    getFrontServicesSpecifications(): ServiceSpecification[] {
        const parsed = this.getParsedSpecs();
        return parsed.front && parsed.front.services || [];
    }

    getAPIServicesSpecifications(): ServiceSpecification[] {
        const parsed = this.getParsedSpecs();
        return parsed.api && parsed.api.services || [];
    }

    getServiceSpecificationByUuid(serviceUuid: string): ServiceSpecification | void {
        return this.getServicesSpecifications().filter(spec => spec.uuid === serviceUuid)[0];
    }

    async saveDeep(): Promise<Order> {
        await this.em.save(this.environment);
        return await this.em.save(this);
    }

    private getParsedSpecs(): OrderSpecUpdate {
        try {
            const spec = yaml.safeLoad(this.specs);
            // add verification here
            return spec;
        } catch (e) {
            console.error('error when parsing order specifications', this.specs, e);
            throw e;
        }
    }
}
