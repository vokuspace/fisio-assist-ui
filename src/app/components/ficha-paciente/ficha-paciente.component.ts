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
import { jsPDF } from 'jspdf';
import { FichaCompleta, Sesion } from '../../models/paciente.model';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { HistorialSesionesComponent } from '../historial-sesiones/historial-sesiones.component';


@Component({
  selector: 'app-ficha-paciente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatDatepickerModule, MatNativeDateModule, MatListModule, MatExpansionModule, MatIconModule, HistorialSesionesComponent],
  template: `
  <!-- Cabecera del paciente siempre visible -->
  <div class="ficha-header ficha-header-inline" *ngIf="fichaCompleta">
    <div class="avatar">{{ ((fichaCompleta?.paciente?.nombre?.charAt(0) ?? '') + (fichaCompleta?.paciente?.apellidos?.charAt(0) ?? '')) | uppercase }}</div>
    <div>
      <div class="name">{{ fichaCompleta?.paciente?.nombre }} {{ fichaCompleta?.paciente?.apellidos }}</div>
      <div class="contact">Tel: {{ fichaCompleta?.paciente?.telefono }} | {{ fichaCompleta?.paciente?.email }}</div>
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
          <div class="info-value">{{ fichaCompleta?.ficha?.patologia }}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Diagnóstico</div>
          <div class="info-value">{{ fichaCompleta?.ficha?.diagnostico }}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Medicación</div>
          <div class="info-value">{{ fichaCompleta?.ficha?.medicacion }}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Contraindicaciones</div>
          <div class="info-value danger">{{ fichaCompleta?.ficha?.contraindicaciones }}</div>
        </div>
      </div>
    </mat-expansion-panel>

    <!-- Panel: Historial de sesiones -->
    <mat-expansion-panel expanded>
      <mat-expansion-panel-header>
        <mat-panel-title><mat-icon class="panel-icon">history</mat-icon> Historial de sesiones</mat-panel-title>
        <mat-panel-description>{{ fichaCompleta?.sesiones?.length ?? 0 }} sesiones</mat-panel-description>
      </mat-expansion-panel-header>

      <app-historial-sesiones
        [sesiones]="fichaCompleta?.sesiones ?? []"
        (archivoSubido)="recargarFicha()">
      </app-historial-sesiones>

      <button mat-raised-button color="primary" class="btn-nueva-sesion" (click)="showNewSession = !showNewSession">
        <mat-icon>add</mat-icon> Nueva sesión
      </button>

      <form *ngIf="showNewSession" [formGroup]="newSessionForm" (ngSubmit)="guardarSesion()" class="new-session-form">
        <mat-form-field appearance="fill">
          <mat-label>Fecha</mat-label>
          <input matInput formControlName="fecha" type="date">
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Notas de sesión</mat-label>
          <textarea matInput formControlName="notas_sesion" rows="2"></textarea>
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Ejercicios prescritos</mat-label>
          <textarea matInput formControlName="ejercicios_prescritos" rows="2"></textarea>
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Evolución</mat-label>
          <input matInput formControlName="evolucion">
        </mat-form-field>
        <div class="form-actions">
          <button mat-raised-button color="primary" type="submit" [disabled]="newSessionForm.invalid">Guardar</button>
          <button mat-button type="button" (click)="showNewSession = false">Cancelar</button>
        </div>
      </form>
    </mat-expansion-panel>

  </mat-accordion>
  `,
  styleUrls: ['./ficha-paciente.component.css']
})
export class FichaPacienteComponent {
  @Input() fichaCompleta?: FichaCompleta;
  showNewSession = false;
  newSessionForm: FormGroup;
  private cdr = inject(ChangeDetectorRef);

  constructor(private api: ApiService = inject(ApiService), private fb: FormBuilder) {
    this.newSessionForm = this.fb.group({
      fecha: [new Date().toISOString().split('T')[0], Validators.required],
      notas_sesion: ['', Validators.required],
      ejercicios_prescritos: [''],
      evolucion: ['']
    });
  }

recargarFicha(): void {
  if (!this.fichaCompleta?.paciente?.id) return;
  this.api.obtenerPaciente(this.fichaCompleta.paciente.id).subscribe(data => {
    this.fichaCompleta = data;
    this.cdr.detectChanges();
  });
}

guardarSesion(): void {
  if (!this.fichaCompleta?.paciente?.id || this.newSessionForm.invalid) return;
  const pacienteId = this.fichaCompleta.paciente.id;
  const payload: Sesion = {
    paciente_id: pacienteId,
    fecha: this.newSessionForm.value.fecha,
    notas_sesion: this.newSessionForm.value.notas_sesion,
    ejercicios_prescritos: this.newSessionForm.value.ejercicios_prescritos,
    evolucion: this.newSessionForm.value.evolucion
  } as Sesion;
  
  this.api.añadirSesion(pacienteId, payload).subscribe(() => {
    this.showNewSession = false;
    this.newSessionForm.reset({
      fecha: new Date().toISOString().split('T')[0]
    });
    // Recarga la ficha completa del paciente
    this.api.obtenerPaciente(pacienteId).subscribe(data => {
      this.fichaCompleta = data;
      this.cdr.detectChanges();
    });
  });
}
  exportarPDF(): void {
    if (!this.fichaCompleta) return;
    const paciente = this.fichaCompleta.paciente;
    const ficha = this.fichaCompleta.ficha;
    const sesiones = this.fichaCompleta.sesiones?.slice(0, 3) ?? [];

    // Create PDF
    // Use points (pt) for simple layout on A4
    const doc = new jsPDF('p', 'pt', 'a4');
    let y = 40;
    const left = 40;
    const lineHeight = 16;

    // Cabecera
    doc.setFontSize(16);
    const fechaActual = new Date();
    const headerFecha = fechaActual.toLocaleDateString();
    doc.text('FisioIA — Ficha Clínica', left, y);
    doc.setFontSize(12);
    y += lineHeight + 6;
    doc.text('Fecha: ' + headerFecha, left, y);
    y += lineHeight * 1.5;

    // Datos del paciente
    doc.setFontSize(12);
    const fullName = [paciente?.nombre, paciente?.apellidos].filter(Boolean).join(' ');
    doc.text('Paciente: ' + fullName, left, y);
    y += lineHeight;
    doc.text('Contacto: ' + (paciente?.telefono ?? '') + ' | ' + (paciente?.email ?? ''), left, y);
    y += lineHeight * 1.5;

    // Diagnóstico
    doc.setFontSize(12);
    doc.text('Diagnóstico clínico', left, y);
    y += lineHeight;
    doc.text('Patología: ' + (ficha?.patologia ?? ''), left, y);
    y += lineHeight;
    doc.text('Diagnóstico: ' + (ficha?.diagnostico ?? ''), left, y);
    y += lineHeight * 1.5;

    // Medicación y contraindicaciones
    doc.text('Medicación', left, y);
    y += lineHeight;
    doc.text((ficha?.medicacion ?? ''), left, y);
    y += lineHeight * 1.3;
    // Contraindicaciones en rojo si las hay
    if (ficha?.contraindicaciones && ficha.contraindicaciones.toString().trim().length > 0) {
      doc.setTextColor(255, 0, 0);
      doc.text('Contraindicaciones: ' + (ficha?.contraindicaciones ?? ''), left, y);
      doc.setTextColor(0, 0, 0);
    } else {
      doc.text('Contraindicaciones: ' + '', left, y);
    }
    y += lineHeight * 1.6;

    // Últimas sesiones
    doc.setTextColor(0, 0, 0);
    doc.text('Últimas sesiones', left, y);
    y += lineHeight;
    sesiones.forEach((s) => {
      const fecha = s?.fecha ?? '';
      const notas = s?.notas_sesion ?? '';
      const ejercicios = s?.ejercicios_prescritos ?? '';
      doc.text(
        (fecha ? fecha + ' - ' : '') + notas + (notas && (ejercicios || false) ? ' | ' : '') + ejercicios,
        left,
        y
      );
      y += lineHeight * 1.1;
    });

    // Pie de página
    const pageHeight = (doc as any).internal?.pageSize?.getHeight
      ? (doc as any).internal.pageSize.getHeight()
      : 841.89; // fallback A4 height in points
    doc.setPage(1);
    doc.setFontSize(10);
    doc.text('Documento generado por FisioIA', left, pageHeight - 40);

    // Filename: ficha_[apellidos]_[fecha].pdf
    const apellidos = (paciente?.apellidos ?? 'paciente').replace(/\s+/g, '_');
    const dateStr = fechaActual.toISOString().slice(0, 10).replace(/-/g, '');
    const filename = `ficha_${apellidos}_${dateStr}.pdf`;

    doc.save(filename);
  }
}
