import { ChangeDetectorRef, Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Paciente } from '../../models/paciente.model';
import { ApiService } from '../../services/api.service';


@Component({
  selector: 'app-buscador',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatListModule, MatProgressSpinnerModule],
  template: `
  <div class="buscador-container">
    <mat-form-field appearance="outline" class="search-field">
      <mat-label>Buscar paciente...</mat-label>
      <input matInput placeholder="Buscar paciente..." [formControl]="searchControl" (keyup.enter)="onBuscar()">
    </mat-form-field>
    <button mat-raised-button color="primary" (click)="onBuscar()">Buscar</button>

    <div *ngIf="loading" class="spinner">
      <mat-progress-spinner mode="indeterminate" diameter="24"></mat-progress-spinner>
    </div>

    <mat-list *ngIf="!loading && resultados.length > 0">
      <mat-list-item *ngFor="let p of resultados" (click)="seleccionar(p)" style="cursor: pointer">
        {{ p.nombre }} {{ p.apellidos }}
      </mat-list-item>
    </mat-list>

    <div *ngIf="!loading && resultados?.length === 0 && searched" class="no-results">
      No se encontraron pacientes
    </div>
  </div>
  `,
  styleUrls: ['./buscador.component.css']
})
export class BuscadorComponent {
  searchControl = new FormControl('');
  resultados: Paciente[] = [];
  loading = false;
  searched = false;
  @Output() pacienteSeleccionado = new EventEmitter<number>();

  private cdr = inject(ChangeDetectorRef);

  constructor(private api: ApiService = inject(ApiService)) {}

onBuscar(): void {
  const nombre = this.searchControl.value?.toString().trim() ?? '';
  this.searched = true;
  if (!nombre) {
    this.resultados = [];
    return;
  }
  this.loading = true;
  this.api.buscarPacientes(nombre).subscribe(
    res => {
      this.resultados = res;
      this.loading = false;
      this.cdr.detectChanges();
    },
    () => {
      this.loading = false;
      this.cdr.detectChanges();
    }
  );
} 


seleccionar(p: Paciente): void {
  this.pacienteSeleccionado.emit(p.id ?? 0);
  this.cdr.detectChanges();
}
}
