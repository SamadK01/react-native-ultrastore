import type { StorageEngine } from './storage';

export type MigrationFunc = (storage: StorageEngine) => void | Promise<void>;

export interface MigrationConfig {
  /**
   * Object mapping version numbers to migration functions.
   */
  migrations: Record<number, MigrationFunc>;
  /**
   * The version that the app is currently on.
   */
  targetVersion: number;
  /**
   * Storage key where the version is saved. Defaults to '@ultraStore:version'
   */
  versionKey?: string;
}

/**
 * Migration Manager for UltraStore
 * Safely run schema upgrades when moving across application versions.
 */
export const createMigrationManager = async (
  storage: StorageEngine,
  config: MigrationConfig
): Promise<void> => {
  const { migrations, targetVersion, versionKey = '@ultraStore:version' } = config;
  const currentVersion = storage.get<number>(versionKey) || 0;

  if (currentVersion >= targetVersion) {
    return;
  }

  const versionsToRun = Object.keys(migrations)
    .map(Number)
    .filter((v) => v > currentVersion && v <= targetVersion)
    .sort((a, b) => a - b);

  for (const version of versionsToRun) {
    try {
      await migrations[version](storage);
    } catch (err) {
      console.error(`[UltraStore] Migration to version ${version} failed:`, err);
      // Halt migrations to prevent partial or corrupted upgrades
      return;
    }
  }

  // Commit the final version
  storage.set(versionKey, targetVersion);
};
