import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-reset-password',
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

        <!-- Token inválido / sin token -->
        <div class="error-state" *ngIf="!token">
          <mat-icon class="error-state-icon">link_off</mat-icon>
          <h2 class="form-title">Enlace no válido</h2>
          <p class="form-sub">Este enlace de recuperación no es válido o ha expirado.</p>
          <a routerLink="/olvide-password" class="btn-link">Solicitar un nuevo enlace</a>
        </div>

        <!-- Éxito -->
        <div class="sent-state" *ngIf="exito">
          <div class="sent-icon-wrap">
            <mat-icon class="sent-icon">lock_open</mat-icon>
          </div>
          <h2 class="form-title">Contraseña actualizada</h2>
          <p class="form-sub">Tu contraseña se ha restablecido correctamente. Ya puedes iniciar sesión.</p>
          <a routerLink="/login" class="btn-link">Ir al login</a>
        </div>

        <!-- Formulario -->
        <ng-container *ngIf="token && !exito">
          <h2 class="form-title">Nueva contraseña</h2>
          <p class="form-sub">Elige una contraseña segura de al menos 6 caracteres.</p>

          <form [formGroup]="form" (ngSubmit)="resetear()" class="form">
            <mat-form-field appearance="outline" class="field">
              <mat-label>Nueva contraseña</mat-label>
              <mat-icon matPrefix>lock</mat-icon>
              <input matInput formControlName="password"
                [type]="mostrar ? 'text' : 'password'">
              <button mat-icon-button matSuffix type="button" (click)="mostrar = !mostrar">
                <mat-icon>{{ mostrar ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="form.get('password')?.hasError('required')">Campo obligatorio</mat-error>
              <mat-error *ngIf="form.get('password')?.hasError('minlength')">Mínimo 6 caracteres</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="field">
              <mat-label>Repetir contraseña</mat-label>
              <mat-icon matPrefix>lock_outline</mat-icon>
              <input matInput formControlName="confirmar"
                [type]="mostrar ? 'text' : 'password'">
              <mat-error *ngIf="form.get('confirmar')?.hasError('required')">Campo obligatorio</mat-error>
            </mat-form-field>

            <div class="error-msg" *ngIf="noCoinciden">
              <mat-icon>error_outline</mat-icon> Las contraseñas no coinciden
            </div>
            <div class="error-msg" *ngIf="error">
              <mat-icon>error_outline</mat-icon> {{ error }}
            </div>

            <button mat-raised-button color="primary" class="btn-submit"
              type="submit" [disabled]="form.invalid || cargando">
              <mat-spinner diameter="18" *ngIf="cargando"></mat-spinner>
              <span *ngIf="!cargando">Guardar nueva contraseña</span>
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
      justify-content:center; padding:24px;
    }
    .form-card {
      background:white; border-radius:16px; padding:36px 40px;
      box-shadow:0 4px 24px rgba(0,0,0,0.08); width:100%; max-width:420px;
    }

    .form-title { font-size:1.4rem; font-weight:700; color:#1a1a1a; margin:0 0 6px; }
    .form-sub   { font-size:0.88rem; color:#78909c; margin:0 0 20px; line-height:1.5; }

    .form  { display:flex; flex-direction:column; gap:4px; }
    .field { width:100%; }

    .error-msg {
      display:flex; align-items:center; gap:6px; color:#c62828;
      font-size:13px; background:#ffebee; border-radius:8px; padding:8px 12px;
    }
    .btn-submit {
      width:100%; height:46px; font-size:1rem; font-weight:600;
      margin-top:8px; display:flex; align-items:center; justify-content:center; gap:8px;
    }

    .sent-state { display:flex; flex-direction:column; align-items:center; text-align:center; gap:12px; }
    .sent-icon-wrap {
      width:72px; height:72px; border-radius:50%; background:#e8f5e9;
      display:flex; align-items:center; justify-content:center;
    }
    .sent-icon { font-size:36px; width:36px; height:36px; color:#2e7d32; }

    .error-state { display:flex; flex-direction:column; align-items:center; text-align:center; gap:12px; }
    .error-state-icon { font-size:48px; width:48px; height:48px; color:#ef9a9a; }

    .btn-link {
      color:#2e7d32; font-weight:600; font-size:14px;
      text-decoration:none; margin-top:8px;
    }
    .btn-link:hover { text-decoration:underline; }

    @media (max-width:680px) { .brand-panel { display:none; } }
  `]
})
export class ResetPasswordComponent implements OnInit {
  private http  = inject(HttpClient);
  private fb    = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr   = inject(ChangeDetectorRef);

  token    = '';
  mostrar  = false;
  cargando = false;
  exito    = false;
  error    = '';

  form = this.fb.group({
    password:  ['', [Validators.required, Validators.minLength(6)]],
    confirmar: ['', Validators.required]
  });

  get noCoinciden(): boolean {
    const { password, confirmar } = this.form.value;
    return !!confirmar && password !== confirmar;
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
  }

  resetear(): void {
    if (this.form.invalid || this.noCoinciden) return;
    this.cargando = true;
    this.error    = '';
    this.http.post(`${environment.apiUrl}/auth/reset-password`, {
      token: this.token,
      password: this.form.value.password
    }).subscribe({
      next: () => { this.exito = true; this.cargando = false; this.cdr.detectChanges(); },
      error: err => {
        this.error    = err.error?.error ?? 'Error al restablecer la contraseña';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }
}
