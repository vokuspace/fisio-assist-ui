import { Component, inject, OnInit, ChangeDetectorRef, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { debounceTime, filter } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// ── Opciones de hora (08:00 – 20:00 cada 30 min) ────────────────────────────
const HORAS_OPCIONES: string[] = [];
for (let h = 8; h <= 20; h++) {
  HORAS_OPCIONES.push(`${String(h).padStart(2, '0')}:00`);
  if (h < 20) HORAS_OPCIONES.push(`${String(h).padStart(2, '0')}:30`);
}

export interface CitaDialogData {
  cita?: any;
  fecha?: string;
  hora?: number;
  fisioterapeutas: any[];
}

// ── Dialog de cita ───────────────────────────────────────────────────────────
@Component({
  selector: 'app-cita-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule,
    MatSelectModule, MatAutocompleteModule, MatProgressSpinnerModule, MatDialogModule,
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>{{ data.cita ? 'edit_calendar' : 'event_available' }}</mat-icon>
      {{ data.cita ? 'Editar cita' : 'Nueva cita' }}
    </h2>

    <mat-dialog-content class="dialog-content">
      <form [formGroup]="form" class="dialog-form">

        <mat-form-field appearance="outline" class="field-full">
          <mat-label>Fecha</mat-label>
          <mat-icon matPrefix>calendar_today</mat-icon>
          <input matInput type="date" formControlName="date">
          <mat-error>Obligatorio</mat-error>
        </mat-form-field>

        <div class="row-2">
          <mat-form-field appearance="outline">
            <mat-label>Hora inicio</mat-label>
            <mat-select formControlName="start_time">
              <mat-option *ngFor="let h of HORAS" [value]="h">{{ h }}</mat-option>
            </mat-select>
            <mat-error>Obligatorio</mat-error>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Hora fin</mat-label>
            <mat-select formControlName="end_time">
              <mat-option *ngFor="let h of HORAS" [value]="h">{{ h }}</mat-option>
            </mat-select>
            <mat-error>Obligatorio</mat-error>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="field-full">
          <mat-label>Paciente</mat-label>
          <mat-icon matPrefix>person</mat-icon>
          <input matInput [formControl]="pacienteCtrl"
            [matAutocomplete]="autoPaciente"
            placeholder="Buscar paciente...">
          <mat-autocomplete #autoPaciente="matAutocomplete"
            [displayWith]="displayPaciente"
            (optionSelected)="onPacienteSelected($event)">
            <mat-option *ngFor="let p of pacientesResultados" [value]="p">
              {{ p.name }} {{ p.last_name }}
            </mat-option>
            <mat-option *ngIf="buscandoPaciente" disabled>
              <span style="color:#999;font-size:13px">Buscando...</span>
            </mat-option>
          </mat-autocomplete>
        </mat-form-field>

        <mat-form-field appearance="outline" class="field-full">
          <mat-label>Fisioterapeuta</mat-label>
          <mat-icon matPrefix>badge</mat-icon>
          <mat-select formControlName="physiotherapist_id">
            <mat-option [value]="null">Sin asignar</mat-option>
            <mat-option *ngFor="let f of data.fisioterapeutas" [value]="f.id">
              {{ f.name }}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="field-full">
          <mat-label>Motivo</mat-label>
          <mat-icon matPrefix>medical_services</mat-icon>
          <input matInput formControlName="reason" placeholder="Motivo de la cita">
        </mat-form-field>

        <mat-form-field appearance="outline" class="field-full">
          <mat-label>Estado</mat-label>
          <mat-select formControlName="status">
            <mat-option value="pending">🔵 Pendiente</mat-option>
            <mat-option value="confirmed">🟢 Confirmada</mat-option>
            <mat-option value="cancelled">🔴 Cancelada</mat-option>
            <mat-option value="completed">🟣 Completada</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="field-full">
          <mat-label>Notas</mat-label>
          <textarea matInput formControlName="notes" rows="2"
            placeholder="Notas adicionales..."></textarea>
        </mat-form-field>

        <div class="error-msg" *ngIf="error">
          <mat-icon>error_outline</mat-icon> {{ error }}
        </div>

      </form>
    </mat-dialog-content>

    <mat-dialog-actions>
      <button mat-button color="warn" *ngIf="data.cita && !confirmDelete"
        (click)="confirmDelete = true">
        <mat-icon>delete</mat-icon> Eliminar
      </button>
      <button mat-flat-button color="warn" *ngIf="confirmDelete"
        (click)="eliminar()">
        <mat-icon>warning</mat-icon> ¿Confirmar?
      </button>
      <span class="actions-spacer"></span>
      <button mat-button [mat-dialog-close]="null">Cancelar</button>
      <button mat-flat-button color="primary" (click)="guardar()"
        [disabled]="form.invalid || guardando">
        <mat-spinner diameter="18" *ngIf="guardando" class="spinner-inline"></mat-spinner>
        <span *ngIf="!guardando">{{ data.cita ? 'Actualizar' : 'Crear cita' }}</span>
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2[mat-dialog-title] {
      display: flex; align-items: center; gap: 10px;
      font-size: 1.1rem; color: #1b5e20; margin: 0 0 4px;
    }
    .dialog-content { padding-top: 8px !important; }
    .dialog-form {
      display: flex; flex-direction: column; gap: 4px;
      min-width: 420px; max-width: 480px;
    }
    .field-full { width: 100%; }
    .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .error-msg {
      display: flex; align-items: center; gap: 8px;
      color: #c62828; background: #ffebee; border-radius: 8px;
      padding: 8px 12px; font-size: 13px; margin-top: 4px;
    }
    mat-dialog-actions {
      display: flex; align-items: center; padding: 8px 16px 16px;
    }
    .actions-spacer { flex: 1; }
    .spinner-inline { display: inline-block; }
  `]
})
export class CitaDialogComponent implements OnInit {
  private http = inject(HttpClient);
  private cdr  = inject(ChangeDetectorRef);
  private fb   = inject(FormBuilder);
  dialogRef    = inject(MatDialogRef<CitaDialogComponent>);

  readonly HORAS = HORAS_OPCIONES;

  pacienteCtrl        = new FormControl('');
  pacientesResultados: any[] = [];
  buscandoPaciente    = false;
  guardando           = false;
  confirmDelete       = false;
  error               = '';

  form = this.fb.group({
    date:                ['', Validators.required],
    start_time:          ['', Validators.required],
    end_time:            ['', Validators.required],
    patient_id:          [null as number | null],
    physiotherapist_id:  [null as number | null],
    reason:              [''],
    status:              ['pending', Validators.required],
    notes:               [''],
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: CitaDialogData) {}

  ngOnInit(): void {
    if (this.data.fecha) {
      this.form.patchValue({ date: this.data.fecha });
    }
    if (this.data.hora != null) {
      const h  = String(this.data.hora).padStart(2, '0');
      const h1 = String(this.data.hora + 1).padStart(2, '0');
      this.form.patchValue({
        start_time: `${h}:00`,
        end_time:   this.data.hora < 20 ? `${h1}:00` : `${h}:30`,
      });
    }
    if (this.data.cita) {
      const c = this.data.cita;
      this.form.patchValue({
        date:               c.date,
        start_time:         c.start_time,
        end_time:           c.end_time,
        patient_id:         c.patient_id,
        physiotherapist_id: c.physiotherapist_id,
        reason:             c.reason  ?? '',
        status:             c.status  ?? 'pending',
        notes:              c.notes   ?? '',
      });
      if (c.patient_name) {
        this.pacienteCtrl.setValue(c.patient_name);
      }
    }

    this.pacienteCtrl.valueChanges.pipe(
      debounceTime(300),
      filter(v => typeof v === 'string' && (v as string).length >= 2)
    ).subscribe(q => this.buscarPacientes(q as string));
  }

  buscarPacientes(q: string): void {
    this.buscandoPaciente = true;
    this.http.get<any[]>(`${environment.apiUrl}/patients?name=${encodeURIComponent(q)}`).subscribe({
      next: r => { this.pacientesResultados = r; this.buscandoPaciente = false; this.cdr.detectChanges(); },
      error: () => { this.buscandoPaciente = false; }
    });
  }

  displayPaciente(p: any): string {
    if (!p) return '';
    if (typeof p === 'string') return p;
    return `${p.name} ${p.last_name || ''}`.trim();
  }

  onPacienteSelected(event: MatAutocompleteSelectedEvent): void {
    const p = event.option.value;
    this.form.patchValue({ patient_id: p.id });
  }

  guardar(): void {
    if (this.form.invalid) return;
    this.guardando = true;
    this.error = '';
    const payload = { ...this.form.value };
    const url = this.data.cita
      ? `${environment.apiUrl}/appointments/${this.data.cita.id}`
      : `${environment.apiUrl}/appointments`;
    const obs = this.data.cita
      ? this.http.put(url, payload)
      : this.http.post(url, payload);
    obs.subscribe({
      next: () => this.dialogRef.close({ recargar: true }),
      error: err => {
        this.error = err.error?.error ?? 'Error al guardar la cita';
        this.guardando = false;
        this.cdr.detectChanges();
      }
    });
  }

  eliminar(): void {
    this.http.delete(`${environment.apiUrl}/appointments/${this.data.cita.id}`).subscribe({
      next:  () => this.dialogRef.close({ recargar: true }),
      error: () => { this.error = 'Error al eliminar la cita'; this.cdr.detectChanges(); }
    });
  }
}

// ── Componente Agenda ────────────────────────────────────────────────────────
@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatButtonModule, MatIconModule, MatSelectModule,
    MatFormFieldModule, MatInputModule,
    MatDialogModule, MatProgressSpinnerModule, MatTooltipModule,
  ],
  template: `
    <div class="agenda-root">

      <!-- Toolbar -->
      <div class="agenda-toolbar">
        <div class="nav-group">
          <button mat-icon-button (click)="semanaAnterior()" matTooltip="Semana anterior">
            <mat-icon>chevron_left</mat-icon>
          </button>
          <button mat-stroked-button class="btn-hoy" (click)="irAHoy()">Hoy</button>
          <button mat-icon-button (click)="semanaSiguiente()" matTooltip="Semana siguiente">
            <mat-icon>chevron_right</mat-icon>
          </button>
          <span class="semana-label">{{ semanaLabel }}</span>
        </div>
        <div class="filter-group">
          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Fisioterapeuta</mat-label>
            <mat-select [value]="filtroFisio"
              (selectionChange)="filtroFisio = $event.value; cargarCitas()">
              <mat-option [value]="null">Todos</mat-option>
              <mat-option *ngFor="let f of fisioterapeutas" [value]="f.id">
                {{ f.name }}
              </mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </div>

      <!-- Leyenda de estados -->
      <div class="leyenda">
        <span class="ley-item ley-pendiente">Pendiente</span>
        <span class="ley-item ley-confirmada">Confirmada</span>
        <span class="ley-item ley-cancelada">Cancelada</span>
        <span class="ley-item ley-completada">Completada</span>
      </div>

      <!-- Cargando -->
      <div class="loading-wrap" *ngIf="cargando">
        <mat-spinner diameter="36"></mat-spinner>
      </div>

      <!-- Calendario semanal -->
      <div class="calendar-scroll" *ngIf="!cargando">
        <div class="calendar-grid">

          <!-- Cabecera: vacío + 7 días -->
          <div class="time-header"></div>
          <div *ngFor="let dia of diasSemana" class="day-header" [class.dia-hoy]="esHoy(dia)">
            <span class="dia-nombre">{{ DIAS_NOMBRES[dia.getDay()] }}</span>
            <span class="dia-num">{{ dia.getDate() }}</span>
          </div>

          <!-- Filas por hora -->
          <ng-container *ngFor="let hora of HORAS_DIA">
            <div class="time-cell">{{ hora }}:00</div>
            <div *ngFor="let dia of diasSemana"
              class="slot-cell"
              [class.slot-pasado]="esPasado(dia, hora)"
              (click)="abrirCrear(dia, hora)"
              [matTooltip]="'Crear cita el ' + formatDateDisplay(dia) + ' a las ' + hora + ':00'"
              matTooltipShowDelay="600">
              <div *ngFor="let cita of getCitasSlot(dia, hora)"
                class="cita-card cita-{{ cita.status }}"
                (click)="abrirEditar(cita, $event)"
                [matTooltip]="(cita.patient_name || 'Sin paciente') + ' · ' + cita.start_time + '–' + cita.end_time + (cita.reason ? ' · ' + cita.reason : '')">
                <span class="cita-hora">{{ cita.start_time }}–{{ cita.end_time }}</span>
                <span class="cita-nombre">{{ cita.patient_name || cita.reason || 'Cita' }}</span>
                <span class="cita-fisio" *ngIf="cita.physiotherapist_name">{{ cita.physiotherapist_name }}</span>
              </div>
            </div>
          </ng-container>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .agenda-root {
      display: flex; flex-direction: column; height: 100%;
      background: #f8faf8; overflow: hidden;
    }

    /* ── Toolbar ── */
    .agenda-toolbar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 10px 20px; background: white;
      border-bottom: 1px solid #e0e0e0; gap: 16px; flex-shrink: 0;
    }
    .nav-group { display: flex; align-items: center; gap: 6px; }
    .semana-label { font-size: 15px; font-weight: 600; color: #1b5e20; margin-left: 8px; }
    .btn-hoy { border-color: #2e7d32 !important; color: #2e7d32 !important; font-weight: 600; }
    .filter-field { min-width: 200px; }

    /* ── Leyenda ── */
    .leyenda {
      display: flex; gap: 12px; padding: 6px 20px;
      background: white; border-bottom: 1px solid #f0f0f0;
      flex-shrink: 0;
    }
    .ley-item {
      font-size: 11px; font-weight: 600; padding: 2px 10px;
      border-radius: 12px; letter-spacing: 0.3px;
    }
    .ley-pendiente  { background: #e3f2fd; color: #1565c0; border-left: 3px solid #1976d2; }
    .ley-confirmada { background: #e8f5e9; color: #2e7d32; border-left: 3px solid #388e3c; }
    .ley-cancelada  { background: #fce4ec; color: #b71c1c; border-left: 3px solid #c62828; }
    .ley-completada { background: #ede7f6; color: #6a1b9a; border-left: 3px solid #7b1fa2; }

    .cita-pending   { background: #e3f2fd; border-left: 3px solid #1976d2; }
    .cita-confirmed { background: #e8f5e9; border-left: 3px solid #388e3c; }
    .cita-cancelled { background: #fce4ec; border-left: 3px solid #c62828; opacity: 0.65; }
    .cita-completed { background: #ede7f6; border-left: 3px solid #7b1fa2; }

    /* ── Loading ── */
    .loading-wrap {
      flex: 1; display: flex; align-items: center; justify-content: center;
    }

    /* ── Calendar scroll ── */
    .calendar-scroll { flex: 1; overflow: auto; padding: 12px 16px 16px; }

    .calendar-grid {
      display: grid;
      grid-template-columns: 56px repeat(7, minmax(120px, 1fr));
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 8px rgba(0,0,0,0.07);
      overflow: hidden;
      min-width: 750px;
    }

    /* ── Cabecera días ── */
    .time-header {
      background: #f5f7f5;
      border-right: 1px solid #e8e8e8;
      border-bottom: 2px solid #e0e0e0;
    }
    .day-header {
      background: #f5f7f5;
      border-right: 1px solid #e8e8e8;
      border-bottom: 2px solid #e0e0e0;
      display: flex; flex-direction: column; align-items: center;
      padding: 10px 4px; gap: 4px;
    }
    .dia-nombre {
      font-size: 11px; text-transform: uppercase;
      color: #888; font-weight: 700; letter-spacing: 0.5px;
    }
    .dia-num {
      font-size: 20px; font-weight: 700; color: #333;
      width: 36px; height: 36px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
    }
    .dia-hoy .dia-num { background: #2e7d32; color: white; }

    /* ── Celdas de hora ── */
    .time-cell {
      border-right: 1px solid #e8e8e8;
      border-bottom: 1px solid #f0f0f0;
      padding: 6px 6px 0;
      font-size: 11px; color: #bbb; text-align: right;
      background: #fafafa;
    }

    /* ── Celdas de slot ── */
    .slot-cell {
      border-right: 1px solid #ebebeb;
      border-bottom: 1px solid #f0f0f0;
      min-height: 76px; padding: 3px;
      cursor: pointer; transition: background 0.12s;
    }
    .slot-cell:hover { background: #f1f8e9; }
    .slot-pasado { background: #fafafa; }
    .slot-pasado:hover { background: #f5f5f5; }

    /* ── Cita cards ── */
    .cita-card {
      border-radius: 5px; padding: 4px 7px; margin-bottom: 3px;
      cursor: pointer; font-size: 11px;
      display: flex; flex-direction: column; gap: 1px;
      transition: opacity 0.15s, transform 0.1s;
    }
    .cita-card:hover { opacity: 0.82; transform: scale(0.99); }

    .cita-pendiente  { background: #e3f2fd; border-left: 3px solid #1976d2; }
    .cita-confirmada { background: #e8f5e9; border-left: 3px solid #388e3c; }
    .cita-cancelada  { background: #fce4ec; border-left: 3px solid #c62828; opacity: 0.65; }
    .cita-completada { background: #ede7f6; border-left: 3px solid #7b1fa2; }

    .cita-hora   { font-size: 10px; color: #777; line-height: 1.2; }
    .cita-nombre { font-weight: 600; color: #1a1a1a; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .cita-fisio  { font-size: 10px; color: #999; }
  `]
})
export class AgendaComponent implements OnInit {
  private http   = inject(HttpClient);
  private dialog = inject(MatDialog);
  private cdr    = inject(ChangeDetectorRef);

  citas:           any[]         = [];
  fisioterapeutas: any[]         = [];
  filtroFisio:     number | null = null;
  cargando = false;
  semanaBase = new Date();

  readonly HORAS_DIA   = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
  readonly DIAS_NOMBRES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  get diasSemana(): Date[] {
    const dias: Date[] = [];
    const base = new Date(this.semanaBase);
    const dow  = base.getDay();
    const diff = dow === 0 ? -6 : 1 - dow;
    const lunes = new Date(base);
    lunes.setDate(base.getDate() + diff);
    lunes.setHours(0, 0, 0, 0);
    for (let i = 0; i < 7; i++) {
      const d = new Date(lunes);
      d.setDate(lunes.getDate() + i);
      dias.push(d);
    }
    return dias;
  }

  get semanaLabel(): string {
    const [ini, fin] = [this.diasSemana[0], this.diasSemana[6]];
    const M = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    if (ini.getMonth() === fin.getMonth()) {
      return `${ini.getDate()} – ${fin.getDate()} ${M[fin.getMonth()]} ${fin.getFullYear()}`;
    }
    return `${ini.getDate()} ${M[ini.getMonth()]} – ${fin.getDate()} ${M[fin.getMonth()]} ${fin.getFullYear()}`;
  }

  ngOnInit(): void {
    this.cargarFisioterapeutas();
    this.cargarCitas();
  }

  cargarFisioterapeutas(): void {
    this.http.get<any[]>(`${environment.apiUrl}/users`).subscribe({
      next: r => { this.fisioterapeutas = r; this.cdr.detectChanges(); },
      error: () => {}
    });
  }

  cargarCitas(): void {
    this.cargando = true;
    this.cdr.detectChanges();
    const dias = this.diasSemana;
    let url = `${environment.apiUrl}/appointments?start_date=${this.fmt(dias[0])}&end_date=${this.fmt(dias[6])}`;
    if (this.filtroFisio) url += `&physiotherapist_id=${this.filtroFisio}`;
    this.http.get<any[]>(url).subscribe({
      next:  r => { this.citas = r; this.cargando = false; this.cdr.detectChanges(); },
      error: () => { this.cargando = false; this.cdr.detectChanges(); }
    });
  }

  semanaAnterior(): void {
    const d = new Date(this.semanaBase);
    d.setDate(d.getDate() - 7);
    this.semanaBase = d;
    this.cargarCitas();
  }

  semanaSiguiente(): void {
    const d = new Date(this.semanaBase);
    d.setDate(d.getDate() + 7);
    this.semanaBase = d;
    this.cargarCitas();
  }

  irAHoy(): void {
    this.semanaBase = new Date();
    this.cargarCitas();
  }

  esHoy(d: Date): boolean {
    const hoy = new Date();
    return d.getDate() === hoy.getDate()
        && d.getMonth() === hoy.getMonth()
        && d.getFullYear() === hoy.getFullYear();
  }

  esPasado(d: Date, hora: number): boolean {
    const ahora = new Date();
    const fin = new Date(d);
    fin.setHours(hora, 59, 59, 0);
    return fin < ahora;
  }

  getCitasSlot(dia: Date, hora: number): any[] {
    const fechaStr = this.fmt(dia);
    return this.citas.filter(c =>
      c.date === fechaStr && parseInt(c.start_time.split(':')[0], 10) === hora
    );
  }

  formatDateDisplay(d: Date): string {
    return `${this.DIAS_NOMBRES[d.getDay()]} ${d.getDate()}`;
  }

  abrirCrear(dia: Date, hora: number): void {
    const ref = this.dialog.open(CitaDialogComponent, {
      width: '520px',
      data: { fecha: this.fmt(dia), hora, fisioterapeutas: this.fisioterapeutas } as CitaDialogData
    });
    ref.afterClosed().subscribe(r => { if (r?.recargar) this.cargarCitas(); });
  }

  abrirEditar(cita: any, event: Event): void {
    event.stopPropagation();
    const ref = this.dialog.open(CitaDialogComponent, {
      width: '520px',
      data: { cita, fisioterapeutas: this.fisioterapeutas } as CitaDialogData
    });
    ref.afterClosed().subscribe(r => { if (r?.recargar) this.cargarCitas(); });
  }

  fmt(d: Date): string {
    const y  = d.getFullYear();
    const m  = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  }
}
