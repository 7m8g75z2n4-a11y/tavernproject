declare module "web3.storage" {
  export class Web3Storage {
    constructor(config: { token: string });
    put(files: any[], options?: any): Promise<string>;
  }

  export type File = any;
}
