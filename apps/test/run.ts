import * as program from 'commander';
import { ModeLoader } from '../../src/core/mode/cli-mode-loader';
import { CliHelper } from '@utils';
import { config } from 'dotenv';

config();   // usually done by src/main.ts, but we actually test if everything is fine for main.ts

program
    .version('0.1.0')
    .parse(process.argv);

ModeLoader(program);

async function testNetworkInteractively() {
    const response = await CliHelper.askList("What do you want to test", [
        {
            name: "Mysql Connection",
            value: "mysql"
        },
        {
            name: "Redis Connection",
            value: "redis"
        },
        {
            name: "AWS IAM",
            value: "aws-iam"
        },
        {
            name: "Port availability",
            value: "ports"
        },
        {
            name: "Filesystem (write access over tmp/)",
            value: "filesystem"
        }
    ]);

    console.log('test', response);
    console.warn("\n\n/!\\ This command is not effective yet /!\\");
}

testNetworkInteractively();
