// src/app/services/email.service.ts
import { Injectable } from '@angular/core';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

export interface EmailPayload {
  to: Array<{ email: string; name?: string }>;
  from?: { email: string; name?: string };
  cc?: Array<{ email: string; name?: string }>;
  bcc?: Array<{ email: string; name?: string }>;
  subject?: string;
  html?: string;
  text?: string;
  template_id?: string;
  variables?: any[];
  // cualquier campo adicional permitido por la extensión
}

@Injectable({ providedIn: 'root' })
export class EmailService {
  private db = getFirestore();
  // usa exactamente la colección que configuraste en la extensión (por defecto puede ser "emails")
  private emailsCollection = 'emails';

  async sendMail(payload: EmailPayload) {
    // añade metadatos opcionales como createdAt para debugging
    const doc = {
      ...payload,
      createdAt: serverTimestamp()
    };
    const ref = await addDoc(collection(this.db, this.emailsCollection), doc);
    return ref.id; // id del documento creado
  }
}
