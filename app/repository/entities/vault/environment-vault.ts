import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { AbstractSessionAwareEntity } from '@entities';
// import { AbstractSessionAwareEntity } from '@entities';
const secret = process.env.VAULT_SECRET;
const cryptoJSON = require('crypto-json');

if(!secret) {
    throw new Error('VAULT_SECRET shall be defined');
}

@Entity()
export class EnvironmentVault extends AbstractSessionAwareEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column("json")
    encryptedVault: any = {};

    @Column()
    environmentUuid: string = '';

    @CreateDateColumn({type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({type: 'timestamp'})
    updatedAt: Date;

    getValues(): {[k: string]: any} {
        if(!this.encryptedVault)
            this.encryptedVault = {};
        return cryptoJSON.decrypt(this.encryptedVault, secret);
    }

    getValue(key: string) {
        return this.getValues()[key];
    }

    addValue(key: string, value: any) {
        let values = this.getValues();
        values[key] = value;
        this.encryptedVault = cryptoJSON.encrypt(values, secret);
    }
}
