import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule,
            MatFormFieldModule, MatInputModule, MatButtonModule,
            MatIconModule, MatProgressSpinnerModule],
  template: `
  <div class="shell">
    <div class="brand-panel">
      <mat-icon class="brand-icon">health_and_safety</mat-icon>
      <h1 class="brand-title">FisioIA</h1>
      <p class="brand-sub">Asistente Clínico Inteligente</p>
    </div>

    <div class="form-panel">
      <div class="form-card">

        <!-- Estado enviado -->
        <div class="sent-state" *ngIf="enviado">
          <div class="sent-icon-wrap">
            <mat-icon class="sent-icon">mark_email_read</mat-icon>
          </div>
          <h2 class="form-title">Revisa tu correo</h2>
          <p class="form-sub">
            Si el email está registrado, recibirás un enlace para restablecer
            tu contraseña. El enlace expira en <strong>1 hora</strong>.
          </p>
          <p class="form-sub" style="margin-top:8px;font-size:12px;color:#aaa">
            Si usas Gmail en modo desarrollo, el enlace aparece en la consola del backend.
          </p>
          <a routerLink="/login" class="btn-volver">
            <mat-icon>arrow_back</mat-icon> Volver al login
          </a>
        </div>

        <!-- Formulario -->
        <ng-container *ngIf="!enviado">
          <div class="back-link">
            <a routerLink="/login">
              <mat-icon>arrow_back</mat-icon> Volver al login
            </a>
          </div>
          <h2 class="form-title">Recuperar contraseña</h2>
          <p class="form-sub">Introduce tu email y te enviaremos un enlace de acceso.</p>

          <form [formGroup]="form" (ngSubmit)="enviar()" class="form">
            <mat-form-field appearance="outline" class="field">
              <mat-label>Email</mat-label>
              <mat-icon matPrefix>email</mat-icon>
              <input matInput formControlName="email" type="email" placeholder="tu@clinica.com">
              <mat-error *ngIf="form.get('email')?.hasError('required')">Campo obligatorio</mat-error>
              <mat-error *ngIf="form.get('email')?.hasError('email')">Email no válido</mat-error>
            </mat-form-field>

            <div class="error-msg" *ngIf="error">
              <mat-icon>error_outline</mat-icon> {{ error }}
            </div>

            <button mat-raised-button color="primary" class="btn-submit"
              type="submit" [disabled]="form.invalid || cargando">
              <mat-spinner diameter="18" *ngIf="cargando"></mat-spinner>
              <span *ngIf="!cargando">Enviar enlace</span>
            </button>
          </form>
        </ng-container>

      </div>
    </div>
  </div>
  `,
  styles: [`
    .shell { display:flex; height:100vh; overflow:hidden; font-family:'Roboto',sans-serif; }

    .brand-panel {
      width:40%; background:linear-gradient(160deg,#1b5e20 0%,#2e7d32 60%,#43a047 100%);
      display:flex; flex-direction:column; align-items:center; justify-content:center;
      padding:48px 36px; color:white; gap:12px;
    }
    .brand-icon  { font-size:64px; width:64px; height:64px; opacity:0.9; }
    .brand-title { font-size:2.2rem; font-weight:800; margin:0; letter-spacing:-1px; }
    .brand-sub   { font-size:1rem; opacity:0.75; margin:0; }

    .form-panel {
      flex:1; background:#f5f7fb; display:flex; align-items:center;
      justify-content:center; padding:24px; overflow-y:auto;
    }
    .form-card {
      background:white; border-radius:16px; padding:36px 40px;
      box-shadow:0 4px 24px rgba(0,0,0,0.08); width:100%; max-width:420px;
    }

    .back-link { margin-bottom:16px; }
    .back-link a {
      display:flex; align-items:center; gap:4px; color:#2e7d32;
      font-size:13px; font-weight:600; text-decoration:none;
    }
    .back-link a mat-icon { font-size:16px; width:16px; height:16px; }
    .back-link a:hover { text-decoration:underline; }

    .form-title { font-size:1.4rem; font-weight:700; color:#1a1a1a; margin:0 0 6px; }
    .form-sub   { font-size:0.88rem; color:#78909c; margin:0 0 20px; line-height:1.5; }

    .form  { display:flex; flex-direction:column; gap:4px; }
    .field { width:100%; }

    .error-msg {
      display:flex; align-items:center; gap:6px;
      color:#c62828; font-size:13px; background:#ffebee;
      border-radius:8px; padding:8px 12px;
    }
    .btn-submit {
      width:100%; height:46px; font-size:1rem; font-weight:600;
      margin-top:8px; display:flex; align-items:center; justify-content:center; gap:8px;
    }

    /* Estado enviado */
    .sent-state { display:flex; flex-direction:column; align-items:center; text-align:center; gap:12px; }
    .sent-icon-wrap {
      width:72px; height:72px; border-radius:50%; background:#e8f5e9;
      display:flex; align-items:center; justify-content:center; margin-bottom:4px;
    }
    .sent-icon { font-size:36px; width:36px; height:36px; color:#2e7d32; }
    .btn-volver {
      display:flex; align-items:center; gap:6px; margin-top:12px;
      color:#2e7d32; font-weight:600; font-size:14px; text-decoration:none;
    }
    .btn-volver:hover { text-decoration:underline; }
    .btn-volver mat-icon { font-size:16px; width:16px; height:16px; }

    @media (max-width:680px) { .brand-panel { display:none; } }
  `]
})
export class OlvidePasswordComponent {
  private http = inject(HttpClient);
  private fb   = inject(FormBuilder);
  private cdr  = inject(ChangeDetectorRef);

  enviado  = false;
  cargando = false;
  error    = '';

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  enviar(): void {
    if (this.form.invalid) return;
    this.cargando = true;
    this.error    = '';
    this.http.post(`${environment.apiUrl}/auth/request-reset`, this.form.value).subscribe({
      next: () => { this.enviado = true; this.cargando = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Error al enviar el correo. Inténtalo de nuevo.'; this.cargando = false; this.cdr.detectChanges(); }
    });
  }
}
