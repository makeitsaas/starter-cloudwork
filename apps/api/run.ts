import '@configure-once';
import { Main } from '../../src/main';
import { createServer } from './lib/createServer';
import { ClusterModule } from '../../src/domains/clusters/cluster.module';
import { isAuthenticated } from './middleware/isAuthenticated';

const app = new Main();

app.ready.then(() => {
    const server = createServer();
    const clusterModule = new ClusterModule();
    server.get('/clusters', isAuthenticated, async (req, res) => {
        const clusters = await clusterModule.getClusters();
        res.send({
            clusters
        });
    });
}).catch(err => {
    console.log('error\n', err);
});
