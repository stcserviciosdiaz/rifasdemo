import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import { NavComponent } from '../nav/nav.component';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterModule } from '@angular/router';
import {MatTableModule} from '@angular/material/table';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatChipsModule} from '@angular/material/chips';
import { MatDialog, MatDialogModule, MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';

import * as alertify from 'alertifyjs';


import {merge, switchAll} from 'rxjs';


import {FormBuilder, FormControl, Validators, FormsModule, ReactiveFormsModule, FormGroup} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatStepperModule} from '@angular/material/stepper';
import { DialogContentExampleDialog } from '../dialog/dialog.component';
import { FooterComponent } from '../footer/footer.component';
import { FirebaseService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-home',
  templateUrl: './rifas.component.html',
  styleUrls: ['./rifas.component.css'],
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



export class RifasComponent implements OnInit {
  
  public items: any = [
    { id: 1, price: 2, disabled: false},
    { id: 2, price: 2, disabled: false},
    {id: 3,price: 2,},{id: 4,price: 2,},{id: 5,price: 2,},{id: 6,price: 2,},{id: 7,price: 2,},{id: 8,price: 2,},{id: 9,price: 2,},{id: 10,price: 2,},
    {id: 11,price: 2,},{id: 12,price: 2,},{id: 13,price: 2,},{id: 14,price: 2,},{id: 15,price: 2,},{id: 16,price: 2,},{id: 17,price: 2,},{id: 18,price: 2,},{id: 19,price: 2,},{id: 20,price: 2,},
    {id: 21,price: 2,},{id: 22,price: 2,},{id: 23,price: 2,},{id: 24,price: 2,},{id: 25,price: 2,},{id: 26,price: 2,},{id: 27,price: 2,},{id: 28,price: 2,},{id: 29,price: 2,},{id: 30,price: 2,},
    {id: 31,price: 2,},{id: 32,price: 2,},{id: 33,price: 2,},{id: 34,price: 2,},{id: 35,price: 2,},{id: 36,price: 2,},{id: 37,price: 2,},{id: 38,price: 2,},{id: 39,price: 2,},{id: 40,price: 2,},
    {id: 41,price: 2,},{id: 42,price: 2,},{id: 43,price: 2,},{id: 44,price: 2,},{id: 45,price: 2,},{id: 46,price: 2,},{id: 47,price: 2,},{id: 48,price: 2,},{id: 49,price: 2,},{id: 50,price: 2,},
    {id: 51,price: 2,},{id: 52,price: 2,},{id: 53,price: 2,},{id: 54,price: 2,},{id: 55,price: 2,},{id: 56,price: 2,},{id: 57,price: 2,},{id: 58,price: 2,},{id: 59,price: 2,},{id: 60,price: 2,},
    {id: 61,price: 2,},{id: 62,price: 2,},{id: 63,price: 2,},{id: 64,price: 2,},{id: 65,price: 2,},{id: 66,price: 2,},{id: 67,price: 2,},{id: 68,price: 2,},{id: 69,price: 2,},{id: 70,price: 2,},
    {id: 71,price: 2,},{id: 72,price: 2,},{id: 73,price: 2,},{id: 74,price: 2,},{id: 75,price: 2,},{id: 76,price: 2,},{id: 77,price: 2,},{id: 78,price: 2,},{id: 79,price: 2,},{id: 80,price: 2,},
    {id: 81,price: 2,},{id: 82,price: 2,},{id: 83,price: 2,},{id: 84,price: 2,},{id: 85,price: 2,},{id: 86,price: 2,},{id: 87,price: 2,},{id: 88,price: 2,},{id: 89,price: 2,},{id: 90,price: 2,},
    {id: 91,price: 2,},{id: 92,price: 2,},{id: 93,price: 2,},{id: 94,price: 2,},{id: 95,price: 2,},{id: 96,price: 2,},{id: 97,price: 2,},{id: 98,price: 2,},{id: 99,price: 2,},{id: 100,price: 2,},
    {id: 101,price: 2,},{id: 102,price: 2,},{id: 103,price: 2,},{id: 104,price: 2,},{id: 105,price: 2,},{id: 106,price: 2,},{id: 107,price: 2,},{id: 108,price: 2,},{id: 109,price: 2,},{id: 110,price: 2,},
    {id: 111,price: 2,},{id: 112,price: 2,},{id: 113,price: 2,},{id: 114,price: 2,},{id: 115,price: 2,},{id: 116,price: 2,},{id: 117,price: 2,},{id: 118,price: 2,},{id: 119,price: 2,},{id: 120,price: 2,},
    {id: 121,price: 2,},{id: 122,price: 2,},{id: 123,price: 2,},{id: 124,price: 2,},{id: 125,price: 2,},{id: 126,price: 2,},{id: 127,price: 2,},{id: 128,price: 2,},{id: 129,price: 2,},{id: 130,price: 2,},
    {id: 131,price: 2,},{id: 132,price: 2,},{id: 133,price: 2,},{id: 134,price: 2,},{id: 135,price: 2,},{id: 136,price: 2,},{id: 137,price: 2,},{id: 138,price: 2,},{id: 139,price: 2,},{id: 140,price: 2,},
    {id: 141,price: 2,},{id: 142,price: 2,},{id: 143,price: 2,},{id: 144,price: 2,},
  ];

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
  
    
  
  constructor(
    
    private fb: FormBuilder,
    private router: Router,
    private firebaseService: FirebaseService,
    private cdr: ChangeDetectorRef // Inyecta ChangeDetectorRef

   
    
  ) {}

  

  get nombre(){
    return this.userForm.get('nombre') as FormControl;
  }

  get celular(){
    return this.userForm.get('celular') as FormControl;
  }

  get codigoArea() {
    return this.userForm.get('codigoArea');
  }


  async ngOnInit() {
    //this.startCountdown();

    // Inicializa el estado del botón y del mensaje al cargar la vista
    this.updateButtonState();

    // Suscribirse a los cambios en el formulario para actualizar el botón en tiempo real
    this.userForm.valueChanges.subscribe(() => {
      this.updateButtonState();
    });

    this.firebaseService.getDisabledNumbersFromCollection('lottery')
      .then(numbers => {
        this.disabledIds = numbers;
        //console.log('Números deshabilitados:', this.disabledIds);

        // Calcular el porcentaje de progreso
        this.updateProgress();

        // Modifica cada item para añadir la propiedad `disabled`
        this.items = this.items.map((item: any) => {
          return {
            ...item,
            disabled: this.disabledIds.includes(item.id.toString()) // Convierte `item.id` a string si es necesario
          };
        });
        // Forzar la detección de cambios después de actualizar los items
        this.cdr.detectChanges();
        //console.log('Items después de modificar:', this.items)
      })
      .catch(error => {
        console.error('Error al obtener los números de Firestore:', error);
      });
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

  onSubmit(){
    if (this.numeroelegido.length >= 2) {
      const formData = this.userForm.value;
      const selectedData = {
        form: formData,
        elegirnumero: this.numeroelegido
      };
      this.firebaseService.addData('lottery', selectedData )
      this.submitMessage = alertify.success('Gracias por participar, Muchas suerte... ');
      
      this.isUser = true;
      setTimeout(()=>{
        this.isSubmit=false;
      },800);
    }else{
      this.showAlertModal();  // Mostrar alerta si intentan enviar sin suficientes números
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
    let total = 0;
    this.precioelegido.forEach(item => {
      total += item;
    });
    return this.numeroelegido.reduce((total, num) => total + this.prices[num], 0);
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










}
