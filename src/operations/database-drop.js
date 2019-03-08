const ansibleClient = require('../ansible');

ansibleClient.exec('database-drop').then(info => {
  if(info.success) {
    console.log('do someting on success', info.recap);
  } else {
    console.log('recover what needed');
  }
}).catch(e => {
  console.error(e);
});
