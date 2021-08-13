import { Service } from '@/decorators';
import type firebase from 'firebase';
import { Firebase } from './firebase';

type Firestore = firebase.firestore.Firestore;
type CollectionReference = firebase.firestore.CollectionReference;

@Service()
export abstract class Storage {
  protected readonly _firestore: Firestore;

  protected constructor(firebase: Firebase) {
    this._firestore = firebase.getFirestore();
  }

  protected abstract get collectionPath(): string;

  protected get collection(): CollectionReference {
    return this._firestore.collection(this.collectionPath);
  }
}
