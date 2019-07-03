import { EntitySchema, ObjectType, Repository } from 'typeorm';
import { Container } from '@core';

export interface InjectedEM {
    getRepository: <Entity>(target: ObjectType<Entity> | EntitySchema<Entity> | string) => Repository<Entity>
    save: <Entity>(target: Entity) => Promise<Entity>
}

export function entityManager(target: Object, propertyName: string, index?: number) {
    Container.ready.then(() => {
        Object.defineProperty(target, propertyName, {
            value: Container.databases.main.manager
        });
    });
    // const emPromise = Container.databases.main.then(connection => connection.manager);
    // const em = {
    //     getRepository<Entity>(target: ObjectType<Entity> | EntitySchema<Entity> | string) {
    //         return emPromise.then(em => em.getRepository(target))
    //     },
    //     save<Entity>(e: Entity) {
    //         return emPromise.then(em => em.save(e));
    //     }
    // };
    //
    // Object.defineProperty(target, propertyName, {
    //     value: em
    // });
}
