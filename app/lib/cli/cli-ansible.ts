import { CliHelper, ConfigReader } from '@utils';
import { Playbook } from '@ansible';
import { Main } from '../../../src/main';


export const CliAnsibleHandler = (program: any, app: Main): Promise<any> => {
    let playbookReference: string;
    let serviceUuid: string;
    let environmentUuid: string;

    const getPlaybookReference = async (): Promise<string> => {
        if (program.playbook) {
            playbookReference = program.playbook;
        } else {
            playbookReference = await CliHelper.askList(ConfigReader.playbooks.getKeys());
        }

        return playbookReference;
    };
    const getServiceUuid = async (): Promise<string> => {
        if (program.service) {
            serviceUuid = program.service;
        } else {
            serviceUuid = await CliHelper.askInteractively('Service uuid (6, 7, ...)');
        }

        return serviceUuid;
    };
    const getEnvironmentUuid = async (): Promise<string> => {
        if (program.environment) {
            environmentUuid = program.service;
        } else {
            environmentUuid = await CliHelper.askInteractively('Environment uuid (3)');
        }

        return environmentUuid;
    };
    const envBasedPlaybookRegexp = /(proxy)/;

    // Do something better to load playbook context
    // Then use the same logic for context injection in workflow steps
    return Promise.resolve(getPlaybookReference())
        .then(() => envBasedPlaybookRegexp.test(playbookReference) ? getEnvironmentUuid() : getServiceUuid())
        .then(() => {
            const playbookPromise = envBasedPlaybookRegexp.test(playbookReference) ?
                app.loadPlaybook(playbookReference, environmentUuid, program.interactive) :
                app.loadServicePlaybook(playbookReference, serviceUuid, program.interactive);
            return playbookPromise
                .then(async (playbook: Playbook) => {
                    if (program.execute === undefined) {
                        program.execute = await CliHelper.askConfirmation('Execute playbook ?');
                    }
                    if (program.execute) {
                        await playbook.execute();
                    } else {
                        console.log('\n\n\nSUCCESS ! Playbook has been created. Use commands below to execute it manually :\n');
                        console.log(`cd ${await playbook.getDirectory()}`);
                        console.log(`ansible-playbook -i inventories/hosts root-playbook.yml`);
                        console.log(`cd ../..\n\n`);
                    }
                    app.exit();
                });
        })
        .catch(e => {
            console.log('error (run single playbook)');
            console.log(e);
        })
        .finally(() => {
            app.exit()
        });
};
