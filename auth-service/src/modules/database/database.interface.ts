export interface IDatabase {
  migrateLatest(): Promise<void>;
  seedUp(): Promise<void>;
}
