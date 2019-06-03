import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import * as yaml from 'js-yaml';
import { Sequence } from '@entities';


@Entity()
export class Order {

    @PrimaryGeneratedColumn()
    id: number;

    @Column("text")
    specs: string;

    @Column()
    isValid: boolean = false;

    @Column()
    environmentId: string = '';

    @OneToMany(type => Sequence, sequence => sequence.order, { onDelete: 'CASCADE' })
    sequences: Sequence[];

    @CreateDateColumn({type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({type: 'timestamp'})
    updatedAt: Date;

    constructor(specs?: string) { // maybe uuid + specs
        if(specs) {
            this.specs = specs;
            this.isValid = !!this.parseSpecs();
        }
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
        return this.parseSpecs() || {};
    }

    private parseSpecs(): any {
        try {
            return yaml.safeLoad(this.specs);
        } catch(e) {
            console.error('parse error', e);
            return null;
        }
    }
}
