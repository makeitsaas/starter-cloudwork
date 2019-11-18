import { Main } from '../../../src/main';

export const CliExampleDisplayHandler = (program: any, app: Main): Promise<any> => {
    console.log('Example commands :\n\
npm run cli -- --order=1 \n\
npm run cli -- --sequence=35 \n\
npm run cli -- --drop --environment=1 \n\
    ');
    return Promise.resolve(app.exit());
};
