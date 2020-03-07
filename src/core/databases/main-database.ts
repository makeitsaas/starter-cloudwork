import { createConnection } from "typeorm";

export const dbMainLoader = createConnection({
    type: "mysql",
    host: process.env.DEPLOY_DB_HOSTNAME || 'localhost',
    port: 3306,
    username: process.env.DEPLOY_DB_USERNAME || "root",
    password: process.env.DEPLOY_DB_PASSWORD || "password",
    database: process.env.DEPLOY_DB_DATABASE || "mydatabase",
    entities: [
        __dirname + "/../../domains/example/entities/*.js",
        __dirname + "/../../domains/example/entities/*.ts",
        __dirname + "/../../domains/clusters/entities/*.js",
        __dirname + "/../../domains/clusters/entities/*.ts",
    ],
    synchronize: true,
    logging: false
}).then(connection => {
    // here you can start to work with your entities
    return connection;
}).catch(error => {
    throw error;
});
