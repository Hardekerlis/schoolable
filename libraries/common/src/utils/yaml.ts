import YML from 'js-yaml';
import fs from 'fs';

export class Yaml {
  /*
    Saves object as yaml at specified path
    @param {object} obj - the object to be converted to yaml
    @param {string} path - path to where to save the yaml
  */
  public static save(obj: object, path: string) {
    // converts the obj to yaml
    const data = YML.dump(obj, {
      styles: {
        '!!null': 'lowercase', // null will be in lowercase
        '!!int': 'decimal', // Deciaml number system
        '!!bool': 'lowercase', // booleans will be lowercase
        '!!float': 'lowercase', // float will be lowercase, ex: .int | .inf
      },
      sortKeys: false, // sort object keys
    });

    try {
      fs.writeFileSync(path, data);
    } catch (err) {
      throw new Error(err as string);
    }
  }

  /*
    returns the yaml document as an object
    @param {string} path - the path to the yaml file you want to load
    @returns {object} - the specified yaml document as an object
  */
  public static load(path: string): object {
    try {
      // Loads the yaml file and converts it to object
      let data = YML.load(fs.readFileSync(path + '', 'utf-8'));

      // Returns the data object
      return new Object(data); // Has to be new Object(data) because otherwise it returns the object as { data: { ~Yaml document~ }}
    } catch (err) {
      throw new Error(err as string);
    }
  }
}
