import { CREDENTIALS_FILE, ConfigKeys } from '../types/config.types';
import { LoginCredentials } from '../types/login.types';
import { promises as fs } from 'fs';
import { CryptoService } from './crypto.service';

export class ConfigService {
  public static readonly instance: ConfigService = new ConfigService();

  /**
   * Gets the value from an environment key
   * @param key The environment key to retrieve
   * @throws {Error} If key is not found in process.env
   * @returns The value from the environment variable
   **/
  public get = (key: keyof ConfigKeys): string => {
    const value = process.env[key];
    if (!value) throw new Error(`Config key ${key} was not found in process.env`);
    return value;
  };

  /**
   * Saves the authenticated user credentials to file
   * @param loginCredentials The user credentials to be saved
   * @async
   **/
  public saveUser = async (loginCredentials: LoginCredentials): Promise<void> => {
    const credentialsString = JSON.stringify(loginCredentials);
    const encryptedCredentials = CryptoService.instance.encryptText(credentialsString);
    await fs.writeFile(CREDENTIALS_FILE, encryptedCredentials, 'utf8');
  };

  /**
   * Returns the authenticated user credentials
   * @returns {LoginCredentials} The authenticated user credentials
   * @async
   **/
  public readUser = async (): Promise<LoginCredentials | undefined> => {
    try {
      const encryptedCredentials = await fs.readFile(CREDENTIALS_FILE, 'utf8');
      const credentialsString = CryptoService.instance.decryptText(encryptedCredentials);
      const loginCredentials = JSON.parse(credentialsString) as LoginCredentials;
      return loginCredentials;
    } catch {
      return;
    }
  };
}
