import { Component, Input, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ApiService } from '../../services/api.service';
import { FichaCompleta, Sesion } from '../../models/patient.model';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { HistorialSesionesComponent } from '../session-history/session-history.component';


@Component({
  selector: 'app-patient-record',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatDatepickerModule, MatNativeDateModule, MatListModule, MatExpansionModule, MatIconModule, HistorialSesionesComponent],
  template: `
  <!-- Cabecera del paciente siempre visible -->
  <div class="ficha-header ficha-header-inline" *ngIf="fichaCompleta">
    <div class="avatar">{{ ((fichaCompleta?.patient?.name?.charAt(0) ?? '') + (fichaCompleta?.patient?.last_name?.charAt(0) ?? '')) | uppercase }}</div>
    <div>
      <div class="name">{{ fichaCompleta?.patient?.name }} {{ fichaCompleta?.patient?.last_name }}</div>
      <div class="contact">Tel: {{ fichaCompleta?.patient?.phone }} | {{ fichaCompleta?.patient?.email }}</div>
    </div>
    <span class="spacer"></span>
    <button mat-raised-button color="accent" (click)="exportarPDF()">
      <mat-icon>picture_as_pdf</mat-icon> PDF
    </button>
  </div>

  <!-- Acordeón interno -->
  <mat-accordion *ngIf="fichaCompleta" multi class="ficha-accordion">

    <!-- Panel: Datos clínicos -->
    <mat-expansion-panel expanded>
      <mat-expansion-panel-header>
        <mat-panel-title><mat-icon class="panel-icon">medical_information</mat-icon> Datos clínicos</mat-panel-title>
      </mat-expansion-panel-header>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Patología</div>
          <div class="info-value">{{ fichaCompleta?.clinical_record?.pathology }}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Diagnóstico</div>
          <div class="info-value">{{ fichaCompleta?.clinical_record?.diagnosis_text }}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Medicación</div>
          <div class="info-value">{{ fichaCompleta?.clinical_record?.medication }}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Contraindicaciones</div>
          <div class="info-value danger">{{ fichaCompleta?.clinical_record?.contraindications }}</div>
        </div>
      </div>
    </mat-expansion-panel>

    <!-- Panel: Historial de sesiones -->
    <mat-expansion-panel expanded>
      <mat-expansion-panel-header>
        <mat-panel-title><mat-icon class="panel-icon">history</mat-icon> Historial de sesiones</mat-panel-title>
        <mat-panel-description>{{ fichaCompleta?.sessions?.length ?? 0 }} sesiones</mat-panel-description>
      </mat-expansion-panel-header>

      <app-session-history
        [sesiones]="fichaCompleta?.sessions ?? []"
        (archivoSubido)="recargarFicha()">
      </app-session-history>

      <button mat-raised-button color="primary" class="btn-nueva-sesion" (click)="showNewSession = !showNewSession">
        <mat-icon>add</mat-icon> Nueva sesión
      </button>

      <form *ngIf="showNewSession" [formGroup]="newSessionForm" (ngSubmit)="guardarSesion()" class="new-session-form">
        <mat-form-field appearance="fill">
          <mat-label>Fecha</mat-label>
          <input matInput formControlName="date" type="date">
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Notas de sesión</mat-label>
          <textarea matInput formControlName="session_notes" rows="2"></textarea>
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Ejercicios prescritos</mat-label>
          <textarea matInput formControlName="prescribed_exercises" rows="2"></textarea>
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Evolución</mat-label>
          <input matInput formControlName="progress">
        </mat-form-field>
        <div class="form-actions">
          <button mat-raised-button color="primary" type="submit" [disabled]="newSessionForm.invalid">Guardar</button>
          <button mat-button type="button" (click)="showNewSession = false">Cancelar</button>
        </div>
      </form>
    </mat-expansion-panel>

  </mat-accordion>
  `,
  styleUrls: ['./patient-record.component.css']
})
export class FichaPacienteComponent {
  @Input() fichaCompleta?: FichaCompleta;
  showNewSession = false;
  newSessionForm: FormGroup;
  private cdr = inject(ChangeDetectorRef);

  constructor(private api: ApiService = inject(ApiService), private fb: FormBuilder) {
    this.newSessionForm = this.fb.group({
      date:                 [new Date().toISOString().split('T')[0], Validators.required],
      session_notes:        ['', Validators.required],
      prescribed_exercises: [''],
      progress:             ['']
    });
  }

recargarFicha(): void {
  if (!this.fichaCompleta?.patient?.id) return;
  this.api.obtenerPaciente(this.fichaCompleta.patient.id).subscribe(data => {
    this.fichaCompleta = data;
    this.cdr.detectChanges();
  });
}

guardarSesion(): void {
  if (!this.fichaCompleta?.patient?.id || this.newSessionForm.invalid) return;
  const patientId = this.fichaCompleta.patient.id;
  const payload: Sesion = {
    patient_id:           patientId,
    date:                 this.newSessionForm.value.date,
    session_notes:        this.newSessionForm.value.session_notes,
    prescribed_exercises: this.newSessionForm.value.prescribed_exercises,
    progress:             this.newSessionForm.value.progress
  } as Sesion;

  this.api.añadirSesion(patientId, payload).subscribe(() => {
    this.showNewSession = false;
    this.newSessionForm.reset({
      date: new Date().toISOString().split('T')[0]
    });
    this.api.obtenerPaciente(patientId).subscribe(data => {
      this.fichaCompleta = data;
      this.cdr.detectChanges();
    });
  });
}

  async exportarPDF(): Promise<void> {
    if (!this.fichaCompleta) return;
    const { jsPDF } = await import('jspdf');
    const paciente = this.fichaCompleta.patient;
    const ficha = this.fichaCompleta.clinical_record;
    const sesiones = this.fichaCompleta.sessions?.slice(0, 3) ?? [];

    const doc = new jsPDF('p', 'pt', 'a4');
    let y = 40;
    const left = 40;
    const lineHeight = 16;

    doc.setFontSize(16);
    const fechaActual = new Date();
    const headerFecha = fechaActual.toLocaleDateString();
    doc.text('FisioIA — Ficha Clínica', left, y);
    doc.setFontSize(12);
    y += lineHeight + 6;
    doc.text('Fecha: ' + headerFecha, left, y);
    y += lineHeight * 1.5;

    doc.setFontSize(12);
    const fullName = [paciente?.name, paciente?.last_name].filter(Boolean).join(' ');
    doc.text('Paciente: ' + fullName, left, y);
    y += lineHeight;
    doc.text('Contacto: ' + (paciente?.phone ?? '') + ' | ' + (paciente?.email ?? ''), left, y);
    y += lineHeight * 1.5;

    doc.setFontSize(12);
    doc.text('Diagnóstico clínico', left, y);
    y += lineHeight;
    doc.text('Patología: ' + (ficha?.pathology ?? ''), left, y);
    y += lineHeight;
    doc.text('Diagnóstico: ' + (ficha?.diagnosis_text ?? ''), left, y);
    y += lineHeight * 1.5;

    doc.text('Medicación', left, y);
    y += lineHeight;
    doc.text((ficha?.medication ?? ''), left, y);
    y += lineHeight * 1.3;
    if (ficha?.contraindications && ficha.contraindications.toString().trim().length > 0) {
      doc.setTextColor(255, 0, 0);
      doc.text('Contraindicaciones: ' + (ficha?.contraindications ?? ''), left, y);
      doc.setTextColor(0, 0, 0);
    } else {
      doc.text('Contraindicaciones: ' + '', left, y);
    }
    y += lineHeight * 1.6;

    doc.setTextColor(0, 0, 0);
    doc.text('Últimas sesiones', left, y);
    y += lineHeight;
    sesiones.forEach((s) => {
      const fecha = s?.date ?? '';
      const notas = s?.session_notes ?? '';
      const ejercicios = s?.prescribed_exercises ?? '';
      doc.text(
        (fecha ? fecha + ' - ' : '') + notas + (notas && (ejercicios || false) ? ' | ' : '') + ejercicios,
        left,
        y
      );
      y += lineHeight * 1.1;
    });

    const pageHeight = (doc as any).internal?.pageSize?.getHeight
      ? (doc as any).internal.pageSize.getHeight()
      : 841.89;
    doc.setPage(1);
    doc.setFontSize(10);
    doc.text('Documento generado por FisioIA', left, pageHeight - 40);

    const lastName = (paciente?.last_name ?? 'patient').replace(/\s+/g, '_');
    const dateStr = fechaActual.toISOString().slice(0, 10).replace(/-/g, '');
    const filename = `record_${lastName}_${dateStr}.pdf`;

    doc.save(filename);
  }
}
