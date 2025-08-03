import { CommonModule } from '@angular/common';
import {ChangeDetectionStrategy, Component, AfterViewInit, ChangeDetectorRef, inject} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule, MAT_DIALOG_DEFAULT_OPTIONS} from '@angular/material/dialog';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { FirebaseService } from 'src/app/services/firebase.service';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from 'src/app/guards/auth.service';

import { collection, getDocs, deleteDoc, doc, getFirestore, Firestore } from '@angular/fire/firestore';

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


/**
 * @title Dialog with header, scrollable content and actions
 */
@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  standalone: true,
  imports: [MatButtonModule,
    MatDialogModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})



export class AdminComponent {

  db = getFirestore();  
  usuarios: any[] = [];
  documentos: string[] = [];
  filtro: string = '';

  rifaSeleccionada: string = '';
  //usuariosFiltrados: any[] = [];
  

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private firestore: Firestore,
    private sanitizer: DomSanitizer
  ) {}

  
  
  async ngOnInit() {
    this.cargarRifa('lottery01');
    const snapshot = await getDocs(collection(this.db, 'lottery01'));
    
    this.restaurarEstadosBloqueo();
    this.cdr.detectChanges();
  }

  get usuariosFiltrados() {
    if (!this.filtro) return this.usuarios;
    const filtroLower = this.filtro.toLowerCase();
    return this.usuarios.filter(u =>
      (u.nombre && u.nombre.toLowerCase().includes(filtroLower)) ||
      (u.numeros && u.numeros.toLowerCase().includes(filtroLower))
    );
  }

  
  restaurarEstadosBloqueo(): void {
  this.usuarios = this.usuarios.map(u => {
    const clave = `bloqueado_${u.cedula || u.celular}`;
    const guardado = localStorage.getItem(clave);
    return {
      ...u,
      bloqueado: guardado ? JSON.parse(guardado) : false
    };
  });
}


  
  logorifa = [
    { id:'1', 
      imagen:'logo.png',
    },
  ];

  imagendelarifa = [
    { imagen: 'lottery01.jpg', coleccion: 'lottery01' },
    { imagen: 'lottery02.jpg', coleccion: 'lottery02' }
  ];
  

  cargarRifa(nombreColeccion: string) {
  this.rifaSeleccionada = nombreColeccion;
  const coleccionRef = collection(this.firestore, nombreColeccion);

  getDocs(coleccionRef).then(snapshot => {
    this.usuarios = snapshot.docs.map(doc => {
      const data = doc.data();
      const form = data['form'] || {};

      return {
        id: doc.id,
        nombre: form['nombre'] || 'No definido',
        codigoArea: form['codigoArea'] || '',
        celular: form['celular'] || '',
        numeros: Array.isArray(data['elegirnumero'])
          ? data['elegirnumero'].map((num: number) => num.toString().padStart(4, '0')).join(', ')
          : ''
      };
    });

    this.cdr.detectChanges();
  });
}

  onSwitchChange(usuario: any) {
    console.log(`Usuario ${usuario.nombre} ${usuario.bloqueado ? 'bloqueado' : 'desbloqueado'}`);
    const estado = usuario.bloqueado;
    const clave = `bloqueado_${usuario.cedula || usuario.celular}`;
    localStorage.setItem(clave, JSON.stringify(estado));
    // Aquí podrías guardar ese estado si es necesario
  }

  cerrarSesion() {
    this.authService.logout()
      .then(() => this.router.navigate(['/login']))
      .catch(error => console.error('Error al cerrar sesión:', error));
  }

  async eliminarRegistro(index: number) {
    const id = this.usuarios[index].id; // Usa el id del documento
    try {
      await deleteDoc(doc(this.db, 'lottery001', id));
      this.usuarios.splice(index, 1);
      alert('Registro eliminado correctamente.');
    } catch (error) {
      console.error('Error al eliminar el registro:', error);
      alert('Ocurrió un error al eliminar el registro.');
    }
  }

  resaltarTexto(texto: string | undefined): SafeHtml {
    if (!texto) return '';
    if (!this.filtro) return texto;

    const safeText = texto.toString().replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const filtroRegex = new RegExp(`(${this.filtro})`, 'gi');
    const resaltado = safeText.replace(filtroRegex, '<mark>$1</mark>');
    return this.sanitizer.bypassSecurityTrustHtml(resaltado);
  }

  notificarWhatsApp(usuario: any): void {
    const baseUrl = 'https://api.whatsapp.com/send';
    const telefono = usuario.codigoArea + usuario.celular;

    const numerosTexto = Array.isArray(usuario.numeros)
      ? usuario.numeros.join(', ')
      : usuario.numeros;

    const mensaje = `¡Hola ${usuario.nombre}!
    
    Te saluda el equipo de @rifademocom

    Notamos que tienes los siguientes números reservados: *${numerosTexto}*

    Aún no han sido validados porque no hemos recibido tu comprobante de pago.

    Por favor, envíalo para confirmar tu participación y asegurar tu suerte

    ¡Gracias por ser parte de la rifa y mucha suerte!`;

    const url = `${baseUrl}?phone=${telefono}&text=${encodeURIComponent(mensaje)}`;

    // Guardar el tiempo actual como bloqueo de 24h
    const clave = `smsBloqueo_${usuario.celular}`;
    localStorage.setItem(clave, Date.now().toString());

    // Redirigir a WhatsApp
    window.open(url, '_blank');
  }


  // Verifica si el botón está deshabilitado
    estaDeshabilitado(celular: string): boolean {
      const clave = `smsBloqueo_${celular}`;
      const timestamp = Number(localStorage.getItem(clave));
      if (!timestamp) return false;

      const ahora = Date.now();
      return ahora - timestamp < 12 * 60 * 60 * 1000; // 24 horas
    }

  obtenerTextoBotonSeguro(celular: string): SafeHtml {
    const texto = this.obtenerTextoBoton(celular); // tu texto HTML original
    return this.sanitizer.bypassSecurityTrustHtml(texto);
  }
 
  obtenerTextoBoton(celular: string): string  {
    if (!this.estaDeshabilitado(celular)) {
      return '<i class="fa fa-whatsapp" aria-hidden="true" style="font-size: 16px;"></i>';
    }

    const clave = `smsBloqueo_${celular}`;
    const timestamp = Number(localStorage.getItem(clave));
    const restante = 12 * 60 * 60 * 1000 - (Date.now() - timestamp);

    const horas = Math.floor(restante / (1000 * 60 * 60));
    const minutos = Math.floor((restante % (1000 * 60 * 60)) / (1000 * 60));

    return `⏳ Faltan ${horas}h ${minutos}m`;
  }


printDiv(divId: string) {
  const contenido = document.getElementById(divId);
  if (!contenido) return;

  const ventanaImpresion = window.open('', '', 'width=800,height=700');
  if (ventanaImpresion) {
    ventanaImpresion.document.open();
    ventanaImpresion.document.write(`
      <html>
        <head>
          <title>Boleto de Rifa</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: #f8f9fa;
              padding: 20px;
            }
            .ticket-container {
              width: 700px;
              margin: auto;
              border: 2px dashed #4CAF50;
              background-color: #ffffff;
              padding: 30px;
              border-radius: 12px;
              box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            }
            .ticket-header {
              text-align: center;
              border-bottom: 1px solid #ddd;
              margin-bottom: 20px;
              padding-bottom: 10px;
            }
            .ticket-header img {
              max-width: 120px;
              margin-bottom: 10px;
            }
            .ticket-header h2 {
              margin: 0;
              color: #333;
            }
            .ticket-info {
              font-size: 16px;
              color: #444;
              line-height: 1.6;
            }
            .ticket-info strong {
              color: #000;
            }
            .ticket-footer {
              text-align: center;
              border-top: 1px solid #ccc;
              margin-top: 20px;
              padding-top: 15px;
              font-size: 14px;
              color: #888;
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="ticket-container">
            <div class="ticket-header">
              <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhShuZLBhKY6u06m0lzMIW5lB2vI-_NEcCUi4Lm0rNehiwVw_iB625p9YmYTrtheR_jQvb4C1eIpKrDwr0n_jwNOMcdNKuek79wn86QCJBv7-bhaafn8ZPuJBkQ8nlH7SGV7Bo4tVa2FhD_grlHYXUiz4x1gIZpUAGVvYB4Y9j47bgiTeK1zg6u0Jbpq0ii/s416/LOGO.png" alt="Logo">
              <h2>Boleto de Participación</h2>
              <p>Rifas Demo - Evento 30 DIC 2024 - 08:00 PM</p>
            </div>
            <div class="ticket-info">
              ${contenido.innerHTML}
            </div>
            <div class="ticket-footer">
              Este boleto es personal e intransferible. Para validar tu participación, debes haber enviado tu comprobante.
              <br>
              Contacto: Soporte WhatsApp +322 323 232323
            </div>
          </div>
        </body>
      </html>
    `);
    ventanaImpresion.document.close();
  }
}




  exportarExcel() {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.usuarios);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Usuarios');
    XLSX.writeFile(wb, 'usuarios_lottery001.xlsx');
  }

  exportarPDF() {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Nombre', 'Código de Área', 'Celular', 'Números comprados']],
      body: this.usuarios.map(u => [u.nombre, u.codigoArea, u.celular, u.numeros])
    });
    doc.save('usuarios_lottery001.pdf');
  }


}