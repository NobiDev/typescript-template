import { App } from './app';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

let app: App;

beforeEach(() => {
  app = new App();
});

describe('Firebase.getAppId()', () => {
  it('should return a UUID v1', () => {
    expect(app.getAppId()).toMatch(UUID_REGEX);
  });
});
