/** @format */

import { Yaml } from '@gustafdahl/schoolable-utils';
import fs from 'fs';

export const LANG: any = {};

export const loadLanguages = (path: string) => {
  const langFiles = fs.readdirSync(path);

  for (const file of langFiles) {
    const fileContent = Yaml.load(`${path}/${file}`);
    const lang = file.replace('.yml', '');
    LANG[lang] = fileContent;
  }
};
