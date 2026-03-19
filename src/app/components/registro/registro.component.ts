import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule,
            MatFormFieldModule, MatInputModule, MatButtonModule,
            MatIconModule, MatProgressSpinnerModule],
  template: `
  <div class="registro-shell">

    <!-- Panel izquierdo: branding -->
    <div class="brand-panel">
      <mat-icon class="brand-icon">health_and_safety</mat-icon>
      <h1 class="brand-title">FisioIA</h1>
      <p class="brand-sub">Asistente Clínico Inteligente</p>
      <ul class="brand-features">
        <li><mat-icon>check_circle</mat-icon> Gestión completa de pacientes</li>
        <li><mat-icon>check_circle</mat-icon> Historial clínico cifrado</li>
        <li><mat-icon>check_circle</mat-icon> IA asistida por Claude</li>
        <li><mat-icon>check_circle</mat-icon> Cumplimiento RGPD / LOPD-GDD</li>
      </ul>
    </div>

    <!-- Panel derecho: formulario -->
    <div class="form-panel">
      <div class="form-card">
        <h2 class="form-title">Crear nueva clínica</h2>
        <p class="form-sub">Regístrate gratis — plan Free incluido</p>

        <form [formGroup]="form" (ngSubmit)="registrar()" class="form">

          <p class="seccion-label">Datos de la clínica</p>
          <mat-form-field appearance="outline" class="field">
            <mat-label>Nombre de la clínica</mat-label>
            <mat-icon matPrefix>business</mat-icon>
            <input matInput formControlName="nombre_clinica" placeholder="Ej: Clínica FisioSalud">
            <mat-error *ngIf="form.get('nombre_clinica')?.hasError('required')">Campo obligatorio</mat-error>
          </mat-form-field>

          <p class="seccion-label">Administrador</p>
          <mat-form-field appearance="outline" class="field">
            <mat-label>Tu nombre</mat-label>
            <mat-icon matPrefix>person</mat-icon>
            <input matInput formControlName="nombre_admin" placeholder="Ej: Carlos Martínez">
            <mat-error *ngIf="form.get('nombre_admin')?.hasError('required')">Campo obligatorio</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="field">
            <mat-label>Email</mat-label>
            <mat-icon matPrefix>email</mat-icon>
            <input matInput formControlName="email" type="email" placeholder="admin@tuclinica.com">
            <mat-error *ngIf="form.get('email')?.hasError('required')">Campo obligatorio</mat-error>
            <mat-error *ngIf="form.get('email')?.hasError('email')">Email no válido</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="field">
            <mat-label>Contraseña</mat-label>
            <mat-icon matPrefix>lock</mat-icon>
            <input matInput formControlName="password"
              [type]="mostrarPass ? 'text' : 'password'">
            <button mat-icon-button matSuffix type="button" (click)="mostrarPass = !mostrarPass">
              <mat-icon>{{ mostrarPass ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            <mat-error *ngIf="form.get('password')?.hasError('required')">Campo obligatorio</mat-error>
            <mat-error *ngIf="form.get('password')?.hasError('minlength')">Mínimo 6 caracteres</mat-error>
          </mat-form-field>

          <div class="error-msg" *ngIf="error">
            <mat-icon>error_outline</mat-icon> {{ error }}
          </div>

          <button mat-raised-button color="primary" class="btn-submit"
            type="submit" [disabled]="form.invalid || cargando">
            <mat-spinner diameter="18" *ngIf="cargando"></mat-spinner>
            <span *ngIf="!cargando">Crear clínica</span>
          </button>

          <p class="login-link">
            ¿Ya tienes cuenta? <a routerLink="/login">Iniciar sesión</a>
          </p>

        </form>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .registro-shell {
      display: flex;
      height: 100vh;
      overflow: hidden;
      font-family: 'Roboto', sans-serif;
    }

    /* Panel izquierdo */
    .brand-panel {
      width: 40%;
      background: linear-gradient(160deg, #1b5e20 0%, #2e7d32 60%, #43a047 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 36px;
      color: white;
      gap: 12px;
    }
    .brand-icon { font-size: 64px; width: 64px; height: 64px; opacity: 0.9; }
    .brand-title { font-size: 2.2rem; font-weight: 800; margin: 0; letter-spacing: -1px; }
    .brand-sub { font-size: 1rem; opacity: 0.75; margin: 0 0 24px; }
    .brand-features { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
    .brand-features li { display: flex; align-items: center; gap: 10px; font-size: 0.95rem; opacity: 0.9; }
    .brand-features mat-icon { font-size: 18px; width: 18px; height: 18px; color: #a5d6a7; }

    /* Panel derecho */
    .form-panel {
      flex: 1;
      background: #f5f7fb;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      overflow-y: auto;
    }
    .form-card {
      background: white;
      border-radius: 16px;
      padding: 36px 40px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
      width: 100%;
      max-width: 440px;
    }
    .form-title { font-size: 1.5rem; font-weight: 700; color: #1a1a1a; margin: 0 0 4px; }
    .form-sub { font-size: 0.88rem; color: #78909c; margin: 0 0 24px; }

    .form { display: flex; flex-direction: column; gap: 4px; }
    .seccion-label { font-size: 12px; font-weight: 600; color: #388e3c; text-transform: uppercase;
      letter-spacing: 0.5px; margin: 12px 0 0; }
    .field { width: 100%; }

    .error-msg {
      display: flex; align-items: center; gap: 6px;
      color: #c62828; font-size: 13px;
      background: #ffebee; border-radius: 8px;
      padding: 8px 12px; margin-top: 4px;
    }

    .btn-submit {
      width: 100%; height: 46px; font-size: 1rem;
      font-weight: 600; margin-top: 8px;
      display: flex; align-items: center; justify-content: center; gap: 8px;
    }

    .login-link { text-align: center; font-size: 0.87rem; color: #78909c; margin: 12px 0 0; }
    .login-link a { color: #2e7d32; font-weight: 600; text-decoration: none; }
    .login-link a:hover { text-decoration: underline; }

    @media (max-width: 680px) {
      .brand-panel { display: none; }
    }
  `]
})
export class RegistroComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);
  private fb     = inject(FormBuilder);

  mostrarPass = false;
  cargando    = false;
  error       = '';

  form = this.fb.group({
    nombre_clinica: ['', Validators.required],
    nombre_admin:   ['', Validators.required],
    email:          ['', [Validators.required, Validators.email]],
    password:       ['', [Validators.required, Validators.minLength(6)]]
  });

  registrar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.cargando = true;
    this.error    = '';
    this.auth.registrarClinica(this.form.value as any).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => {
        this.error   = err.error?.error ?? 'Error al crear la clínica';
        this.cargando = false;
      }
    });
  }
}
