import { Component, Input, Output, EventEmitter, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../services/api.service';
import { Sesion } from '../../models/paciente.model';

@Component({
  selector: 'app-historial-sesiones',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatTooltipModule],
  template: `
    <div class="historial">
      <div class="historial-header">
        <mat-icon>history</mat-icon>
        <span>Historial de sesiones</span>
        <span class="badge">{{ sesiones.length }}</span>
      </div>

      <div class="timeline" *ngIf="sesiones.length; else sinSesiones">
        <div class="timeline-item" *ngFor="let s of sesiones; let i = index">

          <!-- Línea + punto de la timeline -->
          <div class="tl-left">
            <div class="tl-dot" [ngClass]="getEvolucionClass(s.evolucion)"></div>
            <div class="tl-line" *ngIf="i < sesiones.length - 1"></div>
          </div>

          <!-- Contenido de la sesión -->
          <div class="tl-card">
            <div class="tl-card-header">
              <span class="tl-fecha">{{ s.fecha }}</span>
              <span class="evol-badge" [ngClass]="getEvolucionClass(s.evolucion)">
                <mat-icon>{{ getEvolucionIcon(s.evolucion) }}</mat-icon>
                {{ getEvolucionLabel(s.evolucion) }}
              </span>
            </div>

            <div class="tl-notas" *ngIf="s.notas_sesion">
              <strong>Notas:</strong> {{ s.notas_sesion }}
            </div>
            <div class="tl-ejercicios" *ngIf="s.ejercicios_prescritos">
              <strong>Ejercicios:</strong> {{ s.ejercicios_prescritos }}
            </div>

            <!-- Adjunto -->
            <div class="tl-adjunto">
              <ng-container *ngIf="s.archivo_nombre; else sinArchivo">
                <a [href]="getArchivoUrl(s.id!)" target="_blank" class="adjunto-link" matTooltip="Ver adjunto">
                  <mat-icon>attach_file</mat-icon> {{ s.archivo_nombre }}
                </a>
                <button mat-icon-button class="btn-upload" (click)="triggerUpload(s.id!)" matTooltip="Cambiar archivo">
                  <mat-icon>upload</mat-icon>
                </button>
              </ng-container>
              <ng-template #sinArchivo>
                <button mat-button class="btn-adjuntar" (click)="triggerUpload(s.id!)">
                  <mat-icon>attach_file</mat-icon> Adjuntar archivo
                </button>
              </ng-template>
            </div>
          </div>
        </div>
      </div>

      <ng-template #sinSesiones>
        <p class="sin-datos">No hay sesiones registradas.</p>
      </ng-template>

      <!-- Input oculto para la subida de archivos -->
      <input #fileInput type="file" accept=".jpg,.jpeg,.png,.gif,.webp,.pdf"
        style="display:none" (change)="onFileSelected($event)">
    </div>
  `,
  styles: [`
    .historial { font-family: inherit; }

    .historial-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1rem;
      font-weight: 600;
      color: #2d3a4a;
      margin-bottom: 20px;
    }
    .badge {
      background: #e8f0fe;
      color: #2979ff;
      border-radius: 12px;
      padding: 2px 9px;
      font-size: 0.8rem;
      font-weight: 700;
    }

    /* Timeline */
    .timeline {
      display: flex;
      flex-direction: column;
      gap: 0;
      max-height: 420px;
      overflow-y: auto;
      padding-right: 6px;
      scrollbar-width: thin;
      scrollbar-color: #c8d8e8 transparent;
    }
    .timeline::-webkit-scrollbar { width: 5px; }
    .timeline::-webkit-scrollbar-track { background: transparent; }
    .timeline::-webkit-scrollbar-thumb { background: #c8d8e8; border-radius: 4px; }

    .timeline-item {
      display: flex;
      gap: 16px;
      position: relative;
    }

    .tl-left {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 20px;
      flex-shrink: 0;
    }
    .tl-dot {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      border: 3px solid #fff;
      box-shadow: 0 0 0 2px currentColor;
      margin-top: 14px;
      flex-shrink: 0;
    }
    .tl-line {
      flex: 1;
      width: 2px;
      background: #e0e0e0;
      margin: 4px 0;
    }

    /* Colores de evolución */
    .mejora  { color: #2e7d32; background: #e8f5e9; }
    .estable { color: #f57f17; background: #fffde7; }
    .empeora { color: #c62828; background: #ffebee; }
    .neutro  { color: #455a64; background: #eceff1; }

    .tl-dot.mejora  { color: #43a047; }
    .tl-dot.estable { color: #fbc02d; }
    .tl-dot.empeora { color: #e53935; }
    .tl-dot.neutro  { color: #90a4ae; }

    /* Tarjeta de sesión */
    .tl-card {
      background: #fff;
      border-radius: 10px;
      border: 1px solid #e8eaf0;
      padding: 14px 18px;
      margin-bottom: 14px;
      flex: 1;
      box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    }
    .tl-card-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 10px;
    }
    .tl-fecha {
      font-weight: 700;
      color: #37474f;
      font-size: 0.9rem;
    }

    .evol-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .evol-badge mat-icon { font-size: 14px; width: 14px; height: 14px; }

    .tl-notas, .tl-ejercicios {
      font-size: 0.88rem;
      color: #546e7a;
      margin-bottom: 6px;
      line-height: 1.5;
    }

    .tl-adjunto {
      margin-top: 10px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .adjunto-link {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.82rem;
      color: #2979ff;
      text-decoration: none;
      font-weight: 500;
    }
    .adjunto-link:hover { text-decoration: underline; }
    .btn-adjuntar {
      font-size: 0.8rem;
      color: #78909c;
      padding: 0 8px;
      height: 30px;
      line-height: 30px;
    }
    .btn-upload { color: #78909c; }

    .sin-datos { color: #90a4ae; font-size: 0.9rem; padding: 12px 0; }
  `]
})
export class HistorialSesionesComponent {
  @Input() sesiones: Sesion[] = [];
  @Output() archivoSubido = new EventEmitter<void>();

  private activeSesionId: number | null = null;
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);

  // ── Helpers de evolución ───────────────────────────────────────────────────

  getEvolucionClass(evolucion: string): string {
    if (!evolucion) return 'neutro';
    const v = evolucion.toLowerCase();
    if (/mejora|progres|bien|buena|increment|consolid|óptim|optim/.test(v)) return 'mejora';
    if (/empeor|dolor|malo|regres|limitac|peor/.test(v)) return 'empeora';
    if (/estable|continu|moderado|ligero/.test(v)) return 'estable';
    return 'neutro';
  }

  getEvolucionIcon(evolucion: string): string {
    switch (this.getEvolucionClass(evolucion)) {
      case 'mejora':  return 'trending_up';
      case 'empeora': return 'trending_down';
      case 'estable': return 'trending_flat';
      default:        return 'remove';
    }
  }

  getEvolucionLabel(evolucion: string): string {
    if (!evolucion) return 'Sin registro';
    switch (this.getEvolucionClass(evolucion)) {
      case 'mejora':  return 'Mejora';
      case 'empeora': return 'Empeora';
      case 'estable': return 'Estable';
      default:        return evolucion.length > 20 ? evolucion.slice(0, 20) + '…' : evolucion;
    }
  }

  // ── Archivos ───────────────────────────────────────────────────────────────

  getArchivoUrl(sesionId: number): string {
    const token = localStorage.getItem('token') ?? '';
    return `${this.api.getArchivoSesionUrl(sesionId)}?token=${token}`;
  }

  triggerUpload(sesionId: number): void {
    this.activeSesionId = sesionId;
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    input?.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length || this.activeSesionId === null) return;
    const archivo = input.files[0];
    this.api.subirArchivoSesion(this.activeSesionId, archivo).subscribe({
      next: (res) => {
        const s = this.sesiones.find((x: Sesion) => x.id === this.activeSesionId);
        if (s) { s.archivo_nombre = res.archivo_nombre; }
        this.activeSesionId = null;
        input.value = '';
        this.cdr.detectChanges();
        this.archivoSubido.emit();
      },
      error: () => { input.value = ''; }
    });
  }
}
