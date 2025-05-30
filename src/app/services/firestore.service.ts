import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, doc, query, where } from 'firebase/firestore';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private firestore: any;

  public items: any[] = [];  // Para almacenar los datos de Firestore
 

  constructor() {
    const app = initializeApp(environment.firebase);
    this.firestore = getFirestore(app);
    
  }

  // Método para guardar datos
  async addData(collectionName: string, data: any) {
    try {
      const docRef = await addDoc(collection(this.firestore, collectionName), data);
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }


  // Método para desabilitar el numero despues de guardar
  async getDisabledNumbersFromCollection(collectionName: string): Promise<string[]> {
    const colRef = collection(this.firestore, collectionName);
    const snapshot = await getDocs(colRef);
    const disabledNumbers = snapshot.docs
      .map(doc => doc.data()['elegirnumero']) // Accede al campo 'elegirnumero'
      .filter((numero: any) => numero !== undefined) // Filtra los números válidos
      .flat(); // Aplana el array si es necesario

    return disabledNumbers.map((num: any) => num.toString()); // Convierte a strings
  }



  async getCollectionDataByCell(collectionName: string, celular: string): Promise<any[]> {
    try {
      const colRef = collection(this.firestore, collectionName);
      const q = query(colRef, where('form.celular', '==', celular)); // Consulta usando 'form.celular'
      const snapshot = await getDocs(q);
      
      const dataList = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id, // ID del documento
          celular: data['form']?.['celular'] || null, // Accede con notación de índice
          codigoArea: data['form']?.['codigoArea'] || null, // Accede con notación de índice
          nombre: data['form']?.['nombre'] || null, // Accede con notación de índice
          elegirnumero: data['elegirnumero'] || [] // Asume que elegirnumero es un array
        };
      });
  
      console.log("Datos filtrados por celular:", dataList); // Imprimir los datos filtrados
      return dataList;
    } catch (error) {
      console.error("Error al obtener los datos por celular:", error);
      return [];
    }
  }
  



}
