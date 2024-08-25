import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, doc } from 'firebase/firestore';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private firestore: any;

  constructor() {
    const app = initializeApp(environment.firebase);
    this.firestore = getFirestore(app);
    
  }

  // Método para agregar datos
  async addData(collectionName: string, data: any) {
    try {
      const docRef = await addDoc(collection(this.firestore, collectionName), data);
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }

  // Método para obtener todos los documentos de una colección
  async getAllData(collectionName: string) {
    try {
      const querySnapshot = await getDocs(collection(this.firestore, collectionName));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.error("Error getting documents: ", e);
      return [];
    }
  }

  async getData(collectionName: string): Promise<any[]> {
    const querySnapshot = await getDocs(collection(this.firestore, collectionName));
    return querySnapshot.docs.map(doc => doc.data());
  }

  // Método para obtener datos de una colección
  async getCollectionData(collectionName: string): Promise<any[]> {
    const colRef = collection(this.firestore, collectionName);
    const snapshot = await getDocs(colRef);
    const dataList = snapshot.docs.map(doc => doc.data());

    console.log(dataList); // Imprimir los datos en la consola

    return dataList;
  }

  async getIdsFromCollection(collectionName: string): Promise<string[]> {
    const colRef = collection(this.firestore, collectionName);
    const snapshot = await getDocs(colRef);

    const ids = snapshot.docs.map(doc => doc.id.toString()); // Obtén solo los IDs de los documentos

    console.log('IDs obtenidos de Firestore:', ids); // Imprime en la consola

    return ids;
  }

  async getDisabledNumbersFromCollection(collectionName: string): Promise<string[]> {
    const colRef = collection(this.firestore, collectionName);
    const snapshot = await getDocs(colRef);
    const disabledNumbers = snapshot.docs
      .map(doc => doc.data()['elegirnumero']) // Accede al campo 'elegirnumero'
      .filter((numero: any) => numero !== undefined) // Filtra los números válidos
      .flat(); // Aplana el array si es necesario

    return disabledNumbers.map((num: any) => num.toString()); // Convierte a strings
  }

}
