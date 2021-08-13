import { App } from '@/app';
import { Service } from '@/decorators';
import firebase from 'firebase';
import { Once } from 'lodash-decorators';

type FirebaseApp = firebase.app.App;
type Firestore = firebase.firestore.Firestore;
type Database = firebase.database.Database;

@Service()
export class Firebase {
  protected readonly _app: FirebaseApp;

  public constructor(app: App) {
    this._app = firebase.initializeApp(this.options, app.getAppId());
  }

  protected get options(): Record<string, string | undefined> {
    return {
      apiKey: process.env.FIREBASE_API_KEY,
      projectId: process.env.FIREBASE_PROJECT_ID,
    };
  }

  @Once()
  public getFirestore(): Firestore {
    return this._app.firestore();
  }

  @Once()
  public getDatabase(): Database {
    return this._app.database();
  }
}
