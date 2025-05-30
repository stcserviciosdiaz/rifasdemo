import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import { NavComponent } from '../../nav/nav.component';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterModule } from '@angular/router';
import {MatTableModule} from '@angular/material/table';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatChipsModule} from '@angular/material/chips';
import { MatDialog, MatDialogModule, MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { NumerosService  } from '../../../services/numeros.service'

import * as alertify from 'alertifyjs';


import {merge, switchAll} from 'rxjs';


import {FormBuilder, FormControl, Validators, FormsModule, ReactiveFormsModule, FormGroup} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatStepperModule} from '@angular/material/stepper';
import { DialogContentExampleDialog } from '../../dialog/dialog.component';
import { FooterComponent } from '../../footer/footer.component';
import { FirebaseService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-rifa002',
  templateUrl: './rifa002.component.html',
  styleUrls: ['./rifa002.component.css'],
  standalone: true,
  imports: [
    FooterComponent,
    MatExpansionModule,
    MatTableModule, 
    MatChipsModule,
    MatButtonModule,
    MatDialogModule,
    MatDividerModule, 
    MatIconModule, 
    MatMenuModule, 
    RouterModule, 
    CommonModule,
    MatInputModule, FormsModule, ReactiveFormsModule,
    MatStepperModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    NavComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
})



export class Rifa002Component implements OnInit {

  opciones = [2, 5, 10, 20, 30, 50];
  cantidadSeleccionada = 2;

  public currentPage: number = 1;
  public itemsPerPage: number = 1000;

  // Obtener los elementos de la página actual
  get paginatedItems() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.items.slice(start, end);
  }

  // Cambiar página
  changePage(page: number) {
    this.currentPage = page;
  }

  // Obtener el número total de páginas
  get totalPages(): number {
    return Math.ceil(this.items.length / this.itemsPerPage);
  }

  modalItems: any[] = []; // Para los datos del modal

  codigosDeArea: string[] = ['+1', '+44', '+33', '+34', '+55', '+91', '+81', '+61', '+49', '+51', '+52', '+53', '+56', '+57', '+58', '+593', '+591', '+595', '+598', '+502', '+503', '+504'];

  bancoelegido: any;

  numeroelegido: any[] = [];

  precioelegido: number[] = [];
  
  submitMessage: string = '';

  numberMessage: string = 'Debes seleccionar al menos 2 números para entrar entre los próximos ganadores.';

  showNumberMessage: boolean = false;  // Propiedad para mostrar/ocultar el mensaje

  isButtonDisabled: boolean = true;  // Estado para deshabilitar el botón

  isSubmit = true;

  isUser = false;

  bancoelegidoId: number | null = null;

  form: FormGroup;
  //celular: string = ''; // Variable para almacenar el número de celular ingresado

  listadebancos = [
    { id: 1,
      banco: 'BBVA ProvincialBANCO EXTERIOR, C.A',
      titular: 'Rifas', 
      numero: '5180936787222195',
      imagen:'banco1.png',
    },
    { id: 2,
      banco: 'BANCO DE VENEZUELA, S.A.C.A.',
      titular: 'Rifas', 
      numero: '5257393708612336',
      imagen:'banco2.png',
    },
    { id: 3,
      banco: 'BANCO CARACAS, C.A',
      titular: 'Rifas', 
      numero: '5547904706150846',
      imagen:'banco3.png',
    },
  ];

  imagendelarifa = [
    { id:'1', 
      imagen:'bannerdemoc-12.jpg',
    },
  ];
  
  public disabledIds: any [] = []; // Aquí guardamos los IDs deshabilitados

  prices: { [key: number]: number } = {}; // Diccionario para almacenar los precios asociados a cada número

  progressPercentage: number = 0;
  
  public items: any[] = [];
  //public celular: string = ''; // Variable para el número de celular ingresado
  
  constructor(
    
    private fb: FormBuilder,
    private router: Router,
    private firebaseService: FirebaseService,
    private cdr: ChangeDetectorRef // Inyecta ChangeDetectorRef

   
    
  ) {

    this.form = this.fb.group({
      celular: ['']
    });
  }

  

  get nombre(){
    return this.userForm.get('nombre') as FormControl;
  }

  get celular(){
    return this.userForm.get('celular') as FormControl;
  }

  get codigoArea() {
    return this.userForm.get('codigoArea');
  }


  

  elegirCantidadYSeleccionar(cantidad: number) {
    this.cantidadSeleccionada = cantidad;
    this.seleccionarNumerosAleatorios(cantidad);
  }


  seleccionarNumerosAleatorios(cantidad: number) {
    const disponibles = this.items.filter(item => !item.disabled && !this.numeroelegido.includes(item.id));
    
    if (disponibles.length < cantidad) {
      alert('No hay suficientes números disponibles.');
      return;
    }

    const seleccionados: string[] = [];
    while (seleccionados.length < cantidad) {
      const aleatorio = disponibles[Math.floor(Math.random() * disponibles.length)];
      if (!seleccionados.includes(aleatorio.id)) {
        seleccionados.push(aleatorio.id);
      }
    }

    this.numeroelegido = seleccionados;
    this.cdr.detectChanges();
  }


  generateNumbers(total: number): any[] {
    const generatedItems = [];

    for (let i = 1; i <= total; i++) {
      const id = i.toString().padStart(5, '0'); // ejemplo: 00001, 00002
      generatedItems.push({
        id,
        price: 2,
        disabled: false
      });
    }

    return generatedItems;
  }

  async ngOnInit() {
    this.getRaffleData();
    this.updateButtonState();

    this.userForm.valueChanges.subscribe(() => {
      this.updateButtonState();
    });

    try {
      this.disabledIds = await this.firebaseService.getDisabledNumbersFromCollection('lottery02');
      
      // Generar todos los números (por ejemplo, 1 a 100)
      const totalNumeros = 3000;
      const todosLosNumeros = this.generateNumbers(totalNumeros);

      // Deshabilitar los que están en Firestore
      this.items = todosLosNumeros.map((item: any) => ({
        ...item,
        disabled: this.disabledIds.includes(item.id)
      }));

      this.updateProgress();
      this.cdr.detectChanges();
      
    } catch (error) {
      console.error('Error al obtener los números de Firestore:', error);
    }
  }


  seleccionarCantidad(cantidad: number) {
    this.cantidadSeleccionada = cantidad;
  }

  sumarCantidad() {
    if (this.cantidadSeleccionada < 50) this.cantidadSeleccionada++;
  }

  restarCantidad() {
    if (this.cantidadSeleccionada > 1) this.cantidadSeleccionada--;
  }


  isDisabled(id: number) {
    const disabled = this.disabledIds.includes(id.toString());
    return disabled;
  }

  updateProgress(): void {
    if (this.items.length > 0) {
      this.progressPercentage = (this.disabledIds.length / this.items.length) * 100;
    } else {
      this.progressPercentage = 0; // Asegúrate de manejar el caso cuando no hay items
    }
  }
  

  userForm = this.fb.group({
    'codigoArea': ['', Validators.required],
    'nombre': ['', Validators.required,],
    'celular': ['', [Validators.required, Validators.pattern('^\\+?[0-9]\\d{1,14}$')]]
  })

  // Función para actualizar el estado del botón
  updateButtonState(): void {
    this.isButtonDisabled = !this.userForm.valid || this.numeroelegido.length < 2;
    this.showNumberMessage = this.numeroelegido.length > 0 && this.numeroelegido.length < 2;
  }


  confirmarBoleto() {
  if (this.numeroelegido.length >= 2) {
    const formData = this.userForm.value;
    const selectedData = {
      form: formData,
      elegirnumero: this.numeroelegido
    };

    this.firebaseService.addData('lottery02', selectedData);
    alertify.success('Gracias por participar, ¡Mucha suerte!');
    
    this.isUser = true;
    setTimeout(() => {
      this.isSubmit = false;
    }, 800);

  } else {
    this.showAlertModal();
  }
}


  

  

  getRaffleData(): void { 
    const celular = String(this.form.get('celular')?.value || "").trim();
    if (celular) {
      this.modalItems = [];  // Limpiar antes de la consulta
      
      this.firebaseService.getCollectionDataByCell('lottery02', celular)
        .then(data => {
          if (data.length > 0) {
            this.modalItems = data.map(item => ({
              celular: item.celular || 'No disponible',
              nombre: item.nombre || 'No disponible',
              elegirnumero: Array.isArray(item.elegirnumero) && item.elegirnumero.length > 0 ? item.elegirnumero : []
            }));
          } else {
            alertify.error('No se encontraron datos.');
            this.modalItems = [];
          }
          this.cdr.detectChanges();
        })
        .catch(error => {
          console.error('Error:', error);
          this.modalItems = [];
        });
    } else {
      //alertify.error('Por favor ingresa un número.');
      this.modalItems = [];
    }
  }
  
 
  

  // Función que se llama cuando se selecciona o deselecciona un número
  elegirnumero(numero: number, price: number): void {
    const index = this.numeroelegido.indexOf(numero);
    if (index === -1) {
      // Si el número no está en la lista, lo añadimos
      this.numeroelegido.push(numero);
      this.prices[numero] = price;
    } else {
      // Si el número ya está en la lista, lo eliminamos
      this.numeroelegido.splice(index, 1);
      delete this.prices[numero];
    }
    // Verifica si el número seleccionado es menor a 2 
    this.showAlertModal();

    // Actualiza el estado del botón dependiendo de la cantidad de números seleccionados
    this.updateButtonState();
  }

  // Función para mostrar la alerta si no hay suficientes números seleccionados
  showAlertModal(): void {
    if (this.numeroelegido.length < 2) {
      alertify.error('Debes seleccionar al menos 2 números para entrar entre los próximos ganadores. Por favor, selecciona más números.');
    }
  }

  elegirbancos(id: number): void {
    this.bancoelegidoId = id;
    this.bancoelegido = this.listadebancos.find(banco => banco.id === id);
  }

  getClassbancoelegido(id: number): string {
    return this.bancoelegidoId === id ? 'selected' : 'not-selected';
  }

  getTotalPrice(): number {
  return this.numeroelegido.reduce((total, id) => {
    const item = this.items.find(i => i.id === id);
    return item ? total + item.price : total;
    }, 0);
  }


  // Generar enlace para enviar mensaje a WhatsApp
  generarEnlaceWhatsApp(): string {
    const baseUrl = 'https://api.whatsapp.com/send';
    const numeroSoporte = '+322323232323'; // Cambia esto por el número real de soporte
    const mensaje = `Hola, quiero confirmar mi compra. Mis boletos elegidos son: ${this.numeroelegido.join(', ')}. 
    Por favor, realiza el pago en la cuenta ${this.bancoelegido?.banco}, 
    número ${this.bancoelegido?.numero}, titular ${this.bancoelegido?.titular}.`;

    const url = `${baseUrl}?phone=${numeroSoporte}&text=${encodeURIComponent(mensaje)}`;
    return url;
  }



 

  // Componente TypeScript
  copiarNumeroCuenta(event: MouseEvent) { 
  event.preventDefault();
  event.stopPropagation(); // Evita que el evento se propague y desencadene otras acciones
  const cuenta = this.bancoelegido.numero; // Obtener el valor del número de cuenta
  if (cuenta) { // Asegúrate de que cuenta no sea undefined
    navigator.clipboard.writeText(cuenta).then(() => {
      alertify.success('Número de cuenta copiado al portapapeles: ' + cuenta);
    }).catch(err => {
      alertify.error('Error al copiar el número de cuenta: ' + err);
    });
  } else {
    alertify.error('Número de cuenta no disponible');
  }
}


 
  
  
  






}
