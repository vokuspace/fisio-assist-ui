import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';

// ─── Dialog: Política de Privacidad ───────────────────────────────────────────

@Component({
  selector: 'app-politica-privacidad-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title class="dialog-title">
      <span>Política de Privacidad</span>
    </h2>
    <mat-dialog-content class="policy-content">

      <p class="ultima-actualizacion">Última actualización: marzo 2025</p>

      <h3>1. Responsable del tratamiento</h3>
      <p>
        El responsable del tratamiento de los datos personales es el profesional o entidad que
        contrata el servicio <strong>FisioIA</strong> (en adelante, "la Clínica"). FisioIA actúa
        como encargado del tratamiento, procesando los datos únicamente según las instrucciones
        de la Clínica y conforme a lo establecido en el contrato de encargo de tratamiento.
      </p>

      <h3>2. Datos que se tratan</h3>
      <p>A través de FisioIA se tratan las siguientes categorías de datos:</p>
      <ul>
        <li><strong>Datos identificativos:</strong> nombre, apellidos, fecha de nacimiento, teléfono, correo electrónico.</li>
        <li><strong>Datos de salud (categoría especial):</strong> diagnóstico, patología, medicación, contraindicaciones, notas de sesiones y evolución clínica.</li>
        <li><strong>Datos de acceso:</strong> correo electrónico y contraseña (cifrada) del profesional.</li>
      </ul>

      <h3>3. Finalidad y base jurídica</h3>
      <p>Los datos se tratan con las siguientes finalidades:</p>
      <ul>
        <li>
          <strong>Gestión clínica del paciente</strong> — Registro de fichas, sesiones y evolución del tratamiento fisioterapéutico.
          Base jurídica: <em>Art. 9.2.h RGPD</em> — tratamiento necesario para fines de medicina preventiva o del trabajo,
          diagnóstico médico, prestación de asistencia sanitaria o tratamientos de tipo sanitario.
        </li>
        <li>
          <strong>Asistencia con IA</strong> — Los datos del paciente se incluyen en el contexto de las consultas
          al asistente de inteligencia artificial para obtener apoyo clínico. El modelo de IA no almacena
          ni entrena con los datos facilitados.
          Base jurídica: <em>Art. 6.1.a RGPD</em> — consentimiento del interesado.
        </li>
        <li>
          <strong>Autenticación del profesional</strong> — Gestión del acceso seguro a la plataforma.
          Base jurídica: <em>Art. 6.1.b RGPD</em> — ejecución de un contrato.
        </li>
      </ul>

      <h3>4. Conservación de los datos</h3>
      <p>
        Los datos clínicos se conservarán durante el tiempo necesario para la relación asistencial y,
        posteriormente, durante los plazos establecidos por la legislación sanitaria aplicable
        (mínimo 5 años desde el alta, conforme a la Ley 41/2002, de autonomía del paciente).
        Los datos del profesional se conservarán mientras dure la suscripción al servicio.
      </p>

      <h3>5. Destinatarios</h3>
      <p>
        Los datos no se cederán a terceros salvo obligación legal. FisioIA puede utilizar
        proveedores de infraestructura cloud (procesadores) que cumplen con el RGPD y
        con los que se han firmado los contratos de encargo de tratamiento correspondientes.
      </p>

      <h3>6. Transferencias internacionales</h3>
      <p>
        El modelo de inteligencia artificial utilizado (Anthropic Claude) puede implicar
        transferencias de datos a servidores ubicados fuera del Espacio Económico Europeo.
        Dichas transferencias se realizan con las garantías adecuadas conforme al Art. 46 RGPD
        (cláusulas contractuales tipo). Los datos enviados al modelo se limitan al contexto
        clínico necesario para cada consulta y no se utilizan para entrenamiento.
      </p>

      <h3>7. Derechos de los interesados</h3>
      <p>El paciente y el profesional pueden ejercer los siguientes derechos:</p>
      <ul>
        <li><strong>Acceso</strong> — Conocer qué datos se tratan.</li>
        <li><strong>Rectificación</strong> — Corregir datos inexactos o incompletos.</li>
        <li><strong>Supresión</strong> — Solicitar el borrado cuando ya no sean necesarios.</li>
        <li><strong>Oposición</strong> — Oponerse al tratamiento en determinadas circunstancias.</li>
        <li><strong>Portabilidad</strong> — Recibir los datos en formato estructurado.</li>
        <li><strong>Limitación</strong> — Solicitar la restricción del tratamiento.</li>
      </ul>
      <p>
        Para ejercer estos derechos, el paciente debe dirigirse a su fisioterapeuta.
        El profesional puede ejercer sus derechos contactando con FisioIA.
        Asimismo, tiene derecho a presentar una reclamación ante la
        <strong>Agencia Española de Protección de Datos (AEPD)</strong> en <em>www.aepd.es</em>.
      </p>

      <h3>8. Medidas de seguridad</h3>
      <p>
        FisioIA aplica medidas técnicas y organizativas apropiadas para garantizar la seguridad
        de los datos: cifrado de contraseñas, autenticación mediante tokens JWT, comunicaciones
        cifradas mediante HTTPS y control de acceso basado en roles.
      </p>

    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-flat-button color="primary" mat-dialog-close>Entendido</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-title { color: #1b5e20; display: flex; align-items: center; gap: 8px; }
    .policy-content {
      max-height: 62vh;
      overflow-y: auto;
      font-size: 14px;
      line-height: 1.75;
      color: #333;
      padding-right: 8px;
    }
    .ultima-actualizacion { font-size: 12px; color: #888; margin-bottom: 20px; }
    h3 { color: #2e7d32; font-size: 14px; font-weight: 600; margin: 20px 0 6px; }
    ul { padding-left: 20px; margin: 6px 0; }
    li { margin-bottom: 4px; }
  `]
})
export class PoliticaPrivacidadDialogComponent {}


// ─── Dialog: Aviso Legal ──────────────────────────────────────────────────────

@Component({
  selector: 'app-aviso-legal-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title class="dialog-title">Aviso Legal</h2>
    <mat-dialog-content class="policy-content">

      <p class="ultima-actualizacion">Última actualización: marzo 2025</p>

      <h3>1. Identificación del titular</h3>
      <p>
        <strong>FisioIA</strong> es una plataforma de software para la gestión clínica de
        fisioterapeutas, desarrollada y comercializada como servicio SaaS (Software as a Service).
        El titular del servicio es el profesional o entidad que contrata la licencia de uso.
      </p>

      <h3>2. Objeto y condiciones de uso</h3>
      <p>
        FisioIA está diseñado exclusivamente para uso profesional por parte de fisioterapeutas
        colegiados o entidades sanitarias autorizadas. El acceso y uso de la plataforma implica
        la aceptación de las presentes condiciones.
      </p>
      <p>
        Queda prohibido el uso de la plataforma para fines distintos a la gestión clínica,
        así como la cesión de credenciales a terceros no autorizados.
      </p>

      <h3>3. Responsabilidad del profesional</h3>
      <p>
        El profesional que utiliza FisioIA es el responsable del tratamiento de los datos de
        sus pacientes conforme al RGPD y la LOPD-GDD. FisioIA actúa como encargado del
        tratamiento y no asume responsabilidad por el uso inadecuado de la plataforma ni
        por decisiones clínicas adoptadas basándose en las sugerencias del asistente IA.
      </p>

      <h3>4. Limitaciones del asistente IA</h3>
      <p>
        El asistente de inteligencia artificial de FisioIA es una herramienta de apoyo clínico.
        <strong>No sustituye al criterio profesional del fisioterapeuta</strong>. Las sugerencias,
        ejercicios o informaciones proporcionadas por el asistente deben ser evaluadas y
        validadas por el profesional antes de su aplicación.
      </p>

      <h3>5. Propiedad intelectual</h3>
      <p>
        El software, diseño, interfaces y contenidos de FisioIA están protegidos por la
        legislación de propiedad intelectual. Queda prohibida su reproducción, distribución
        o modificación sin autorización expresa del titular.
      </p>

      <h3>6. Modificaciones</h3>
      <p>
        FisioIA se reserva el derecho a modificar este aviso legal en cualquier momento.
        Los cambios serán comunicados a los usuarios registrados con un mínimo de 15 días
        de antelación.
      </p>

    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-flat-button color="primary" mat-dialog-close>Entendido</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-title { color: #1b5e20; }
    .policy-content {
      max-height: 62vh;
      overflow-y: auto;
      font-size: 14px;
      line-height: 1.75;
      color: #333;
      padding-right: 8px;
    }
    .ultima-actualizacion { font-size: 12px; color: #888; margin-bottom: 20px; }
    h3 { color: #2e7d32; font-size: 14px; font-weight: 600; margin: 20px 0 6px; }
  `]
})
export class AvisoLegalDialogComponent {}


// ─── Banner de consentimiento RGPD ────────────────────────────────────────────

@Component({
  selector: 'app-gdpr-banner',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatDialogModule],
  template: `
    <div class="gdpr-banner" *ngIf="visible">
      <div class="banner-body">
        <mat-icon class="banner-icon">shield</mat-icon>
        <div class="banner-text">
          <strong>Uso de datos clínicos</strong>
          <span>
            Esta aplicación trata datos de salud de carácter especial conforme al
            <strong>RGPD (Art. 9.2.h)</strong> y la <strong>LOPD-GDD</strong>.
            Al usar FisioIA confirmas que cuentas con la habilitación profesional necesaria
            y que tus pacientes han otorgado su consentimiento.
          </span>
        </div>
      </div>
      <div class="banner-actions">
        <button mat-button class="btn-policy" (click)="verPolitica()">Política de privacidad</button>
        <button mat-flat-button class="btn-accept" (click)="aceptar()">
          <mat-icon>check</mat-icon> Acepto
        </button>
      </div>
    </div>
  `,
  styles: [`
    .gdpr-banner {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      background: #1b3a1e;
      color: white;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 14px 24px;
      box-shadow: 0 -2px 12px rgba(0,0,0,0.25);
      flex-wrap: wrap;
    }

    .banner-body {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      flex: 1;
      min-width: 0;
    }

    .banner-icon {
      color: #a5d6a7;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .banner-text {
      display: flex;
      flex-direction: column;
      gap: 3px;
      font-size: 13px;
      line-height: 1.5;
      opacity: 0.92;
    }

    .banner-text strong {
      font-size: 14px;
      opacity: 1;
    }

    .banner-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }

    .btn-policy {
      color: #a5d6a7 !important;
      font-size: 13px;
      text-decoration: underline;
    }

    .btn-accept {
      background: #2e7d32 !important;
      color: white !important;
      border-radius: 8px !important;
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .btn-accept mat-icon {
      font-size: 16px !important;
      width: 16px !important;
      height: 16px !important;
    }

    @media (max-width: 600px) {
      .gdpr-banner { flex-direction: column; align-items: flex-start; }
    }
  `]
})
export class RgpdBannerComponent {
  visible = false;
  private dialog = inject(MatDialog);

  constructor() {
    this.visible = localStorage.getItem('gdpr_accepted') !== '1';
  }

  aceptar(): void {
    localStorage.setItem('gdpr_accepted', '1');
    this.visible = false;
  }

  verPolitica(): void {
    this.dialog.open(PoliticaPrivacidadDialogComponent, { width: '680px', maxWidth: '95vw' });
  }
}
