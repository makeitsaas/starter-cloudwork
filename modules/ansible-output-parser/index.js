const stepHeadPattern = /^([\w ]+) (\[(.+)\] )?\*\*\*+$/;
const playRecapPattern = /^.+  +: +ok=(\d+)  +changed=(\d+)  +unreachable=(\d+)  +failed=(\d+) +$/;

module.exports = function(output) {
  let lines = output.split(/\r?\n/),
      steps = [],
      currentStep;
  for(var i in lines) {
    let line = lines[i];
    if(isLineEmpty(line)) {
      continue;
    }
    if(isStepHead(line)) {
      if (currentStep) {
        steps.push(currentStep);
      }
      currentStep = {
        type: getStepType(line),
        label: getStepLabel(line),
        lines: []
      };
    } else {
      if(currentStep) {
        currentStep.lines.push(line);
      }
    }
  }

  steps.push(currentStep);

  steps.map(step => {
    step.lines = reProcessLines(step.lines);
    return step;
  })

  recap = findRecap(steps);

  return {
    steps
  };
}

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
  if(!isRecognizedStepHead(headLine)) {
    return 'Unknown type';
  }
  return headLine.replace(stepHeadPattern, '$1');
}

function getStepLabel(headLine) {
  if(!isRecognizedStepHead(headLine)) {
    return headLine;
  }
  return headLine.replace(stepHeadPattern, '$3');
}

function reProcessLines(lines) {
  return lines.map(line => {
    if(playRecapPattern.test(line)) {
      return {
        'ok': parseInt(line.replace(playRecapPattern, '$1')),
        'changed': parseInt(line.replace(playRecapPattern, '$2')),
        'unreachable': parseInt(line.replace(playRecapPattern, '$3')),
        'failed': parseInt(line.replace(playRecapPattern, '$4'))
      }
    }
    return line;
  })
}

function findRecap(steps) {
  let found = steps.filter(step => step.type==='PLAY RECAP')[0];

  return found && found.lines[0];
}
