import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { SearchComponent } from './components/search/search.component';
import { FichaPacienteComponent } from './components/patient-record/patient-record.component';
import { ChatComponent } from './components/chat/chat.component';
import { GestionPacientesComponent } from './components/patient-management/patient-management.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { GestionUsuariosComponent } from './components/user-management/user-management.component';
import { AgendaComponent } from './components/agenda/agenda.component';
import { ApiService } from './services/api.service';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { CommonModule } from '@angular/common';

const ROL_LABEL: Record<string, string> = {
  clinic_admin:    'Admin',
  physiotherapist: 'Fisioterapeuta',
  receptionist:    'Recepcionista',
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    SearchComponent, FichaPacienteComponent, ChatComponent, GestionPacientesComponent,
    DashboardComponent, GestionUsuariosComponent, AgendaComponent,
    MatToolbarModule, MatIconModule, MatButtonModule, MatTooltipModule, MatExpansionModule
  ],
  template: `
    <!-- Topbar -->
    <mat-toolbar color="primary" class="topbar">
      <mat-icon>health_and_safety</mat-icon>
      <span class="title">FisioIA</span>
      <span class="title-sub">Asistente Clínico</span>
      <span class="spacer"></span>
      <div class="toolbar-user" *ngIf="name">
        <div class="user-avatar">{{ name.charAt(0) | uppercase }}</div>
        <div class="toolbar-user-info">
          <span class="toolbar-nombre">{{ name }}</span>
          <span class="toolbar-clinica" *ngIf="clinicName">{{ clinicName }}</span>
        </div>
        <span class="rol-badge" [class]="'rol-' + role">{{ rolLabel }}</span>
      </div>
      <button mat-button class="btn-logout" (click)="logout()">
        <mat-icon>logout</mat-icon> Cerrar sesión
      </button>
    </mat-toolbar>

    <div class="shell">

      <!-- Sidebar de navegación -->
      <nav class="sidebar">
        <button
          class="nav-item"
          [class.active]="vistaActual === 'dashboard'"
          (click)="setVista('dashboard')"
          matTooltip="Dashboard" matTooltipPosition="right">
          <mat-icon>dashboard</mat-icon>
          <span class="nav-label">Dashboard</span>
        </button>

        <button
          class="nav-item"
          [class.active]="vistaActual === 'principal'"
          (click)="setVista('principal')"
          matTooltip="Pacientes" matTooltipPosition="right">
          <mat-icon>person_search</mat-icon>
          <span class="nav-label">Pacientes</span>
        </button>

        <button
          class="nav-item"
          [class.active]="vistaActual === 'gestion'"
          (click)="setVista('gestion')"
          matTooltip="Gestionar pacientes" matTooltipPosition="right">
          <mat-icon>manage_accounts</mat-icon>
          <span class="nav-label">Gestión</span>
        </button>

        <button
          class="nav-item"
          [class.active]="vistaActual === 'agenda'"
          (click)="setVista('agenda')"
          matTooltip="Agenda de citas" matTooltipPosition="right">
          <mat-icon>calendar_month</mat-icon>
          <span class="nav-label">Agenda</span>
        </button>

        <button *ngIf="isAdmin"
          class="nav-item"
          [class.active]="vistaActual === 'usuarios'"
          (click)="setVista('usuarios')"
          matTooltip="Usuarios de la clínica" matTooltipPosition="right">
          <mat-icon>group</mat-icon>
          <span class="nav-label">Usuarios</span>
        </button>

        <div class="sidebar-spacer"></div>

        <button class="nav-item nav-item--logout" (click)="logout()"
          matTooltip="Cerrar sesión" matTooltipPosition="right">
          <mat-icon>logout</mat-icon>
          <span class="nav-label">Salir</span>
        </button>
      </nav>

      <!-- Área de contenido -->
      <main class="content">

        <!-- Vista principal: buscador + ficha + chat -->
        <div class="app-layout" *ngIf="vistaActual === 'principal'">
          <aside class="left-col">
            <app-search (pacienteSeleccionado)="onPacienteSeleccionado($event)"></app-search>
          </aside>
          <section class="right-col">

            <!-- Estado vacío: ningún paciente seleccionado -->
            <div class="empty-state" *ngIf="!pacienteId">
              <div class="empty-icon-wrap">
                <mat-icon class="empty-icon">person_search</mat-icon>
              </div>
              <h3 class="empty-title">Selecciona un paciente</h3>
              <p class="empty-desc">Busca un paciente en el panel izquierdo para ver su ficha clínica y chatear con el asistente IA.</p>
            </div>

            <!-- Ficha + Chat cuando hay paciente -->
            <mat-accordion *ngIf="pacienteId" class="panels-accordion" multi>

              <!-- Ficha clínica: oculta para recepcionista -->
              <mat-expansion-panel expanded *ngIf="!isRecepcionista">
                <mat-expansion-panel-header>
                  <mat-panel-title>
                    <mat-icon class="panel-icon">assignment_ind</mat-icon>
                    Ficha clínica
                  </mat-panel-title>
                  <mat-panel-description>Pulsa para expandir / contraer</mat-panel-description>
                </mat-expansion-panel-header>
                <app-patient-record [fichaCompleta]="fichaCompleta"></app-patient-record>
              </mat-expansion-panel>

              <!-- Asistente IA: oculto para recepcionista -->
              <mat-expansion-panel expanded *ngIf="!isRecepcionista">
                <mat-expansion-panel-header>
                  <mat-panel-title>
                    <mat-icon class="panel-icon">smart_toy</mat-icon>
                    Asistente IA
                  </mat-panel-title>
                  <mat-panel-description>Pulsa para expandir / contraer</mat-panel-description>
                </mat-expansion-panel-header>
                <app-chat [pacienteId]="pacienteId"></app-chat>
              </mat-expansion-panel>

              <!-- Mensaje para recepcionista -->
              <div *ngIf="isRecepcionista" class="acceso-limitado">
                <mat-icon>lock</mat-icon>
                <p>Tu rol de <strong>Recepcionista</strong> solo permite ver datos de contacto del paciente.</p>
              </div>

            </mat-accordion>

          </section>
        </div>

        <!-- Vista dashboard -->
        <app-dashboard *ngIf="vistaActual === 'dashboard'"></app-dashboard>

        <!-- Vista gestión de pacientes -->
        <app-patient-management
          *ngIf="vistaActual === 'gestion'"
          (cerrar)="setVista('principal')">
        </app-patient-management>

        <!-- Vista agenda de citas -->
        <app-agenda *ngIf="vistaActual === 'agenda'"></app-agenda>

        <!-- Vista gestión de usuarios (solo admin) -->
        <app-user-management *ngIf="vistaActual === 'usuarios' && isAdmin">
        </app-user-management>

      </main>
    </div>
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  fichaCompleta?: any;
  pacienteId: number | null = null;
  name = '';
  clinicName = '';
  role = '';
  vistaActual: 'dashboard' | 'principal' | 'gestion' | 'agenda' | 'usuarios' = 'dashboard';

  private auth   = inject(AuthService);
  private router = inject(Router);
  private cdr    = inject(ChangeDetectorRef);

  constructor(private api: ApiService) {}

  get isAdmin():         boolean { return this.auth.isAdmin(); }
  get isRecepcionista(): boolean { return this.auth.isRecepcionista(); }
  get rolLabel():        string  { return ROL_LABEL[this.role] ?? this.role; }

  ngOnInit(): void {
    this.name      = this.auth.getNombre()       || '';
    this.clinicName = this.auth.getClinicaNombre() || '';
    this.role       = this.auth.getRol();
  }

  setVista(vista: 'dashboard' | 'principal' | 'gestion' | 'agenda' | 'usuarios'): void {
    this.vistaActual = vista;
  }

  onPacienteSeleccionado(id: number): void {
    this.pacienteId = id;
    this.cdr.detectChanges();
    this.api.obtenerPaciente(id).subscribe((data: any) => {
      this.fichaCompleta = data;
      this.name = this.auth.getNombre() || this.name;
      this.cdr.detectChanges();
    });
  }

  logout(): void {
    this.auth.logout();
    this.name = '';
    this.router.navigate(['/login']);
  }

  // Alias para compatibilidad con el evento (cerrar) del componente de gestión
  toggleGestionar(show: boolean): void {
    this.vistaActual = show ? 'gestion' : 'dashboard';
  }
}
