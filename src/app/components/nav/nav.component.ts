import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css'],
  standalone: true,
  imports: [
    MatExpansionModule, 
    MatButtonModule, 
    MatMenuModule, 
    RouterModule, 
    CommonModule
  ]
})
export class NavComponent {


  logodelarifa = [
    { id:'1', 
      imagen:'logo.png',
    },
  ];

  idSeleccionado1 = '1';
  idSeleccionado2 = '2';
  idSeleccionado3 = '3';

  loteriadelarifa = [
    { id:'1', 
      imagen:'conalot.png',
    },
    { id:'2', 
      imagen:'tachira.png',
    },
    { id:'3', 
      imagen:'supergana.png',
    },
  ];

}
