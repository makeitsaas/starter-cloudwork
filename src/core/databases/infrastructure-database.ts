// import "reflect-metadata";
import {createConnection} from "typeorm";

export const dbLoader = createConnection({
    type: "mysql",
    host: process.env.DEPLOY_DB_HOSTNAME || 'localhost',
    port: 3306,
    username: process.env.DEPLOY_DB_USERNAME || "root",
    password: process.env.DEPLOY_DB_PASSWORD || "password",
    database: process.env.DEPLOY_DB_DATABASE || "deployer",
    entities: [
        __dirname + "/../../domains/deployer/entities/*.js",
        __dirname + "/../../domains/deployer/entities/*.ts",
        __dirname + "/../../domains/infrastructure/entities/*.js",
        __dirname + "/../../domains/infrastructure/entities/*.ts",
    ],
    synchronize: true,
    logging: false
}).then(connection => {
    // here you can start to work with your entities
    return connection;
}).catch(error => {
    throw error;
});
