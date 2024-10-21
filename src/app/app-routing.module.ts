import { Routes } from '@angular/router';
import { FaqsComponent } from './components/faqs/faqs.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { HomeComponent } from './components/home/home.component';
import { Rifa001Component } from './components/rifas/rifa001/rifa001.component';
import { Rifa002Component } from './components/rifas/rifa002/rifa002.component';
import { Rifa003Component } from './components/rifas/rifa003/rifa003.component';




export const routes: Routes = [
  {
    path: '', redirectTo: '/', pathMatch: 'full'
  },
  {
    path: '',
    component: HomeComponent
  }, 
  {
    path: 'Preguntas',
    component: FaqsComponent
  },
  {
    path: 'rifa001',
    component: Rifa001Component
  },
  {
    path: 'rifa002',
    component: Rifa002Component
  },
  {
    path: 'rifa003',
    component: Rifa003Component
  },
  {
    path: '**',
    component: PageNotFoundComponent
  },
];