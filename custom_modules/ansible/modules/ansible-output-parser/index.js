const stepHeadPattern = /^([\w ]+) (\[(.+)\] )?\*\*\*+$/;
const playRecapPattern = /^.+  +: +ok=(\d+)  +changed=(\d+)  +unreachable=(\d+)  +failed=(\d+)  .*$/;
const stepStatusPattern = /^(\w+)\: \[.*\].*$/;  // ligne du début 'ok: [...] ...'
const stepWithDataPattern = /^(\w+)\: +\[.*\] +\=\> +(\{.*\}) *$/;

module.exports = function (output) {
    // TODO : log output
    let lines = output.split(/\r?\n/),
        steps = [],
        currentStep;
    for (var i in lines) {
        let line = lines[i];
        if (isLineEmpty(line)) {
            continue;
        }
        if (isStepHead(line)) {
            if (currentStep) {
                steps.push(currentStep);
            }
            currentStep = {
                type: getStepType(line),
                label: getStepLabel(line),
                lines: []
            };
        } else {
            if (currentStep) {
                currentStep.lines.push(line);
            }
        }
    }

    steps.push(currentStep);

    steps.map(step => {
        step.status = parseStepStatus(step.lines);
        step.data = parseLinesData(step.lines);
        return step;
    });

    let recap = findRecap(steps);

    return {
        success: !recap.unreachable && !recap.failed,
        steps,
        recap
    };
};

function isStepHead(line) {
    return /\*\*\*$/.test(line);
}

function isRecognizedStepHead(line) {
    return stepHeadPattern.test(line);
}

function isLineEmpty(line) {
    return !line || !line.length;
}

function getStepType(headLine) {
    if (!isRecognizedStepHead(headLine)) {
        return 'Unknown type';
    }
    return headLine.replace(stepHeadPattern, '$1');
}

function getStepLabel(headLine) {
    if (!isRecognizedStepHead(headLine)) {
        return headLine;
    }
    return headLine.replace(stepHeadPattern, '$3');
}

function parseStepStatus(lines) {
    let line = lines[0];
    return line && stepStatusPattern.test(line) && line.replace(stepStatusPattern, '$1');
}

function parseLinesData(lines) {
    if (lines.length) {
        const content = lines.join(' ');
        //console.log('content', content);
        if (playRecapPattern.test(content)) {
            return recapAsObject(content);
        } else if (stepWithDataPattern.test(content)) {
            try {
                let probablyJsonContent = content.replace(stepWithDataPattern, '$2');
                return JSON.parse(probablyJsonContent);
            } catch (e) {
                console.log('could not parse content', content);
            }
        }
    }
}

function findRecap(steps) {
    let found = steps.filter(step => step.type === 'PLAY RECAP')[0];

    return found && found.data;
}

function recapAsObject(recapLine) {
    // recapLine = "3.121.138.238              : ok=20   changed=7    unreachable=0    failed=0    skipped=1    rescued=0    ignored=0   "
    // onlyValues = "ok=20   changed=7    unreachable=0    failed=0    skipped=1    rescued=0    ignored=0   "
    // valuesArray = ["ok=20", "changed=7", "unreachable=0", "failed=0", "skipped=1", "rescued=0", "ignored=0"]

    const onlyValues = recapLine.replace(/^.+  +: +(ok=\d+ .*)$/, '$1');
    const valuesArray = onlyValues.trim().split(/ +/);
    const values = {};

    valuesArray.map(keyAndValue => {
        const [key, value] = keyAndValue.split('=');
        values[key] = parseInt(value);
    });

    return values;
}


/*
return {
    'ok': parseInt(content.replace(playRecapPattern, '$1')),
    'changed': parseInt(content.replace(playRecapPattern, '$2')),
    'unreachable': parseInt(content.replace(playRecapPattern, '$3')),
    'failed': parseInt(content.replace(playRecapPattern, '$4'))
}
 */
