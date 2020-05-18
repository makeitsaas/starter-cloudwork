import {
    AnsibleStepInterface,
    ParsedAnsibleOutputInterface
} from '../ansible-output-parser/ParsedAnsibleOutput.interface';

export const readStep = (parsedOutput: ParsedAnsibleOutputInterface, stepLabel: string): AnsibleStepInterface => {
    return parsedOutput.steps.filter(step => step.label === stepLabel)[0]
};

export const parseStepLineJSON = (stepLine: string) => {
    const pattern = /^\w+\: \[.+\] => (.*)$/;
    const stringifiedJson = stepLine.replace(pattern, "$1");

    return JSON.parse(stringifiedJson);
};
