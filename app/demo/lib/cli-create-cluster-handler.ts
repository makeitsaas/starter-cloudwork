import { Main } from '../../../src/main';
import { ClusterModule } from '../../../src/domains/clusters/cluster.module';
import { parseStepLineJSON, Playbook, readStep } from '@ansible';
import { Cluster } from '../../../src/domains/clusters/entities/cluster.entity';

/*
    TODO quick :
      - avoir la procédure comme suit pour créer un cluster à distance (lancer les vms, init docker swarm, récupération du token, join docker swarm, deploy d'une stack)
      - Modélisation : domaines, entités, "service-entité", services avec liste des usecases
      - Mettre en place les workflow principaux, qui permettent de faire fonctionner tout le cycle de vie (projet > stacks > deployments > workers/managers < cluster)
      - documenter, illustrer, partager

      Setup agile :
      modèles simples, mise en place efficace, sécuriser les outils de manipulation du système : specs, infra, actions
      classer, reclasser les dossiers au fur et à mesure des problématiques rencontrées
      Au-delà des domaines métier, les drivers/packages tech pour "mettre en place du contexte" => englobe la complexité externe
 */

const clusterModule = new ClusterModule();

interface JoinTokensInterface {
    Manager: string
    Worker: string
}

export const CliCreateClusterHandler = async (program: any, app: Main): Promise<any> => {
    const cluster = await createNewCluster();
    const joinTokens = await createManager(cluster);
    await createWorker(cluster, joinTokens);
    await deployStack(cluster);
    console.log('*** (wait and check if ok => mark entry status)');
    // todos
    // create instance from ami-033e388afef4f8d4d
    // # docker swarm init/join
    // security group for all trafic inside network
    // security group for ssh from  "infrastructure instance"
    // security group for inbound http
    // # docker stack deploy -c docker-compose.yml my-basic-react
    app.exit();
};

const createNewCluster = async (): Promise<Cluster> => {
    console.log('*** (create cluster entry)');
    return await clusterModule.createCluster();
};

const createManager = async (cluster: Cluster) => {
    console.log('*** create manager (start instance, start docker-swarm, get token key, store this key');
    const managerIp = await cluster.getManagerIp(); // dirty hack for the moment, the node is created but not used
    if (managerIp) {
        console.log('manager ip :', managerIp);
        const results = await runSwarmInit(managerIp);
        console.log('resuts to read', results);
        const swarmStep = readStep(results, "Exec swarm init");
        const swarmStepInfo = parseStepLineJSON(swarmStep.lines[0]);
        const joinTokens: JoinTokensInterface = swarmStepInfo.swarm_facts.JoinTokens;
        console.log("have to get ip from ", swarmStepInfo.swarm_facts);
        console.log('you can join as a worker using token', joinTokens.Worker);
        return joinTokens;
    } else {
        throw new Error("createManager failed (no node)")
    }
};

const createWorker = async (cluster: Cluster, joinTokens: JoinTokensInterface) => {
    console.log("\n\n*** create worker (start instance, start docker-swarm, recover master key, link to master");
    const manager = await cluster.getManagerNode();
    if(manager) {
        const workerNode = await clusterModule.addNodeToCluster(cluster);
        const workerInstance = await workerNode.instance;
        const workerPublicIp = await workerInstance.getPublicIp();
        const workerPrivateIp = await workerInstance.getPrivateIp();
        const managerPrivateIp = await (await manager.instance).getPrivateIp();
        const result = await runSwarmJoin(workerPublicIp, workerPrivateIp, managerPrivateIp, joinTokens.Worker);
        console.log(result);

        return result;
    } else {
        throw new Error("Cannot createWorker: no managerIp");
    }
};

const deployStack = async (cluster: Cluster) => {
    console.log('*** push react image as docker stack');
    const managerPublicIp = await cluster.getManagerIp();
    if(managerPublicIp) {
        const result = await runDeployStack(managerPublicIp);
    } else {
        throw new Error("Cannot deployStack: no managerIp");
    }
};


/**
 * Utils
 */

const runSwarmInit = async (managerPublicIp: string) => {
    const playbook = new Playbook(
        'playbooks/swarm-init.yml',
        {message: "Hello Server !"},
        {dynamic_hosts: [managerPublicIp]});
    await playbook.setupDirectory();
    return await playbook.execute();
};

const runSwarmJoin = async (workerPublicIp: string, workerPrivateIp: string, managerPrivateIp: string, joinToken: string) => {
    const playbook = new Playbook(
        'playbooks/swarm-join.yml',
        {joinToken, managerPrivateIp, workerPrivateIp},
        {dynamic_hosts: [workerPublicIp]});
    await playbook.setupDirectory();
    return await playbook.execute();
};

const runDeployStack = async (managerPublicIp: string) => {
    const playbook = new Playbook(
        'playbooks/deploy-stack.yml',
        {message: "Hello Server !"},
        {dynamic_hosts: [managerPublicIp]});
    await playbook.setupDirectory();
    return await playbook.execute();
};
