import { Component, AfterViewInit, OnInit } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavComponent } from '../nav/nav.component';
import { FooterComponent } from "../footer/footer.component";
import { FirebaseService } from 'src/app/services/firebase.service';
import { DialogContentExampleDialog } from '../dialog/dialog.component';
import { TerminosycondicionesContentExampleDialog } from '../modals/terminosycondiciones/terminosycondiciones.component';

declare var bootstrap: any;



@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [
    MatExpansionModule,
    MatButtonModule,
    MatMenuModule,
    RouterModule,
    CommonModule,
    NavComponent,
    DialogContentExampleDialog,
    TerminosycondicionesContentExampleDialog,
    FooterComponent
]
})
export class HomeComponent implements OnInit {

  constructor(  ) { }

  ngOnInit(): void {
  } 

  ngAfterViewInit(): void {
    const myModalEl = document.getElementById('myModal');
    if (myModalEl) {
      const modal = new bootstrap.Modal(myModalEl);  // <--- esto es válido si bootstrap está bien cargado
      modal.show();
    }
  }

  imagendelarifa = [
    { id:'1', 
      imagen:'lottery01.jpg',
    },
  ];

}
