/** @format */

import { Yaml } from './yaml';
import fs from 'fs';

export const LANG: any = {};

export const loadLanguages = () => {
  const path = __dirname.replace(
    `${process.env.PARENT_FOLDER}/library/misc`,
    'languages',
  );

  const langFiles = fs.readdirSync(path);

  for (const file of langFiles) {
    const fileContent = Yaml.load(`${path}/${file}`);
    const lang = file.replace('.yml', '');
    LANG[lang] = fileContent;
  }
};
