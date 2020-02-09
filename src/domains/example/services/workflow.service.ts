import { IWorkflowHost } from 'workflow-es';

export class WorkflowService {

    constructor(
        private host: IWorkflowHost
    ) {}

    async runDemo(): Promise<string> {
        // let id = await this.host.startWorkflow("update-environment-workflow", 1, {
        //     environmentId: "1234"
        // });
        // console.log('started workflow id:', id);
        //
        // return id;
        return "workflowId";
    }

}
