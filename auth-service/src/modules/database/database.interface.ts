export interface IDatabase<T = any> {
  connection(): Promise<T>;
  migrations(): Promise<void>;
  seeds(): Promise<void>;
}
