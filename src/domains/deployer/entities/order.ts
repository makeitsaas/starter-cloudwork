import {
    Column,
    CreateDateColumn,
    Entity, EntityManager, JoinColumn, JoinTable,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import * as yaml from 'js-yaml';
import { Environment, Sequence, ServiceSpecification } from '@entities';


@Entity()
export class Order {

    @PrimaryGeneratedColumn()
    id: number;

    @Column("text")
    specs: string;

    @Column()
    isValid: boolean = false;

    @ManyToOne(type => Environment, env => env.orders, { cascade: true, eager: true })
    @JoinColumn()
    environment: Environment;

    @OneToMany(type => Sequence, sequence => sequence.order, {onDelete: 'CASCADE'})
    sequences: Sequence[];

    @CreateDateColumn({type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({type: 'timestamp'})
    updatedAt: Date;

    constructor(specs?: string) { // maybe uuid + specs
        if (specs) {
            this.specs = specs;
            this.isValid = !!this.parseSpecs();
            if(this.isValid) {
                const env = new Environment();
                env.uuid = this.getEnvironmentUuid();
                this.environment = env;
            }
        }
    }

    getEnvironmentUuid() {
        return this.getParsedSpecs().environment_id || this.getParsedSpecs().environmentId || '';
    }

    getDomains(): string[] {
        return this.getParsedSpecs().domains || [];
    }

    getServices(): ServiceSpecification[] {
        // ok actuellement on a une liste de services specs, avec le path
        // comment retourner ça pour qu'on distingue service, service deployment, path
        return (this.getParsedSpecs().services || []).map((spec: any) => new ServiceSpecification(spec));
    }

    async saveDeep(em: EntityManager): Promise<Order> {
        await em.save(this.environment);
        return await em.save(this);
    }

    private getParsedSpecs(): any {
        return this.parseSpecs() || {};
    }

    private parseSpecs(): any {
        try {
            return yaml.safeLoad(this.specs);
        } catch (e) {
            console.error('parse error', e);
            return null;
        }
    }
}
