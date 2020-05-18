import { Main } from '../../../src/main';

export const CliTestHandler = async (program: any, app: Main): Promise<any> => {
    console.log('test');
    app.exit();
};
