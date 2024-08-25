import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';

@Injectable({
  providedIn: 'root'
})
export class RealtimeDatabaseService {
  constructor(private db: AngularFireDatabase) {}

  // Método para guardar datos en Realtime Database
  saveData(path: string, data: any) {
    return this.db.list(path).push(data);
  }

  // Método para obtener datos desde una ruta específica
  getData(path: string) {
    return this.db.list(path).valueChanges();
  }

  // Otros métodos como update, delete, etc. pueden añadirse aquí
}