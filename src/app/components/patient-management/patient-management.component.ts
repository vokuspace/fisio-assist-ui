import { Component, inject, Output, EventEmitter, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, Validators, FormBuilder } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableDataSource } from '@angular/material/table';
import { ViewChild } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { PoliticaPrivacidadDialogComponent } from '../gdpr/gdpr.components';

// ─── Dialog: Nuevo Paciente ────────────────────────────────────────────────────

@Component({
  selector: 'app-new-patient-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
            MatButtonModule, MatIconModule, MatDialogModule, MatSelectModule, MatCheckboxModule],
  template: `
  <h2 mat-dialog-title class="dialog-title">
    <mat-icon style="vertical-align:middle;margin-right:8px;color:#2e7d32">person_add</mat-icon>
    Nuevo paciente
  </h2>
  <mat-dialog-content>
    <form [formGroup]="form" class="dialog-form">
      <div class="form-row">
        <mat-form-field appearance="outline" class="half">
          <mat-label>Nombre *</mat-label>
          <input matInput formControlName="name">
        </mat-form-field>
        <mat-form-field appearance="outline" class="half">
          <mat-label>Apellidos</mat-label>
          <input matInput formControlName="last_name">
        </mat-form-field>
      </div>
      <div class="form-row">
        <mat-form-field appearance="outline" class="half">
          <mat-label>Teléfono</mat-label>
          <input matInput formControlName="phone">
        </mat-form-field>
        <mat-form-field appearance="outline" class="half">
          <mat-label>Email</mat-label>
          <input matInput formControlName="email" type="email">
        </mat-form-field>
      </div>
      <div class="form-row">
        <mat-form-field appearance="outline" class="half">
          <mat-label>Fecha de nacimiento</mat-label>
          <input matInput formControlName="birth_date" type="date">
        </mat-form-field>
        <mat-form-field appearance="outline" class="half">
          <mat-label>Fecha de alta</mat-label>
          <input matInput formControlName="registration_date" type="date">
        </mat-form-field>
      </div>
      <div class="seccion-titulo">Diagnóstico inicial (opcional)</div>
      <mat-form-field appearance="outline" class="full">
        <mat-label>Descripción del diagnóstico</mat-label>
        <textarea matInput formControlName="description" rows="2"></textarea>
      </mat-form-field>
      <div class="form-row">
        <mat-form-field appearance="outline" class="half">
          <mat-label>Patología</mat-label>
          <input matInput formControlName="pathology">
        </mat-form-field>
        <mat-form-field appearance="outline" class="half">
          <mat-label>Estado</mat-label>
          <mat-select formControlName="status">
            <mat-option value="active">Activo</mat-option>
            <mat-option value="in_progress">En seguimiento</mat-option>
            <mat-option value="resolved">Resuelto</mat-option>
          </mat-select>
        </mat-form-field>
      </div>
      <div class="rgpd-block">
        <mat-checkbox formControlName="consentimiento_rgpd" color="primary">
          <span class="rgpd-label">
            Confirmo que el paciente ha sido informado y otorga su
            <strong>consentimiento expreso</strong> para el tratamiento de sus datos
            de salud conforme al <strong>RGPD (Art. 9.2.h)</strong> y la LOPD-GDD.
          </span>
        </mat-checkbox>
        <div class="rgpd-error" *ngIf="form.get('consentimiento_rgpd')?.invalid && form.get('consentimiento_rgpd')?.touched">
          El consentimiento del paciente es obligatorio.
        </div>
      </div>
    </form>
  </mat-dialog-content>
  <mat-dialog-actions align="end">
    <button mat-button (click)="cancelar()">Cancelar</button>
    <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="guardar()">Guardar</button>
  </mat-dialog-actions>
  `,
  styles: [`
    .dialog-title { color: #2e7d32; display:flex; align-items:center; }
    .dialog-form { display: flex; flex-direction: column; gap: 4px; min-width: 500px; padding-top: 8px; }
    .form-row { display: flex; gap: 12px; }
    .half { flex: 1; }
    .full { width: 100%; }
    .seccion-titulo { font-size: 13px; font-weight: 600; color: #388e3c; margin: 8px 0 2px; }
    .rgpd-block { background: #f0f7e8; border: 1px solid #c8e6c9; border-radius: 8px; padding: 12px 14px; margin-top: 8px; }
    .rgpd-label { font-size: 13px; line-height: 1.5; white-space: normal; }
    .rgpd-error { font-size: 12px; color: #c62828; margin-left: 24px; margin-top: 4px; }
  `]
})
export class NuevoPacienteDialogComponent {
  private dialogRef = inject(MatDialogRef<NuevoPacienteDialogComponent>);
  private fb        = inject(FormBuilder);
  private dialog    = inject(MatDialog);

  form = this.fb.group({
    name:                ['', Validators.required],
    last_name:           [''],
    phone:               [''],
    email:               [''],
    birth_date:          [''],
    registration_date:   [new Date().toISOString().slice(0, 10)],
    description:         [''],
    pathology:           [''],
    status:              ['active'],
    consentimiento_rgpd: [false, Validators.requiredTrue]
  });

  cancelar(): void { this.dialogRef.close(null); }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.dialogRef.close(this.form.value);
  }

  verPolitica(): void {
    this.dialog.open(PoliticaPrivacidadDialogComponent, { width: '680px', maxWidth: '95vw' });
  }
}

// ─── Dialog: Editar Paciente ───────────────────────────────────────────────────

@Component({
  selector: 'app-edit-patient-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
            MatButtonModule, MatDialogModule, MatIconModule],
  template: `
  <h2 mat-dialog-title class="dialog-title">
    <mat-icon style="vertical-align:middle;margin-right:8px;color:#1565c0">edit</mat-icon>
    Editar paciente
  </h2>
  <mat-dialog-content>
    <form [formGroup]="form" class="dialog-form">
      <div class="seccion-titulo">Datos personales</div>
      <div class="form-row">
        <mat-form-field appearance="outline" class="half">
          <mat-label>Nombre *</mat-label>
          <input matInput formControlName="name">
        </mat-form-field>
        <mat-form-field appearance="outline" class="half">
          <mat-label>Apellidos</mat-label>
          <input matInput formControlName="last_name">
        </mat-form-field>
      </div>
      <div class="form-row">
        <mat-form-field appearance="outline" class="half">
          <mat-label>Teléfono</mat-label>
          <input matInput formControlName="phone">
        </mat-form-field>
        <mat-form-field appearance="outline" class="half">
          <mat-label>Email</mat-label>
          <input matInput formControlName="email">
        </mat-form-field>
      </div>
      <div class="seccion-titulo">Ficha clínica</div>
      <div class="form-row">
        <mat-form-field appearance="outline" class="half">
          <mat-label>Patología</mat-label>
          <input matInput formControlName="pathology">
        </mat-form-field>
        <mat-form-field appearance="outline" class="half">
          <mat-label>Diagnóstico</mat-label>
          <input matInput formControlName="diagnosis_text">
        </mat-form-field>
      </div>
      <mat-form-field appearance="outline" class="full">
        <mat-label>Medicación</mat-label>
        <input matInput formControlName="medication">
      </mat-form-field>
      <mat-form-field appearance="outline" class="full">
        <mat-label>Contraindicaciones</mat-label>
        <input matInput formControlName="contraindications">
      </mat-form-field>
      <mat-form-field appearance="outline" class="full">
        <mat-label>Observaciones</mat-label>
        <textarea matInput formControlName="observations" rows="2"></textarea>
      </mat-form-field>
    </form>
  </mat-dialog-content>
  <mat-dialog-actions align="end">
    <button mat-button (click)="cancelar()">Cancelar</button>
    <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="guardar()">Guardar cambios</button>
  </mat-dialog-actions>
  `,
  styles: [`
    .dialog-title { color: #1565c0; display:flex; align-items:center; }
    .dialog-form { display: flex; flex-direction: column; gap: 4px; min-width: 500px; padding-top: 8px; }
    .form-row { display: flex; gap: 12px; }
    .half { flex: 1; }
    .full { width: 100%; }
    .seccion-titulo { font-size: 13px; font-weight: 600; color: #1565c0; margin: 8px 0 2px; }
  `]
})
export class EditarPacienteDialogComponent {
  private dialogRef = inject(MatDialogRef<EditarPacienteDialogComponent>);
  private fb        = inject(FormBuilder);
  data              = inject(MAT_DIALOG_DATA);

  form = this.fb.group({
    name:             [this.data.name ?? '', Validators.required],
    last_name:        [this.data.last_name ?? ''],
    phone:            [this.data.phone ?? ''],
    email:            [this.data.email ?? ''],
    pathology:        [this.data.pathology ?? ''],
    diagnosis_text:   [this.data.diagnosis_text ?? ''],
    medication:       [this.data.medication ?? ''],
    contraindications:[this.data.contraindications ?? ''],
    observations:     [this.data.observations ?? '']
  });

  cancelar(): void { this.dialogRef.close(null); }
  guardar(): void {
    if (this.form.invalid) return;
    this.dialogRef.close(this.form.value);
  }
}

// ─── Dialog: Confirmar eliminación ────────────────────────────────────────────

@Component({
  selector: 'app-confirm-delete-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule, MatIconModule],
  template: `
  <div class="confirm-dialog">
    <div class="confirm-icon"><mat-icon>warning</mat-icon></div>
    <h3>¿Eliminar paciente?</h3>
    <p>Se eliminarán <strong>todos los datos</strong> del paciente: ficha clínica, sesiones y diagnósticos. Esta acción no se puede deshacer.</p>
    <div class="confirm-actions">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="warn" [mat-dialog-close]="true">Sí, eliminar</button>
    </div>
  </div>
  `,
  styles: [`
    .confirm-dialog { padding: 16px 24px 8px; text-align: center; max-width: 360px; }
    .confirm-icon mat-icon { font-size: 48px; width: 48px; height: 48px; color: #f57f17; }
    h3 { margin: 8px 0; font-size: 18px; color: #333; }
    p { color: #666; font-size: 14px; line-height: 1.5; }
    .confirm-actions { display: flex; justify-content: center; gap: 12px; margin-top: 16px; }
  `]
})
export class ConfirmarEliminarDialogComponent {}

// ─── Componente principal: Gestión de pacientes ────────────────────────────────

@Component({
  selector: 'app-patient-management',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatTableModule, MatSortModule, MatPaginatorModule,
    MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatCardModule,
    MatDialogModule, MatSelectModule, MatChipsModule, MatTooltipModule
  ],
  template: `
  <div class="gestion-wrap">

    <!-- Header -->
    <div class="gestion-header">
      <div class="header-left">
        <mat-icon class="header-icon">manage_accounts</mat-icon>
        <div>
          <h2 class="header-title">Gestión de pacientes</h2>
          <span class="header-sub">{{ dataSource.data.length }} paciente{{ dataSource.data.length !== 1 ? 's' : '' }} registrado{{ dataSource.data.length !== 1 ? 's' : '' }}</span>
        </div>
      </div>
      <div class="header-actions">
        <button mat-raised-button color="primary" (click)="abrirDialogNuevo()">
          <mat-icon>person_add</mat-icon> Nuevo paciente
        </button>
        <button mat-stroked-button (click)="volver()" matTooltip="Volver a pacientes">
          <mat-icon>arrow_back</mat-icon> Volver
        </button>
      </div>
    </div>

    <!-- Buscador -->
    <div class="search-bar">
      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Buscar por nombre, apellidos, email o patología…</mat-label>
        <mat-icon matPrefix style="margin-right:6px;color:#78909c">search</mat-icon>
        <input matInput (keyup)="applyFilter($event)" placeholder="Escribe para filtrar">
      </mat-form-field>
    </div>

    <!-- Tabla -->
    <div class="table-card" *ngIf="dataSource.data.length; else sinPacientes">
      <table mat-table [dataSource]="dataSource" matSort class="pacientes-table">

        <!-- Avatar + Nombre -->
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Paciente</th>
          <td mat-cell *matCellDef="let p">
            <div class="pac-cell">
              <div class="pac-avatar">{{ (p.name?.charAt(0) ?? '') + (p.last_name?.charAt(0) ?? '') | uppercase }}</div>
              <div>
                <div class="pac-nombre">{{ p.name }} {{ p.last_name }}</div>
                <div class="pac-email">{{ p.email }}</div>
              </div>
            </div>
          </td>
        </ng-container>

        <!-- Teléfono -->
        <ng-container matColumnDef="phone">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Teléfono</th>
          <td mat-cell *matCellDef="let p">
            <span class="pac-tel"><mat-icon style="font-size:14px;vertical-align:middle;color:#78909c">phone</mat-icon> {{ p.phone || '—' }}</span>
          </td>
        </ng-container>

        <!-- Patología -->
        <ng-container matColumnDef="pathology">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Patología</th>
          <td mat-cell *matCellDef="let p">
            <span class="chip-patologia" *ngIf="p.pathology; else sinPatologia">{{ p.pathology }}</span>
            <ng-template #sinPatologia><span class="sin-dato">—</span></ng-template>
          </td>
        </ng-container>

        <!-- Fecha alta -->
        <ng-container matColumnDef="registration_date">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Alta</th>
          <td mat-cell *matCellDef="let p">
            <span class="pac-fecha">{{ p.registration_date || '—' }}</span>
          </td>
        </ng-container>

        <!-- Sesiones -->
        <ng-container matColumnDef="sessions">
          <th mat-header-cell *matHeaderCellDef>Sesiones</th>
          <td mat-cell *matCellDef="let p">
            <span class="badge-sesiones" [class.badge-zero]="!p.sessions">{{ p.sessions ?? 0 }}</span>
          </td>
        </ng-container>

        <!-- Acciones -->
        <ng-container matColumnDef="acciones">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let p" class="acciones-cell">
            <button mat-icon-button color="primary" (click)="editarPaciente(p)" matTooltip="Editar paciente">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button color="warn" (click)="confirmarEliminar(p.id)" matTooltip="Eliminar paciente">
              <mat-icon>delete</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="pac-row"></tr>
      </table>

      <mat-paginator [pageSizeOptions]="[10, 25, 50]" showFirstLastButtons></mat-paginator>
    </div>

    <ng-template #sinPacientes>
      <div class="empty-state">
        <mat-icon>person_search</mat-icon>
        <p>No hay pacientes registrados aún.</p>
        <button mat-raised-button color="primary" (click)="abrirDialogNuevo()">
          <mat-icon>person_add</mat-icon> Añadir primer paciente
        </button>
      </div>
    </ng-template>

  </div>
  `,
  styleUrls: ['./patient-management.component.css']
})
export class GestionPacientesComponent implements OnInit {
  private api    = inject(ApiService);
  private dialog = inject(MatDialog);
  private cdr    = inject(ChangeDetectorRef);

  @Output() cerrar = new EventEmitter<void>();
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  dataSource = new MatTableDataSource<any>([]);
  displayedColumns = ['name', 'phone', 'pathology', 'registration_date', 'sessions', 'acciones'];

  ngOnInit(): void {
    this.loadPacientes();
  }

  // ── Carga ──────────────────────────────────────────────────────────────────

  loadPacientes(): void {
    this.api.buscarPacientes('').subscribe((pac: any[]) => {
      const rows = pac.map(p => ({
        id: p.id, name: p.name, last_name: p.last_name,
        phone: p.phone, email: p.email,
        registration_date: p.registration_date ?? '', pathology: '', sessions: 0,
        diagnosis_text: '', medication: '', contraindications: '', observations: ''
      }));
      this.dataSource.data = rows;
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.dataSource.filterPredicate = (data, filter) =>
        `${data.name} ${data.last_name} ${data.email} ${data.pathology}`.toLowerCase().includes(filter);
      this.cdr.detectChanges();

      rows.forEach((p, idx) => {
        this.api.obtenerPaciente(p.id).subscribe((full: any) => {
          rows[idx].pathology        = full?.clinical_record?.pathology ?? '';
          rows[idx].diagnosis_text   = full?.clinical_record?.diagnosis_text ?? '';
          rows[idx].medication       = full?.clinical_record?.medication ?? '';
          rows[idx].contraindications = full?.clinical_record?.contraindications ?? '';
          rows[idx].observations     = full?.clinical_record?.observations ?? '';
          rows[idx].sessions         = full?.sessions?.length ?? 0;
          this.dataSource.data = [...rows];
          this.cdr.detectChanges();
        });
      });
    });
  }

  applyFilter(event: Event): void {
    const val = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = val;
  }

  // ── Nuevo paciente ─────────────────────────────────────────────────────────

  abrirDialogNuevo(): void {
    this.dialog.open(NuevoPacienteDialogComponent, { width: '580px', disableClose: false })
      .afterClosed().subscribe((datos: any) => {
        if (!datos) return;
        this.api.crearPaciente({
          name: datos.name, last_name: datos.last_name,
          phone: datos.phone, email: datos.email,
          birth_date: datos.birth_date, registration_date: datos.registration_date
        }).subscribe((res: any) => {
          if (res?.id && datos.description?.trim()) {
            this.api.añadirDiagnostico(res.id, {
              date: new Date().toISOString().slice(0, 10),
              description: datos.description,
              pathology: datos.pathology,
              status: datos.status ?? 'active'
            }).subscribe(() => this.loadPacientes());
          } else {
            this.loadPacientes();
          }
        });
      });
  }

  // ── Editar ─────────────────────────────────────────────────────────────────

  editarPaciente(p: any): void {
    this.dialog.open(EditarPacienteDialogComponent, { width: '580px', data: p })
      .afterClosed().subscribe((v: any) => {
        if (!v) return;
        this.api.actualizarPaciente(p.id, {
          name: v.name, last_name: v.last_name,
          phone: v.phone, email: v.email
        }).subscribe(() => {
          this.api.actualizarFicha(p.id, {
            diagnosis_text: v.diagnosis_text, pathology: v.pathology,
            medication: v.medication, contraindications: v.contraindications,
            observations: v.observations
          }).subscribe(() => this.loadPacientes());
        });
      });
  }

  // ── Eliminar ───────────────────────────────────────────────────────────────

  confirmarEliminar(id: number): void {
    this.dialog.open(ConfirmarEliminarDialogComponent, { width: '400px' })
      .afterClosed().subscribe((confirmado: boolean) => {
        if (!confirmado) return;
        this.api.eliminarPaciente(id).subscribe(() => this.loadPacientes());
      });
  }

  volver(): void { this.cerrar.emit(); }
}
