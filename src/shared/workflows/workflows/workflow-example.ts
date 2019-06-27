import { WorkflowInterface } from '../interfaces/workflow.interface';
import { StepInterface } from '../interfaces/step.interface';
import { StepExample } from '../steps/step-example';

// Faire un schéma order => workflow => taches (allocate, deploy) => ansible playbooks
// Faire une liste des commandes possibles (environment-update, create, delete, refresh services, refresh failure, ...)
// convert Order into Workflow => reprendre la partie séquence, peut être supprimer le code "in-entity"
// revoir par rapport à avant : sequence-runner (pilotage des executions) et sequence-operator (API d'execution)
// Garder "transparent" ce qui est généraliste (sauvegarde amont/aval d'une exécution, etc)
// chargement du contexte/container ?
// Commande d'entrée : run workflow/next /// Appeler une task sur demande


export class WorkflowExample implements WorkflowInterface {
    tasks: StepInterface[];
    ready: Promise<any>;

    constructor(private parameters: any = {}) {
        // passing parameters : environment, etc
        this.ready = this.load();
    }

    async build() {
        // setups tasks that have to be done
        await this.ready;
        this.tasks = [
            new StepExample(),
            new StepExample(),
            new StepExample()
        ];
    }

    async load() {
        // fetches data from database if necessary
    }

    checkAll() {
        // Simple function to check all tasks, if everything is OK
    }

    async run(): Promise<any> {
        for (let i in this.tasks) {
            await this.tasks[i].run();
        }
    }
}
