import { Main } from '../../../src/main';
import { ClusterModule } from '../../../src/domains/clusters/cluster.module';
import { parseStepLineJSON, Playbook, readStep } from '@ansible';

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

export const CliCreateClusterHandler = async (program: any, app: Main): Promise<any> => {
    console.log('*** (create cluster entry)');
    await createManager();
    await createWorker();
    console.log('*** push react image as docker stack');
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

const createManager = async () => {
    console.log('*** create manager (start instance, start docker-swarm, get token key, store this key');
    const cluster = await clusterModule.createCluster();
    const nodes = await cluster.nodes;
    if(nodes.length) {
        const manager = nodes[0];
        const managerEC2Instance = await manager.instance;
        const managerIp = await managerEC2Instance.getPublicIp();
        console.log('manager ip :', managerIp);
        const playbook = new Playbook(
            'playbooks/swarm-init.yml',
            {message: "Hello Server !"},
            {dynamic_hosts: [managerIp]});
        await playbook.setupDirectory();
        const results = await playbook.execute();
        console.log('resuts to read', results);
        const swarmStep = readStep(results, "Exec swarm init");
        const swarmStepInfo = parseStepLineJSON(swarmStep.lines[0]);
        const tokens = swarmStepInfo.swarm_facts.JoinTokens;
        console.log('you can join as a worker using token', tokens.Worker);
    } else {
        throw new Error("createManager failed (no node)")
    }
};

const createWorker = async () => {
    console.log('*** create worker (start instance, start docker-swarm, recover master key, link to master');
};
