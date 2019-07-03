import { createConnection } from "typeorm";

export const dbMainLoader = createConnection({
    type: "mysql",
    host: process.env.DEPLOY_DB_HOSTNAME || 'localhost',
    port: 3306,
    username: process.env.DEPLOY_DB_USERNAME || "root",
    password: process.env.DEPLOY_DB_PASSWORD || "password",
    database: process.env.DEPLOY_DB_DATABASE || "deployment",
    entities: [
        __dirname + "/../../domains/deployment/entities/*.js",
        __dirname + "/../../domains/deployment/entities/*.ts",
        __dirname + "/../../domains/infrastructure/entities/*.js",
        __dirname + "/../../domains/infrastructure/entities/*.ts",
        __dirname + "/../../domains/pipeline/entities/*.js",
        __dirname + "/../../domains/pipeline/entities/*.ts",
    ],
    synchronize: true,
    logging: false
}).then(connection => {
    // here you can start to work with your entities
    return connection;
}).catch(error => {
    throw error;
});
