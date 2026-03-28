import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { PoliticaPrivacidadDialogComponent, AvisoLegalDialogComponent } from '../gdpr/gdpr.components';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatDialogModule],
  template: `
    <div class="login-root">

      <!-- Panel izquierdo: branding -->
      <div class="brand-panel">
        <div class="brand-content">
          <div class="brand-icon-wrap">
            <mat-icon class="brand-icon">health_and_safety</mat-icon>
          </div>
          <h1 class="brand-title">FisioIA</h1>
          <p class="brand-sub">Asistente Clínico Inteligente</p>
          <ul class="brand-features">
            <li><mat-icon>check_circle</mat-icon> Ficha clínica digital</li>
            <li><mat-icon>check_circle</mat-icon> IA para apoyo diagnóstico</li>
            <li><mat-icon>check_circle</mat-icon> Gestión de sesiones y citas</li>
          </ul>
        </div>
        <div class="brand-footer">Fisioterapia potenciada por IA</div>
      </div>

      <!-- Panel derecho: formulario -->
      <div class="form-panel">
        <div class="form-card">
          <div class="form-header">
            <h2 class="form-title">Bienvenido</h2>
            <p class="form-sub">Inicia sesión para continuar</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="login-form">

            <mat-form-field appearance="outline" class="field-full">
              <mat-label>Correo electrónico</mat-label>
              <mat-icon matPrefix>email</mat-icon>
              <input matInput formControlName="email" type="email" autocomplete="email" placeholder="tu@correo.com"/>
              <mat-error *ngIf="form.get('email')?.hasError('required')">El correo es obligatorio</mat-error>
              <mat-error *ngIf="form.get('email')?.hasError('email')">Formato de correo no válido</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="field-full">
              <mat-label>Contraseña</mat-label>
              <mat-icon matPrefix>lock</mat-icon>
              <input matInput formControlName="password" [type]="showPass ? 'text' : 'password'" autocomplete="current-password"/>
              <button mat-icon-button matSuffix type="button" (click)="showPass = !showPass" [attr.aria-label]="'Mostrar contraseña'">
                <mat-icon>{{ showPass ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="form.get('password')?.hasError('required')">La contraseña es obligatoria</mat-error>
            </mat-form-field>

            <div class="error-msg" *ngIf="error">
              <mat-icon>error_outline</mat-icon>
              <span>{{ error }}</span>
            </div>

            <button
              mat-flat-button
              class="btn-entrar"
              type="submit"
              [disabled]="form.invalid || cargando">
              <mat-spinner *ngIf="cargando" diameter="20" class="spinner-btn"></mat-spinner>
              <span *ngIf="!cargando">Entrar</span>
            </button>

          </form>

          <div class="registro-link">
            <a routerLink="/forgot-password">¿Olvidaste tu contraseña?</a>
          </div>

          <div class="registro-link">
            ¿No tienes cuenta? <a routerLink="/register">Crear nueva clínica</a>
          </div>

          <div class="legal-footer">
            Al iniciar sesión aceptas nuestra
            <button class="link-btn" type="button" (click)="verPolitica()">Política de privacidad</button>
            y el
            <button class="link-btn" type="button" (click)="verAvisoLegal()">Aviso legal</button>.
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .login-root {
      display: flex;
      height: 100vh;
      font-family: system-ui, sans-serif;
    }

    /* ── Panel izquierdo ── */
    .brand-panel {
      width: 420px;
      flex-shrink: 0;
      background: linear-gradient(160deg, #1b5e20 0%, #2e7d32 60%, #388e3c 100%);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 48px 40px 32px;
      color: white;
    }

    .brand-content {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .brand-icon-wrap {
      width: 72px;
      height: 72px;
      background: rgba(255,255,255,0.15);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(4px);
    }

    .brand-icon {
      font-size: 40px !important;
      width: 40px !important;
      height: 40px !important;
      color: #a5d6a7;
    }

    .brand-title {
      font-size: 40px;
      font-weight: 700;
      margin: 0;
      letter-spacing: -1px;
      color: white;
    }

    .brand-sub {
      font-size: 15px;
      margin: 0;
      opacity: 0.8;
      font-weight: 400;
      letter-spacing: 0.3px;
    }

    .brand-features {
      list-style: none;
      padding: 0;
      margin: 12px 0 0;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .brand-features li {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
      opacity: 0.9;
    }

    .brand-features mat-icon {
      font-size: 18px !important;
      width: 18px !important;
      height: 18px !important;
      color: #a5d6a7;
    }

    .brand-footer {
      font-size: 12px;
      opacity: 0.5;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    /* ── Panel derecho ── */
    .form-panel {
      flex: 1;
      background: #f5f7f2;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }

    .form-card {
      background: white;
      border-radius: 16px;
      padding: 40px 40px 36px;
      width: 100%;
      max-width: 400px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    }

    .form-header {
      margin-bottom: 28px;
    }

    .form-title {
      font-size: 26px;
      font-weight: 700;
      margin: 0 0 6px;
      color: #1b5e20;
    }

    .form-sub {
      font-size: 14px;
      color: #666;
      margin: 0;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .field-full {
      width: 100%;
    }

    .error-msg {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #fdecea;
      border: 1px solid #f5c2bb;
      border-radius: 8px;
      padding: 10px 14px;
      color: #c62828;
      font-size: 13px;
      margin: 4px 0;
    }

    .error-msg mat-icon {
      font-size: 18px !important;
      width: 18px !important;
      height: 18px !important;
    }

    .btn-entrar {
      margin-top: 12px;
      height: 48px;
      font-size: 15px;
      font-weight: 600;
      letter-spacing: 0.3px;
      border-radius: 10px !important;
      background: #2e7d32 !important;
      color: white !important;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: background 0.2s;
    }

    .btn-entrar:hover:not(:disabled) {
      background: #1b5e20 !important;
    }

    .btn-entrar:disabled {
      opacity: 0.55;
    }

    .spinner-btn {
      display: inline-block;
    }

    /* Outline field icon prefix color */
    mat-icon[matPrefix] {
      color: #888;
      margin-right: 4px;
    }

    .legal-footer {
      margin-top: 20px;
      font-size: 12px;
      color: #999;
      text-align: center;
      line-height: 1.6;
    }

    .link-btn {
      background: none;
      border: none;
      padding: 0;
      color: #2e7d32;
      font-size: 12px;
      cursor: pointer;
      text-decoration: underline;
    }

    .link-btn:hover { color: #1b5e20; }

    .registro-link {
      margin-top: 16px;
      text-align: center;
      font-size: 13px;
      color: #666;
    }
    .registro-link a {
      color: #2e7d32;
      font-weight: 600;
      text-decoration: none;
    }
    .registro-link a:hover { text-decoration: underline; }

    @media (max-width: 640px) {
      .brand-panel { display: none; }
      .form-card { padding: 28px 20px; }
    }
  `]
})
export class LoginComponent {
  form: FormGroup;
  error: string | null = null;
  cargando = false;
  showPass = false;

  private auth   = inject(AuthService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  constructor() {
    const fb = inject(FormBuilder);
    this.form = fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.cargando) return;
    this.cargando = true;
    this.error = null;
    const { email, password } = this.form.value;
    this.auth.login(email, password).subscribe({
      next: () => this.router.navigate(['/']),
      error: () => {
        this.error = 'Credenciales incorrectas. Inténtalo de nuevo.';
        this.cargando = false;
      }
    });
  }

  verPolitica(): void {
    this.dialog.open(PoliticaPrivacidadDialogComponent, { width: '680px', maxWidth: '95vw' });
  }

  verAvisoLegal(): void {
    this.dialog.open(AvisoLegalDialogComponent, { width: '620px', maxWidth: '95vw' });
  }
}