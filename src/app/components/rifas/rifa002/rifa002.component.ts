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
import { FirebaseService } from 'src/app/services/firebase.service';

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

  totalPagar: number = 0;

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
      imagen:'lottery02.jpg',
    },
  ];
  
  public disabledIds: any [] = []; // Aquí guardamos los IDs deshabilitados

  prices: { [key: number]: number } = {}; // Diccionario para almacenar los precios asociados a cada número

  progressPercentage: number = 0;

  campoBusqueda: 'celular' | 'cedula' = 'celular'; // valor por defecto
  
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

    this.form = this.fb.group({
      campoBusqueda: ['celular', Validators.required], // Por defecto celular
      valorBusqueda: ['', Validators.required]
    });


  }

  

  get nombre(){
    return this.userForm.get('nombre') as FormControl;
  }

  get celular(){
    return this.userForm.get('celular') as FormControl;
  }

  get cedula(){
    return this.userForm.get('cedula') as FormControl;
  }

  get correo(){
    return this.userForm.get('correo') as FormControl;
  }

  get codigoArea() {
    return this.userForm.get('codigoArea');
  }

   async ngOnInit() {
    this.getRaffleData();
    this.updateButtonState();

    this.userForm.valueChanges.subscribe(() => {
      this.updateButtonState();
    });

    this.cantidadSeleccionada = 2;

    try {
      this.disabledIds = await this.firebaseService.getDisabledNumbersFromCollection('lottery02');
      
      // Generar todos los números (por ejemplo, 1 a 100)
      const totalNumeros = 100;
      const todosLosNumeros = this.generateNumbers(totalNumeros);

      // Selecciona automáticamente los primeros n disponibles
      setTimeout(() => {
        this.seleccionarNumerosAleatorios(this.cantidadSeleccionada);
      });

      // Deshabilitar los que están en Firestore
      this.items = todosLosNumeros.map((item: any) => ({
        ...item,
        disabled: this.disabledIds.includes(item.id)
      }));

       // 👇 genera y asigna números automáticamente al cargar
      this.numeroelegido = this.generarNumerosAleatorios(this.cantidadSeleccionada);
      this.updateProgress();
      this.updateButtonState();
      this.cdr.detectChanges();
      
    } catch (error) {
      console.error('Error al obtener los números de Firestore:', error);
    }
    
  }



  generarNumerosAleatorios(cantidad: number): string[] {
    const numeros: string[] = [];
    const usados = new Set<number>();

    while (numeros.length < cantidad) {
      const random = Math.floor(Math.random() * 10000);
      if (!usados.has(random)) {
        usados.add(random);
        numeros.push(random.toString().padStart(5, '0'));
      }
    }

    return numeros;
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

    this.numeroelegido = [...seleccionados];

    this.actualizarTotalPagar();

    this.cdr.detectChanges();
  }

  actualizarTotalPagar() {
    this.totalPagar = this.numeroelegido.reduce((total, id) => {
      const item = this.items.find(i => i.id === id);
      return item ? total + item.price : total;
    }, 0);
  }


  generateNumbers(total: number): any[] {
    const generatedItems = [];

    for (let i = 1; i <= total; i++) {
      const id = i.toString().padStart(5, '0'); // ejemplo: 00001, 00002
      generatedItems.push({
        id,
        price: 20,
        disabled: false
      });
    }

    return generatedItems;
  }

 


  seleccionarCantidad(cantidad: number) {
    this.cantidadSeleccionada = cantidad;
  }

  sumarCantidad() {
    if (this.cantidadSeleccionada < 50) {
      this.cantidadSeleccionada++;
      this.seleccionarNumerosAleatorios(this.cantidadSeleccionada);
    }
  }

  restarCantidad() {
    if (this.cantidadSeleccionada > 2) {
      this.cantidadSeleccionada--;
      this.seleccionarNumerosAleatorios(this.cantidadSeleccionada);
    }
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
    codigoArea: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(4)]],

    nombre: ['', [
      Validators.required,
      Validators.minLength(3),
      Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')  // Solo letras y espacios
    ]],

    cedula: ['', [
      Validators.required,
      Validators.pattern('^[0-9]{6,10}$') // entre 6 y 10 dígitos
    ]],

    correo: ['', [
      Validators.required,
      Validators.email // validación de correo estándar
    ]],

    celular: ['', [
      Validators.required,
      Validators.pattern('^[0-9]{7,15}$') // solo números, 7 a 15 dígitos
    ]]
    
  })

  // Función para actualizar el estado del botón
  updateButtonState(): void {
    this.isButtonDisabled = !this.userForm.valid || this.numeroelegido.length < 2;
    this.showNumberMessage = this.numeroelegido.length > 0 && this.numeroelegido.length < 2;
  }

  irHome() {
    this.router.navigate(['/']);
  }

  seguirComprando() {
    this.router.navigate(['/rifa']);
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
    
    //this.isUser = true;
    setTimeout(() => {
      this.isSubmit = false;
    }, 800);

  } else {
    this.showAlertModal();
  }
}


  printDiv(divId: string) {
    const printContents = document.getElementById(divId)?.innerHTML;
    const originalContents = document.body.innerHTML;

    if (printContents) {
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload(); // recarga la página para volver al estado original
    }
  }

  

  getRaffleData(): void {
  let campo = this.form.get('campoBusqueda')?.value?.trim().toLowerCase();
  const valor = this.form.get('valorBusqueda')?.value?.trim();

  if (campo === 'cédula') campo = 'cedula'; // normalizar

  if (!valor || (campo !== 'celular' && campo !== 'cedula')) {
    this.modalItems = [];
    return;
  }

  this.modalItems = [];

  this.firebaseService.getCollectionDataByField('lottery02', campo as 'celular' | 'cedula', valor)
    .then(data => {
      if (data.length > 0) {
        this.modalItems = data.map(item => ({
          celular: item.celular || 'No disponible',
          nombre: item.nombre || 'No disponible',
          cedula: item.cedula || 'No disponible',
          correo: item.correo || 'No disponible',
          elegirnumero: Array.isArray(item.elegirnumero)
            ? item.elegirnumero.map((num: number | string) => String(num).padStart(5, '0'))
            : []
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

    this.actualizarTotalPagar();

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
      const item = this.items.find(i => i.id === id.toString().padStart(5, '0'));
      return item ? total + item.price : total;
    }, 0);
  }


 generarEnlaceWhatsApp(): string {
    const baseUrl = 'https://api.whatsapp.com/send';
    const numeroSoporte = '+5804248070175'; // Número de soporte
    const nombre = this.userForm.get('nombre')?.value || 'Cliente';

    // Formatear los boletos a 4 dígitos
    const boletos = this.numeroelegido
      .map((num: number | string) => String(Number(num)).padStart(5, '0'))
      .join(', ');

    // Calcular el precio total
    const totalBs = this.getTotalPrice();

    // Construir el mensaje
    const mensaje = `Hola, soy ${nombre}. Quiero confirmar mi compra.\n
    Boletos elegidos: ${boletos}\n
    Total a pagar: $ ${totalBs}\n
    Banco: ${this.bancoelegido?.banco}\n
    Cuenta: ${this.bancoelegido?.numero}\n
    Titular: ${this.bancoelegido?.titular}\n
    Por favor, confirma que el pago fue recibido. ¡Gracias!`;

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
