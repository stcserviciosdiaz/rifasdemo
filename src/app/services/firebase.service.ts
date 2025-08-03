import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, doc, query, where } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private firestore: any;
  private firebaseApp = initializeApp(environment.firebase);
  private auth = getAuth(this.firebaseApp);

  public items: any[] = [];  // Para almacenar los datos de Firestore
 

  constructor() {
    const app = initializeApp(environment.firebase);
    this.firestore = getFirestore(app);
    
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
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







async getCollectionDataByField(
  collectionName: string,
  field: 'celular' | 'cedula',
  value: string
): Promise<any[]> {
  try {
    const colRef = collection(this.firestore, collectionName);
    const valorBuscado = value.trim();

    const snapshot = await getDocs(colRef);
    const uniqueMap = new Map<string, any>();

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const form = data['form'] || {};

      const campoValor =
      field === 'cedula'
        ? (form['cedula'] ?? '').toString().trim()
        : (form['celular'] ?? '').toString().trim();
      const cedula = (form['cedula'] ?? '').toString().trim();
      const celular = (form['celular'] ?? '').toString().trim();
      const correo = (form['correo'] ?? '').toString().trim();
      const nombre = (form['nombre'] ?? '').toString().trim();
      const codigoArea = (form['codigoArea'] ?? '').toString().trim();

      // Log para depurar
      console.log(`Comparando: buscado "${valorBuscado}" vs en documento "${campoValor}"`);

      if (campoValor === valorBuscado) {
        const key = field === 'cedula' ? cedula : celular;

        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, {
            id: doc.id,
            celular,
            cedula,
            correo,
            codigoArea,
            nombre,
            elegirnumero: Array.isArray(data['elegirnumero']) ? data['elegirnumero'] : []
          });
        } else {
          const existente = uniqueMap.get(key);
          const nuevos = Array.isArray(data['elegirnumero']) ? data['elegirnumero'] : [];
          existente.elegirnumero = [...new Set([...existente.elegirnumero, ...nuevos])];
        }
      }
    });

    const resultadoFinal = Array.from(uniqueMap.values());

    console.log(`Resultado final por ${field}:`, resultadoFinal);
    return resultadoFinal;
  } catch (error) {
    console.error(`Error al obtener los datos por ${field}:`, error);
    return [];
  }
}





  



}
