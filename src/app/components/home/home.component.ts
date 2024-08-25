import { Component, OnInit } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavComponent } from '../nav/nav.component';
import { FooterComponent } from "../footer/footer.component";
import { FirebaseService } from 'src/app/services/firestore.service';

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
    FooterComponent
]
})
export class HomeComponent implements OnInit {

  constructor(  ) { }

  ngOnInit(): void {
  } 

  imagendelarifa = [
    { id:'1', 
      imagen:'bannerdemoc-12.jpg',
    },
  ];

}
