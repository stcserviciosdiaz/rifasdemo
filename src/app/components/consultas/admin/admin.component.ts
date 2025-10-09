import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, AfterViewInit, ChangeDetectorRef, Injectable} from '@angular/core';
import { MatButtonModule} from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DEFAULT_OPTIONS} from '@angular/material/dialog';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { FirebaseService } from 'src/app/services/firebase.service';

import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from 'src/app/guards/auth.service';
import { EmailService } from './../../../services/email.service';

import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { collection, getDocs, deleteDoc, doc, getFirestore, Firestore, onSnapshot } from '@angular/fire/firestore';

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import * as alertify from 'alertifyjs';
import { getFunctions, httpsCallable } from '@angular/fire/functions';
import { getApp } from 'firebase/app';

/**
 * @title Dialog with header, scrollable content and actions
 */
@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  standalone: true,
  providers: [EmailService],
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
  rifaActual: any = null;

  // 🔹 Variables para el progreso de la rifa
  totalBoletosVendidos: number = 0;
  totalBoletosDisponibles: number = 1000; // <-- cámbialo dinámicamente según la rifa
  progressPercentage: number = 0;

  paginaActual = 1;
  itemsPorPagina = 8;
  totalPaginas = 1;

  totalUsuarios: number = 0;
  topUsuarios: any [] = [];
  

  constructor(
    private authService: AuthService,
    private firebaseService: FirebaseService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private firestore: Firestore,
    private sanitizer: DomSanitizer,
    private emailService: EmailService
  ) {}

  
  
  async ngOnInit() {
    this.cargarRifa('lottery01');
    const snapshot = await getDocs(collection(this.db, 'lottery01', 'lottery02'));
    
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
    { 
      name: 'Loteria 01',
      imagen: 'lottery01.jpg', 
      coleccion: 'lottery01',
      totalBoletos: 1000
    },
    {
      name: 'Loteria 02', 
      imagen: 'lottery02.jpg',
      coleccion: 'lottery02',
      totalBoletos: 9999
    }
  ];
  

  calcularEstadisticas() {
    // Total de usuarios
    this.totalUsuarios = this.usuarios.length;
    const boletosPorUsuario: { [key: string]: { nombre: string; cantidadBoletos: number } } = {};

    this.usuarios.forEach(usuario => {
      const nombreNormalizado = usuario.nombre.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const cantidadBoletos = usuario.numeros ? usuario.numeros.split(',').length : 0;

      if (boletosPorUsuario[nombreNormalizado]) {
        boletosPorUsuario[nombreNormalizado].cantidadBoletos += cantidadBoletos;
      } else {
        boletosPorUsuario[nombreNormalizado] = {
          nombre: usuario.nombre, 
          cantidadBoletos: cantidadBoletos
        };
      }
    });
    const usuariosAgrupados = Object.values(boletosPorUsuario);
    this.topUsuarios = usuariosAgrupados
      .sort((a, b) => b.cantidadBoletos - a.cantidadBoletos)
      .slice(0, 1);
  }

  get usuariosPaginados() {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.usuariosFiltrados.slice(inicio, fin);
  }

  get usuariosFiltradosPaginados() {
    const filtrados = this.usuariosFiltrados;
    this.totalPaginas = Math.ceil(filtrados.length / this.itemsPorPagina);

    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return filtrados.slice(inicio, fin);
  }

  paginaAnterior() {
    if (this.paginaActual > 1) {
      this.paginaActual--;
    }
  }

  paginaSiguiente() {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
    }
  }


cargarRifa(nombreColeccion: string) {
  this.rifaSeleccionada = nombreColeccion;
  const coleccionRef = collection(this.firestore, nombreColeccion);

  // 🔹 Guardar la info de la rifa actual
  this.rifaActual = this.imagendelarifa.find(r => r.coleccion === nombreColeccion);

  // 1️⃣ Buscar info de la rifa seleccionada
  const rifaInfo = this.imagendelarifa.find(r => r.coleccion === nombreColeccion);
  this.totalBoletosDisponibles = rifaInfo ? rifaInfo.totalBoletos : 0;

  // 🔥 Escuchar en tiempo real cambios en la colección
  onSnapshot(coleccionRef, (snapshot) => {
    this.usuarios = snapshot.docs.map((doc, index) => {
      const data = doc.data();
      const form = data['form'] || {};

      return {
        numberuser: index + 1,
        id: doc.id,
        nombre: form['nombre'] || 'No definido',
        codigoArea: form['codigoArea'] || '',
        celular: form['celular'] || '',
        correo: form['correo'] || 'No definido',
        numeros: Array.isArray(data['elegirnumero'])
          ? data['elegirnumero'].map((num: number) => num.toString().padStart(4, '0')).join(', ')
          : ''
      };
    });

    // 2️⃣ Calcular boletos vendidos
    this.totalBoletosVendidos = this.usuarios.reduce((acc, usuario) => {
      const cantidad = usuario.numeros ? usuario.numeros.split(',').length : 0;
      return acc + cantidad;
    }, 0);

    // 3️⃣ Calcular porcentaje
    this.progressPercentage = this.totalBoletosDisponibles > 0
      ? (this.totalBoletosVendidos / this.totalBoletosDisponibles) * 100
      : 0;

    this.calcularEstadisticas();  

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

  async eliminarRegistro(usuario: any, index: number) {
    const confirmacion = window.confirm(`¿Estás seguro de que quieres eliminar la reserva de ${usuario.nombre}?`);
    if (!confirmacion) {
      return; // Si el usuario cancela, no hacemos nada
    }
    try {
      await deleteDoc(doc(this.db, this.rifaSeleccionada, usuario.id));

      // Remover solo de la página actual y del listado general
      this.usuarios = this.usuarios.filter(u => u.id !== usuario.id);

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
    
    Te saluda el equipo de @${this.rifaActual.name}

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
                <p>${this.rifaActual.name}</p>
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
      body: this.usuarios.map(u => [u.nombre, u.codigoArea, u.celular, u.correo, u.numeros])
    });
    doc.save('usuarios_lottery001.pdf');
  }


  enviarCorreo(usuario: any): void {
    const asunto = `Confirmación de participación - ${this.rifaActual.name}`;
    const cuerpo = `
    Hola ${usuario.nombre},

    Gracias por participar en la rifa 🎉 ${this.rifaActual.name}
    Tus números registrados son: ${usuario.numeros}.

    ¡Mucha suerte!

    -- Equipo de ${this.rifaActual.name}`;

      const mailto = `mailto:${usuario.correo}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
      window.open(mailto, '_blank');
  }


/* async enviarCorreo(usuario: any) {
    try {
      const id = await this.emailService.sendMail({
        to: [{ email: usuario.correo, name: usuario.nombre }],
        from: { email: 'no-reply@test-69oxl5e7kzxl785k.mlsender.net', name: 'Mi App' },
        subject: '🎫 Prueba desde Angular + MailerSend ext',
          html: `
          <div style="font-family:sans-serif; color:#333;">
            <h2>¡Hola ${usuario.nombre}! 🎉</h2>
            <p>Gracias por participar en <strong>${this.rifaSeleccionada}</strong>.</p>
            <p>Tus números registrados son:</p>
            <h3 style="color:#007bff;">${usuario.numeros}</h3>
            <p>¡Te deseamos mucha suerte!</p>
            <hr/>
            <small>Este mensaje fue enviado por ${this.rifaSeleccionada}</small>
          </div>
        `
      });
      console.log('Documento creado con id:', id);
      alert('✅ Correo enviado con éxito');
    } catch (err) {
      console.error('❌ Error al enviar el correo:', err);
      alert('Error al enviar el correo');
    }
  } */






}