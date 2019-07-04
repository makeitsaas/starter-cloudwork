import { Column, CreateDateColumn, EntityManager, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { em, _EM_ } from '@decorators';

const secret = process.env.VAULT_SECRET;

if(!secret) {
    throw new Error('VAULT_SECRET shall be defined');
}

const encryptor = require('simple-encryptor')(secret);

export abstract class AbstractBaseVault {

    @PrimaryGeneratedColumn()
    id: number;

    @Column("json")
    encryptedVault: any = {};

    @CreateDateColumn({type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({type: 'timestamp'})
    updatedAt: Date;

    getValues(): {[k: string]: any} {
        if(!this.encryptedVault)
            this.encryptedVault = {};
        return encryptor.decrypt(this.encryptedVault) || {};
    }

    getValue(key: string) {
        const upKey = key.toUpperCase();
        const lowKey = key.toLocaleLowerCase();
        return this.getValues()[lowKey] || this.getValues()[upKey] || this.getValues()[key];
    }

    addValue(key: string, value: any) {
        let values = this.getValues(),
            lowKey = key.toLocaleLowerCase();
        values[lowKey] = value;
        this.encryptedVault = encryptor.encrypt(values);
    }


    /**
     * AbstractSessionAwareEntity Legacy => refactor to Value object
     */
    @em(_EM_.vault)
    protected _em: EntityManager;

    save(): Promise<any> {
        return this._em.save(this);
    }
}
