import { CommonModule } from '@angular/common';
import {ChangeDetectionStrategy, Component, AfterViewInit, ChangeDetectorRef} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule, MAT_DIALOG_DEFAULT_OPTIONS} from '@angular/material/dialog';
import { FooterComponent } from '../footer/footer.component';
import { NavComponent } from '../nav/nav.component';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirebaseService } from 'src/app/services/firebase.service';
import { ReactiveFormsModule } from '@angular/forms';

/**
 * @title Dialog with header, scrollable content and actions
 */
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [MatButtonModule,
    MatDialogModule,
    CommonModule,
    ReactiveFormsModule,
    NavComponent,
    FooterComponent, ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})



export class LoginComponent {

  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }


  onLogin(): void {
    const { email, password } = this.loginForm.value;

    this.firebaseService.login(email, password)
      .then(() => {
        // ✅ Redirigir al admin
        this.router.navigate(['/admin']);
      })
      .catch(error => {
        console.error('Error al iniciar sesión:', error);
        alert('Correo o contraseña incorrectos.');
      });
  }

 


}