import { Yaml } from './yaml';

// Tried to make this a global but the code turned out hideous so did it this way instead
export let CONFIG: any;

// Handles loading and saving config
export class ConfigHandler {
  // Path to the config file
  private static path: string;

  // Save the updated config
  // To save the config update the global config and then run the saveConfig method
  public static saveConfig(): void {
    Yaml.save(CONFIG, ConfigHandler.path);
  }

  /*
    loads the config file into the global scope and then returns the loaded config
    @returns {object} returns the current loaded application config
  */
  public static async loadConfig(path: string, cb?: Function): Promise<object> {
    ConfigHandler.path = path;
    const localConfig = Yaml.load(path);

    if (!localConfig) throw new Error('No config found!');

    CONFIG = localConfig;

    if (cb) {
      cb();
    }
    return new Object(localConfig);
  }

  // Alias for loadConfig. Aka updateConfig and loadConfig methods do the same
  public static updateConfig = ConfigHandler.loadConfig;

  public static async loadConfigFromDatabase(settingsModel: any) {
    const settings = await settingsModel.find({});
    console.log(settings);

    CONFIG = settings[0];

    return new Object(settings[0]);
  }

  /*
    @returns {object} Returns the content of the config file
  */
  public static getSavedConfig(): object {
    const localConfig = Yaml.load(ConfigHandler.path);

    return localConfig;
  }
}
