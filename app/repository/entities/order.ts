import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import * as yaml from 'js-yaml';


@Entity()
export class Order {

    @PrimaryGeneratedColumn()
    id: number;

    @Column("text")
    specs: string;

    @Column()
    environmentId: string = '';

    @CreateDateColumn({type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({type: 'timestamp'})
    updatedAt: Date;

    constructor(specs?: string) { // maybe uuid + specs
        if(specs)
            this.specs = specs;
        if(!this.environmentId)
            this.environmentId = this.getEnvironmentId();
    }

    getEnvironmentId() {
        return this.getParsedSpecs().environment_id || this.getParsedSpecs().environmentId || '';
    }

    getDomains(): string[] {
        return this.getParsedSpecs().domains;
    }

    getServices(): any[] {
        return this.getParsedSpecs().services
    }

    private getParsedSpecs(): any {
        try {
            return yaml.safeLoad(this.specs) || {};
        } catch(e) {
            console.error('parse error', e);
            return {};
        }
    }
}
