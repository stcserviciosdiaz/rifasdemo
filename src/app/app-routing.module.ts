import { Routes } from '@angular/router';
import { FaqsComponent } from './components/faqs/faqs.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { HomeComponent } from './components/home/home.component';
import { RifasComponent } from './components/rifas/rifas.component';

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
    path: 'rifas',
    component: RifasComponent
  },
  {
    path: '**',
    component: PageNotFoundComponent
  },
];