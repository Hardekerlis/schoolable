/** @format */

import { Yaml } from './yaml';
import fs from 'fs';

export const LANG: any = {};

export const loadLanguages = async () => {
  const path = __dirname.replace('src/library/misc', 'languages');

  const langFiles = fs.readdirSync(path);

  for (const file of langFiles) {
    const fileContent = Yaml.load(`${path}/${file}`);
    const _file = file.replace('.yml', '');
    LANG[_file] = fileContent;
  }

  console.log(LANG);
};
