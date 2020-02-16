import { Main } from '../../../src/main';
import { Playbook } from '../../../ansible-package/playbook';

export const CliCreateClusterHandler = async (program: any, app: Main): Promise<any> => {
    console.log('*** (create cluster entry)');
    await createManager();
    await createWorker();
    console.log('*** push react image as docker stack');
    console.log('*** (wait and check if ok => mark entry status)');
    app.exit();
};


const createManager = async () => {
    console.log('*** create manager (start instance, start docker-swarm, get token key, store this key');
    const playbook = new Playbook(
        'playbook/hello-world.yml',
        {message: "Hello Server !"},
        {dynamic_hosts: ['3.121.138.238']});
    await playbook.setupDirectory();
    await playbook.execute();
};

const createWorker = async () => {
    console.log('*** create worker (start instance, start docker-swarm, recover master key, link to master');
};
