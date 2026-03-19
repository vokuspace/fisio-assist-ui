import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '../../../environments/environment';

interface UsuarioItem {
  id: number;
  nombre: string;
  email: string;
  rol: 'admin_clinica' | 'fisioterapeuta' | 'recepcionista';
}

const ROL_LABEL: Record<string, string> = {
  admin_clinica:  'Administrador',
  fisioterapeuta: 'Fisioterapeuta',
  recepcionista:  'Recepcionista',
};

const ROL_COLOR: Record<string, string> = {
  admin_clinica:  '#1b5e20',
  fisioterapeuta: '#1565c0',
  recepcionista:  '#6a1b9a',
};

@Component({
  selector: 'app-gestion-usuarios',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatChipsModule, MatTooltipModule, MatProgressSpinnerModule
  ],
  template: `
  <div class="usuarios-shell">

    <div class="header">
      <div class="header-title">
        <mat-icon>manage_accounts</mat-icon>
        <div>
          <h2>Gestión de usuarios</h2>
          <p>Administra los miembros de tu clínica</p>
        </div>
      </div>
    </div>

    <!-- Tabla de usuarios -->
    <div class="card table-card">
      <div class="card-header">
        <span>Usuarios activos ({{ usuarios.length }})</span>
      </div>

      <!-- Spinner de carga -->
      <div class="loading-state" *ngIf="cargando">
        <mat-spinner diameter="36"></mat-spinner>
        <span>Cargando usuarios...</span>
      </div>

      <table mat-table [dataSource]="usuarios" class="usuarios-table" *ngIf="!cargando">

        <ng-container matColumnDef="nombre">
          <th mat-header-cell *matHeaderCellDef>Usuario</th>
          <td mat-cell *matCellDef="let u">
            <div class="user-cell">
              <div class="avatar" [style.background]="ROL_COLOR[u.rol]">{{ u.nombre.charAt(0) }}</div>
              <div>
                <div class="u-nombre">{{ u.nombre }}</div>
                <div class="u-email">{{ u.email }}</div>
              </div>
            </div>
          </td>
        </ng-container>

        <ng-container matColumnDef="rol">
          <th mat-header-cell *matHeaderCellDef>Rol</th>
          <td mat-cell *matCellDef="let u">
            <span class="rol-chip" [style.background]="ROL_COLOR[u.rol] + '18'"
                  [style.color]="ROL_COLOR[u.rol]" [style.border-color]="ROL_COLOR[u.rol] + '40'">
              {{ ROL_LABEL[u.rol] }}
            </span>
          </td>
        </ng-container>

        <ng-container matColumnDef="acciones">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let u">
            <div class="acciones">
              <mat-select class="rol-select" [value]="u.rol"
                (selectionChange)="cambiarRol(u, $event.value)"
                matTooltip="Cambiar rol">
                <mat-option value="admin_clinica">Administrador</mat-option>
                <mat-option value="fisioterapeuta">Fisioterapeuta</mat-option>
                <mat-option value="recepcionista">Recepcionista</mat-option>
              </mat-select>
              <button mat-icon-button color="warn" (click)="eliminarUsuario(u)"
                matTooltip="Eliminar usuario">
                <mat-icon>delete_outline</mat-icon>
              </button>
            </div>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="columnas"></tr>
        <tr mat-row *matRowDef="let row; columns: columnas"></tr>
      </table>
    </div>

    <!-- Formulario nuevo usuario -->
    <div class="card form-card">
      <div class="card-header">
        <mat-icon>person_add</mat-icon>
        <span>Añadir nuevo usuario</span>
      </div>

      <form [formGroup]="form" (ngSubmit)="crearUsuario()" class="form">
        <mat-form-field appearance="outline">
          <mat-label>Nombre</mat-label>
          <mat-icon matPrefix>person</mat-icon>
          <input matInput formControlName="nombre" placeholder="Carlos Martínez">
          <mat-error *ngIf="form.get('nombre')?.hasError('required')">Obligatorio</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Email</mat-label>
          <mat-icon matPrefix>email</mat-icon>
          <input matInput formControlName="email" type="email" placeholder="carlos@clinica.com">
          <mat-error *ngIf="form.get('email')?.hasError('required')">Obligatorio</mat-error>
          <mat-error *ngIf="form.get('email')?.hasError('email')">Email no válido</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Contraseña temporal</mat-label>
          <mat-icon matPrefix>lock</mat-icon>
          <input matInput formControlName="password" type="password">
          <mat-error *ngIf="form.get('password')?.hasError('minlength')">Mínimo 6 caracteres</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Rol</mat-label>
          <mat-icon matPrefix>badge</mat-icon>
          <mat-select formControlName="rol">
            <mat-option value="fisioterapeuta">Fisioterapeuta</mat-option>
            <mat-option value="recepcionista">Recepcionista</mat-option>
            <mat-option value="admin_clinica">Administrador</mat-option>
          </mat-select>
        </mat-form-field>

        <div class="error-msg" *ngIf="error">
          <mat-icon>error_outline</mat-icon> {{ error }}
        </div>

        <button mat-raised-button color="primary" type="submit"
          [disabled]="form.invalid || guardando" class="btn-crear">
          <mat-spinner diameter="18" *ngIf="guardando"></mat-spinner>
          <mat-icon *ngIf="!guardando">person_add</mat-icon>
          <span>{{ guardando ? 'Creando...' : 'Crear usuario' }}</span>
        </button>
      </form>
    </div>

  </div>
  `,
  styles: [`
    .usuarios-shell {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-width: 900px;
      margin: 0 auto;
    }

    .header { display: flex; align-items: center; justify-content: space-between; }
    .header-title { display: flex; align-items: center; gap: 14px; }
    .header-title mat-icon { font-size: 32px; width: 32px; height: 32px; color: #2e7d32; }
    .header-title h2 { margin: 0; font-size: 1.4rem; font-weight: 700; color: #1a1a1a; }
    .header-title p { margin: 0; font-size: 0.85rem; color: #78909c; }

    .card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.07);
      overflow: hidden;
    }

    .card-header {
      display: flex; align-items: center; gap: 8px;
      padding: 16px 20px;
      font-weight: 600; font-size: 0.95rem; color: #2e7d32;
      border-bottom: 1px solid #e8f5e9;
      background: #f9fbe7;
    }
    .card-header mat-icon { font-size: 18px; width: 18px; height: 18px; }

    .loading-state {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 32px 24px;
      color: #78909c;
      font-size: 14px;
    }

    .usuarios-table { width: 100%; }

    .user-cell { display: flex; align-items: center; gap: 12px; padding: 8px 0; }
    .avatar {
      width: 36px; height: 36px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      color: white; font-weight: 700; font-size: 15px; flex-shrink: 0;
    }
    .u-nombre { font-weight: 600; font-size: 0.9rem; color: #222; }
    .u-email  { font-size: 0.78rem; color: #78909c; }

    .rol-chip {
      padding: 3px 10px; border-radius: 20px;
      font-size: 12px; font-weight: 600;
      border: 1px solid;
    }

    .acciones { display: flex; align-items: center; gap: 4px; justify-content: flex-end; }

    .rol-select {
      font-size: 13px;
      width: 140px;
    }

    /* Form */
    .form-card .form {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 16px;
      padding: 20px;
    }

    .form mat-form-field { width: 100%; }

    .error-msg {
      grid-column: 1 / -1;
      display: flex; align-items: center; gap: 6px;
      color: #c62828; font-size: 13px;
      background: #ffebee; border-radius: 8px;
      padding: 8px 12px;
    }

    .btn-crear {
      grid-column: 1 / -1;
      height: 44px; font-size: 0.95rem; font-weight: 600;
      display: flex; align-items: center; justify-content: center; gap: 8px;
    }

    th.mat-header-cell { color: #555; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; }
    td.mat-cell { border-bottom-color: #f5f5f5; }
    tr.mat-row:last-child td { border-bottom: none; }

    @media (max-width: 600px) {
      .form-card .form { grid-template-columns: 1fr; }
    }
  `]
})
export class GestionUsuariosComponent implements OnInit {
  private http = inject(HttpClient);
  private fb   = inject(FormBuilder);
  private cdr  = inject(ChangeDetectorRef);

  ROL_LABEL = ROL_LABEL;
  ROL_COLOR = ROL_COLOR;

  usuarios: UsuarioItem[] = [];
  columnas  = ['nombre', 'rol', 'acciones'];
  error     = '';
  cargando  = false;
  guardando = false;

  form = this.fb.group({
    nombre:   ['', Validators.required],
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rol:      ['fisioterapeuta', Validators.required]
  });

  ngOnInit(): void { this.cargarUsuarios(); }

  cargarUsuarios(): void {
    this.cargando = true;
    this.error = '';
    this.http.get<UsuarioItem[]>(`${environment.apiUrl}/usuarios`).subscribe({
      next: data => { this.usuarios = data; this.cargando = false; this.cdr.detectChanges(); },
      error: err => {
        this.error = err.error?.error ?? 'Error al cargar usuarios. ¿Tienes permisos de administrador?';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  crearUsuario(): void {
    if (this.form.invalid) return;
    this.guardando = true;
    this.error = '';
    this.http.post<UsuarioItem>(`${environment.apiUrl}/usuarios`, this.form.value).subscribe({
      next: u => {
        this.usuarios = [...this.usuarios, u];
        this.form.reset({ rol: 'fisioterapeuta' });
        this.guardando = false;
      },
      error: err => {
        this.error = err.error?.error ?? 'Error al crear el usuario';
        this.guardando = false;
      }
    });
  }

  cambiarRol(u: UsuarioItem, nuevoRol: string): void {
    this.http.put(`${environment.apiUrl}/usuarios/${u.id}/rol`, { rol: nuevoRol }).subscribe({
      next: () => u.rol = nuevoRol as any,
      error: () => {}
    });
  }

  eliminarUsuario(u: UsuarioItem): void {
    if (!confirm(`¿Eliminar a ${u.nombre}?`)) return;
    this.http.delete(`${environment.apiUrl}/usuarios/${u.id}`).subscribe({
      next: () => this.usuarios = this.usuarios.filter(x => x.id !== u.id),
      error: err => alert(err.error?.error ?? 'Error al eliminar')
    });
  }
}
