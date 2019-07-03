import {createConnection} from "typeorm";

export const vaultDbLoader = createConnection({
    type: "mysql",
    host: process.env.DEPLOY_DB_HOSTNAME || 'localhost',
    port: 3306,
    username: process.env.DEPLOY_DB_USERNAME || "root",
    password: process.env.DEPLOY_DB_PASSWORD || "password",
    database: process.env.DEPLOY_DB_DATABASE || "deployment",
    entities: [
        __dirname + "/../../domains/vault/entities/*.js",
        __dirname + "/../../domains/vault/entities/*.ts",
    ],
    synchronize: true,
    logging: false
}).then(connection => {
    // here you can start to work with your entities
    return connection;
}).catch(error => {
    throw error;
});
