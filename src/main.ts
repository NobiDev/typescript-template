import { App } from '@/app';

// noinspection JSUnusedGlobalSymbols
export default (async (): Promise<void> => {
  const app = new App();

  await app.terminate();
  console.log('OK !');
})();
