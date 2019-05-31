// import "reflect-metadata";
import {createConnection} from "typeorm";
import { Order, Sequence, SequenceTask } from '@entities';

export const dbLoader = createConnection({
    type: "mysql",
    host: process.env.DEPLOY_DB_HOSTNAME || 'localhost',
    port: 3306,
    username: process.env.DEPLOY_DB_USERNAME || "root",
    password: process.env.DEPLOY_DB_PASSWORD || "password",
    database: process.env.DEPLOY_DB_DATABASE || "deployer",
    entities: [
        Sequence,
        SequenceTask,
        Order
    ],
    synchronize: true,
    logging: false
}).then(connection => {
    // here you can start to work with your entities
    return connection;
}).catch(error => console.log(error));
