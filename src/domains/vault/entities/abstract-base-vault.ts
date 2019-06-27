import { Column, CreateDateColumn, EntityManager, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Session } from '@session';

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
    protected _session: Session;
    protected _em: EntityManager;

    assignSession(session: Session) {
        this._session = session;
    }

    assignEm(em: EntityManager) {
        this._em = em;
    }

    save(): Promise<any> {
        return this._em.save(this);
    }
}
