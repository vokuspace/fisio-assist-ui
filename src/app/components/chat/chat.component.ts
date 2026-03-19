import { Component, Input, OnInit, OnChanges, SimpleChanges, ViewChild, ElementRef, inject, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ApiService } from '../../services/api.service';

// models imports not strictly needed here

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatProgressBarModule],
  template: `
  <mat-card class="chat-card">
    <mat-card-header>
      <mat-card-title>Chat con agente</mat-card-title>
    </mat-card-header>
    <mat-card-content class="messages" #scroll>
      <div *ngIf="!pacienteId" class="placeholder">Selecciona un paciente para chatear con el agente</div>
      <div *ngFor="let m of messages" class="message" [ngClass]="{ 'fisio': m.rol === 'fisio', 'agente': m.rol === 'agente' }">
        <div class="bubble" [innerHTML]="m.rol==='agente' ? formatMarkdown(m.texto) : m.texto"></div>
        <div class="meta">{{ m.hora }} • {{ m.rol }}</div>
      </div>
    <mat-progress-bar *ngIf="loading" mode="indeterminate"></mat-progress-bar>
    </mat-card-content>
    <mat-card-actions class="input-area">
      <form [formGroup]="form" (ngSubmit)="send()" class="inline-form" *ngIf="pacienteId">
        <mat-form-field appearance="fill" class="input-field">
          <input matInput placeholder="Escribe un mensaje" formControlName="texto">
        </mat-form-field>
        <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">Enviar</button>
      </form>
    </mat-card-actions>
  </mat-card>
  `,
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnChanges {
  @Input() pacienteId: number | null = null;
  messages: { texto: string; hora: string; rol: 'fisio' | 'agente' }[] = [];
  form = new FormGroup({ texto: new FormControl('') });
  loading = false;
  @ViewChild('scroll') private scroll?: ElementRef;
  private cdr = inject(ChangeDetectorRef);

  constructor(
  private api: ApiService = inject(ApiService),
  private sanitizer: DomSanitizer = inject(DomSanitizer)
) {}

formatMarkdown(text: string): SafeHtml {
  if (!text) return '' as any;

  let html = text
    .replace(/^#{1,3}\s*(.*?)$/gm, '<h4 style="margin:6px 0;font-size:14px;font-weight:600">$1</h4>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^\|.*\|$/gm, '')
    .replace(/^---+$/gm, '<hr style="border:none;border-top:1px solid #d4e6c3;margin:8px 0">')
    .replace(/^[\*\-]\s*[-–]\s*/gm, '• ')
    .replace(/^\*\s+/gm, '• ')
    .replace(/^(\d+)\.\s+/gm, '<strong>$1.</strong> ');

  const lines = html.split('\n');
  let out = '';
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      out += '<div style="height:6px"></div>';
    } else if (trimmed.startsWith('•')) {
      out += `<div style="padding:2px 0 2px 8px">${trimmed}</div>`;
    } else if (trimmed.startsWith('<h4')) {
      out += `<div style="margin-top:10px">${trimmed}</div>`;
    } else if (trimmed.startsWith('<hr')) {
      out += trimmed;
    } else {
      out += `<div style="padding:1px 0">${trimmed}</div>`;
    }
  }

  return this.sanitizer.bypassSecurityTrustHtml(out);
}

  ngOnInit(): void {
    // nothing
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pacienteId'] && this.pacienteId == null) {
      this.clear();
    }
    if (changes['pacienteId'] && this.pacienteId != null) {
      this.resetHistoryAndSeed();
    }
  }

  private resetHistoryAndSeed(): void {
    this.clear();
    // mensaje inicial del agente al seleccionar paciente
    this.addAgentMessage('Ficha cargada. ¿En qué puedo ayudarte con este paciente?');
    this.cdr.detectChanges();
  }

  private clear(): void {
    this.messages = [];
    this.form.reset();
    this.loading = false;
  }

  private addAgentMessage(text: string): void {
    const now = new Date();
    const hora = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.messages.push({ texto: text, hora, rol: 'agente' });
    this.scrollToBottom();
  }

  send(): void {
    if (!this.pacienteId) return;
    const texto = this.form.value.texto?.trim();
    if (!texto) return;
    const now = new Date();
    const hora = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.messages.push({ texto: texto, hora, rol: 'fisio' });
    this.form.reset();
    this.loading = true;
    this.api.enviarMensaje(this.pacienteId, texto).subscribe(res => {
      this.loading = false;
      const respuesta = res.respuesta;
      const hora2 = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      this.messages.push({ texto: respuesta, hora: hora2, rol: 'agente' });
      this.scrollToBottom();
      this.cdr.detectChanges();
    }, () => this.loading = false);
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.scroll && this.scroll.nativeElement) {
        this.scroll.nativeElement.scrollTop = this.scroll.nativeElement.scrollHeight;
      }
    }, 100);
  }

  
}
