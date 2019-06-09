import * as inquirer from 'inquirer';
import { Question } from 'inquirer';

export const CliHelper = {
    async askInteractively(message: string): Promise<string> {
        const inputName = 'some-name';
        const question: Question = {
            type: 'input',
            name: inputName,
            message: `${message}:`
        };

        return inquirer.prompt([question])
            .then(answers => {
                console.log('you said', answers);
                return answers[inputName];
            });
    }
};
