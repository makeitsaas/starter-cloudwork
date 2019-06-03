import { Session } from '@entities';
import { EntityManager } from 'typeorm';

export abstract class AbstractSessionAwareEntity {
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

    saveDeep() {

    }
}