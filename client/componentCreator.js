const fs = require('fs');
const path = require('path');

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});

const exitW = msg => {
  console.log(msg);
  process.exit(0);
};

function lowerFirstLetter(string) {
  return string.charAt(0).toLowerCase() + string.slice(1);
}

const generateJsFile = name => {
  return `import React, { useEffect, useState } from 'react';

import styles from './${lowerFirstLetter(name)}.module.sass';

const ${name} = ({  }) => {

  return(
    <div className={styles.wrapper}>

    </div>
  )

}

export default ${name};

`;
};

readline.question('component name: ', compName => {
  readline.question('base path: ', baseDir => {
    let indexPath = path.join(__dirname, baseDir + '/index.js');

    const indexExists = fs.existsSync(indexPath);

    if(!indexExists) exitW('No such file: ' + indexPath);

    let file = fs.readFileSync(indexPath, { encoding: 'utf-8' });

    let compImportLine = `import ${compName} from './${lowerFirstLetter(
      compName,
    )}';`;

    file = file.replace('//import pos', compImportLine + '\n//import pos');

    let compExportLine = `${compName},`;

    file = file.replace('//export pos', compExportLine + '\n  //export pos');

    let compDirPath = `${baseDir}/${lowerFirstLetter(compName)}`;

    if(fs.existsSync(compDirPath)) exitW('This component already exists.');

    try {
      fs.mkdirSync(compDirPath);

      fs.writeFileSync(compDirPath + '/index.js', generateJsFile(compName));

      fs.writeFileSync(
        compDirPath + '/' + lowerFirstLetter(compName) + '.module.sass',
        `.wrapper`,
      );

      fs.writeFileSync(indexPath, file);
    }catch (err) {
      console.log(err);

      process.exit(0);
    }

    console.log('Successfully created component!');

    process.exit(0);
  });
});
