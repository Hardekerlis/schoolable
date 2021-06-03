/** @format */

import { Yaml } from './yaml';

// Tried to make this a global but the code turned out hideous so did it this way instead
export let CONFIG: any;

// Handles loading and saving config
export class ConfigHandler {
  // Static path to the config file
  private static path = '/../../../config/app-config.yml';

  // Save the updated config
  // To save the config update the global config and then run the saveConfig method
  public static saveConfig(): void {
    console.log(CONFIG);
    Yaml.save(CONFIG, this.path);
  }

  /*
    loads the config file into the global scope and then returns the loaded config
    @returns {object} returns the current loaded application config
  */
  public static async loadConfig(): Promise<object> {
    const localConfig = Yaml.load(this.path);

    CONFIG = localConfig;

    return new Object(localConfig);
  }

  // Alias for loadConfig. Aka updateConfig and loadConfig methods do the same
  public static updateConfig = ConfigHandler.loadConfig();

  /*
    @returns {object} Returns the content of the config file
  */
  public static getSavedConfig(): object {
    const localConfig = Yaml.load(this.path);

    return localConfig;
  }
}
