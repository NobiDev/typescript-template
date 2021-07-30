import { App } from '@/app';
import { AppTerminated } from '@/exceptions';

let app: App;

beforeEach(() => {
  app = new App();
});

describe('Firebase.terminate', () => {
  it('should not allow access after terminate', async () => {
    await app.terminate();
    await expect(async () => Promise.resolve(app.getAppId())).rejects.toBeInstanceOf(AppTerminated);
  });
});
