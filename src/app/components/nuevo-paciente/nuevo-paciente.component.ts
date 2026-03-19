import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-nuevo-paciente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatDatepickerModule, MatNativeDateModule, MatButtonModule],
  template: `
    <div class="nuevo-paciente" *ngIf="!showForm">
      <button mat-raised-button color="primary" (click)="toggleForm()">Nuevo paciente</button>
    </div>
    <div *ngIf="showForm" class="nuevo-form">
      <form [formGroup]="form" (ngSubmit)="guardar()">
        <mat-form-field appearance="fill" style="width: 100%">
          <mat-label>Nombre</mat-label>
          <input matInput formControlName="nombre" />
        </mat-form-field>
        <mat-form-field appearance="fill" style="width: 100%">
          <mat-label>Apellidos</mat-label>
          <input matInput formControlName="apellidos" />
        </mat-form-field>
        <mat-form-field appearance="fill" style="width: 100%">
          <mat-label>Fecha de nacimiento</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="fecha_nacimiento" type="date" />
          <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>
        <mat-form-field appearance="fill" style="width: 100%">
          <mat-label>Teléfono</mat-label>
          <input matInput formControlName="telefono" />
        </mat-form-field>
        <mat-form-field appearance="fill" style="width: 100%">
          <mat-label>Email</mat-label>
          <input matInput formControlName="email" type="email" />
        </mat-form-field>
        <mat-form-field appearance="fill" style="width: 100%">
          <mat-label>Diagnóstico</mat-label>
          <input matInput formControlName="diagnostico" />
        </mat-form-field>
        <mat-form-field appearance="fill" style="width: 100%">
          <mat-label>Patología</mat-label>
          <input matInput formControlName="patologia" />
        </mat-form-field>
        <mat-form-field appearance="fill" style="width: 100%">
          <mat-label>Medicacion</mat-label>
          <input matInput formControlName="medicacion" />
        </mat-form-field>
        <mat-form-field appearance="fill" style="width: 100%">
          <mat-label>Contraindicaciones</mat-label>
          <input matInput formControlName="contraindicaciones" />
        </mat-form-field>
        <mat-form-field appearance="fill" style="width: 100%">
          <mat-label>Observaciones</mat-label>
          <textarea matInput formControlName="observaciones"></textarea>
        </mat-form-field>
        <div class="actions">
          <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">Guardar paciente</button>
          <button mat-button type="button" (click)="toggleForm()">Cancelar</button>
        </div>
      </form>
    </div>
  `,
  styleUrls: []
})
export class NuevoPacienteComponent {
  @Output() pacienteCreado = new EventEmitter<number>();
  showForm = false;
  form: FormGroup;
  constructor(private api: ApiService = inject(ApiService), private fb: FormBuilder) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      fecha_nacimiento: ['', Validators.required],
      telefono: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      diagnostico: ['', Validators.required],
      patologia: [''],
      medicacion: [''],
      contraindicaciones: [''],
      observaciones: ['']
    });
  }
  toggleForm(): void {
    this.showForm = !this.showForm;
  }
  guardar(): void {
    if (this.form.invalid) return;
    const datosPaciente = this.form.value;
    this.api.crearPaciente(datosPaciente).subscribe((p: any) => {
      const id = p?.id;
      const ficha = {
        paciente_id: id,
        diagnostico: datosPaciente.diagnostico,
        patologia: datosPaciente.patologia,
        medicacion: datosPaciente.medicacion,
        contraindicaciones: datosPaciente.contraindicaciones,
        observaciones: datosPaciente.observaciones
      };
      // Llamar a crear ficha si la API la expone; se asume ruta /api/ficha
      this.api.crearFicha ? (this.api.crearFicha(ficha).subscribe(() => {})) : Promise.resolve();
      this.pacienteCreado.emit(id);
      this.showForm = false;
      this.form.reset();
    });
  }
}
