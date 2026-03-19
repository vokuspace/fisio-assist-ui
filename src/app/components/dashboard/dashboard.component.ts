import { ChangeDetectorRef, Component, OnInit, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../services/api.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="dashboard">
      <h2 class="dash-title">
        <mat-icon>dashboard</mat-icon>
        Dashboard
      </h2>

      <!-- Tarjetas de métricas -->
      <div class="cards-grid">
        <div class="metric-card card-blue">
          <mat-icon>people</mat-icon>
          <div class="metric-info">
            <span class="metric-value">{{ metricas?.total_pacientes ?? '—' }}</span>
            <span class="metric-label">Pacientes totales</span>
          </div>
        </div>

        <div class="metric-card card-green">
          <mat-icon>person_add</mat-icon>
          <div class="metric-info">
            <span class="metric-value">{{ metricas?.altas_este_mes ?? '—' }}</span>
            <span class="metric-label">Altas este mes</span>
          </div>
        </div>

        <div class="metric-card card-orange">
          <mat-icon>event_note</mat-icon>
          <div class="metric-info">
            <span class="metric-value">{{ metricas?.sesiones_esta_semana ?? '—' }}</span>
            <span class="metric-label">Sesiones esta semana</span>
          </div>
        </div>

        <div class="metric-card card-purple">
          <mat-icon>trending_up</mat-icon>
          <div class="metric-info">
            <span class="metric-value">{{ crecimientoMes }}</span>
            <span class="metric-label">Crecimiento últimos 6 meses</span>
          </div>
        </div>
      </div>

      <!-- Gráfico de evolución mensual -->
      <div class="chart-card">
        <h3 class="chart-title">Nuevos pacientes — últimos 6 meses</h3>
        <div class="chart-wrap">
          <canvas #chartCanvas></canvas>
        </div>
      </div>

      <!-- Mensaje si no hay datos -->
      <div class="no-data" *ngIf="error">
        <mat-icon>error_outline</mat-icon>
        <p>No se pudieron cargar las métricas. Verifica que el backend esté activo.</p>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      padding: 28px 32px;
      background: #f5f7fb;
      min-height: 100%;
    }
    .dash-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 1.4rem;
      font-weight: 700;
      color: #2d3a4a;
      margin: 0 0 28px 0;
    }
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 28px;
    }
    .metric-card {
      display: flex;
      align-items: center;
      gap: 18px;
      padding: 22px 24px;
      border-radius: 14px;
      color: #fff;
      box-shadow: 0 2px 10px rgba(0,0,0,0.10);
    }
    .metric-card mat-icon {
      font-size: 2.2rem;
      width: 2.2rem;
      height: 2.2rem;
      opacity: 0.85;
    }
    .metric-info {
      display: flex;
      flex-direction: column;
    }
    .metric-value {
      font-size: 2rem;
      font-weight: 800;
      line-height: 1;
    }
    .metric-label {
      font-size: 0.78rem;
      opacity: 0.9;
      margin-top: 4px;
      font-weight: 500;
    }
    .card-blue   { background: linear-gradient(135deg, #2979ff, #448aff); }
    .card-green  { background: linear-gradient(135deg, #00c853, #69f0ae 140%); }
    .card-orange { background: linear-gradient(135deg, #ff6d00, #ffab40 140%); }
    .card-purple { background: linear-gradient(135deg, #7c4dff, #b388ff 140%); }

    .chart-card {
      background: #fff;
      border-radius: 14px;
      padding: 24px 28px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.07);
    }
    .chart-title {
      font-size: 1rem;
      font-weight: 600;
      color: #2d3a4a;
      margin: 0 0 20px 0;
    }
    .chart-wrap {
      position: relative;
      height: 260px;
    }
    .no-data {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #e53935;
      margin-top: 20px;
    }
  `]
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  metricas: any = null;
  error = false;
  crecimientoMes = '—';
  private chart: Chart | null = null;

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.api.getDashboard().subscribe({
      next: (data) => {
        this.metricas = data;
        this.calcularCrecimiento(data.evolucion_mensual);
        this.cdr.detectChanges();
        if (this.chartCanvas) {
          this.dibujarGrafico(data.evolucion_mensual);
        }
      },
      error: () => { this.error = true; this.cdr.detectChanges(); }
    });
  }

  ngAfterViewInit(): void {
    if (this.metricas?.evolucion_mensual) {
      this.dibujarGrafico(this.metricas.evolucion_mensual);
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private calcularCrecimiento(evolucion: {mes: string, pacientes: number}[]): void {
    if (!evolucion || evolucion.length < 2) return;
    const ultimo = evolucion[evolucion.length - 1].pacientes;
    const penultimo = evolucion[evolucion.length - 2].pacientes;
    if (penultimo === 0) {
      this.crecimientoMes = ultimo > 0 ? '+' + ultimo : '0';
      return;
    }
    const pct = Math.round(((ultimo - penultimo) / penultimo) * 100);
    this.crecimientoMes = (pct >= 0 ? '+' : '') + pct + '%';
  }

  private dibujarGrafico(evolucion: {mes: string, pacientes: number}[]): void {
    if (this.chart) { this.chart.destroy(); }
    const ctx = this.chartCanvas.nativeElement.getContext('2d')!;
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: evolucion.map(e => e.mes),
        datasets: [{
          label: 'Nuevos pacientes',
          data: evolucion.map(e => e.pacientes),
          borderColor: '#2979ff',
          backgroundColor: 'rgba(41,121,255,0.10)',
          borderWidth: 2.5,
          pointBackgroundColor: '#2979ff',
          pointRadius: 5,
          fill: true,
          tension: 0.35
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { mode: 'index', intersect: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1, precision: 0 },
            grid: { color: 'rgba(0,0,0,0.06)' }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });
  }
}
