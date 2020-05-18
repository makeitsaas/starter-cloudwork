import * as inquirer from 'inquirer';
import { CheckboxQuestionOptions, Question } from 'inquirer';

export const CliHelper = {
    async askInteractively(message: string): Promise<string> {
        const inputName = 'value';
        const question: Question = {
            type: 'input',
            name: inputName,
            message: `${message}:`
        };

        return inquirer.prompt([question])
            .then(answers => {
                return answers[inputName];
            });
    },
    async askList(choices: (string|{name:string,value:any})[]): Promise<string> {
        const inputName = 'playbook';
        const question: CheckboxQuestionOptions = {
            type: 'list',
            name: inputName,
            message: 'Choose your playbook',
            choices
        };

        return inquirer.prompt([question])
            .then(answers => {
                return answers[inputName];
            });
    },
    async askConfirmation(message: string, defaultValue: boolean = true): Promise<boolean> {
        const inputName = 'confirmation';
        const question: Question = {
            type: 'confirm',
            name: inputName,
            message: `${message}:`,
            default: defaultValue
        };

        return inquirer.prompt([question])
            .then(answers => {
                return answers[inputName];
            });
    }
};
