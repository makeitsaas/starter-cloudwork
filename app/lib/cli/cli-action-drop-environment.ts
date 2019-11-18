import { Main } from '../../../src/main';

export const CliActionDropEnvironment = (environmentUuid: string | void, app: Main): Promise<any> => {
    if (!environmentUuid) {
        throw new Error("You shall specify environment id");
    } else {
        return app.dropEnvironment(environmentUuid)
            .then(() => {
                return app.exit();
            })
    }
}
