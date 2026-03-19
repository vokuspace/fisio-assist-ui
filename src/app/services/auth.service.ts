import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = environment.apiUrl;
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  private isBrowser(): boolean { return isPlatformBrowser(this.platformId); }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/login`, { email, password })
      .pipe(tap(res => {
        if (this.isBrowser()) {
          localStorage.setItem('token',          res.token);
          localStorage.setItem('nombre',         res.nombre);
          localStorage.setItem('clinica_id',     String(res.clinica_id ?? ''));
          localStorage.setItem('clinica_nombre', res.clinica_nombre ?? '');
          localStorage.setItem('rol',            res.rol ?? 'fisioterapeuta');
        }
      }));
  }

  registrarClinica(datos: {
    nombre_clinica: string; email: string;
    password: string; nombre_admin: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/registro-clinica`, datos)
      .pipe(tap(res => {
        if (this.isBrowser()) {
          localStorage.setItem('token',          res.token);
          localStorage.setItem('nombre',         res.nombre);
          localStorage.setItem('clinica_id',     String(res.clinica_id ?? ''));
          localStorage.setItem('clinica_nombre', res.clinica_nombre ?? '');
          localStorage.setItem('rol',            res.rol ?? 'admin_clinica');
        }
      }));
  }

  logout(): void {
    if (this.isBrowser()) {
      localStorage.removeItem('token');
      localStorage.removeItem('nombre');
      localStorage.removeItem('clinica_id');
      localStorage.removeItem('clinica_nombre');
      localStorage.removeItem('rol');
    }
  }

  getToken():         string | null { return this.isBrowser() ? localStorage.getItem('token')          : null; }
  isLoggedIn():       boolean       { return !!this.getToken(); }
  getNombre():        string | null { return this.isBrowser() ? localStorage.getItem('nombre')         : null; }
  getClinicaNombre(): string | null { return this.isBrowser() ? localStorage.getItem('clinica_nombre') : null; }
  getRol():           string        { return (this.isBrowser() ? localStorage.getItem('rol') : null) ?? 'fisioterapeuta'; }
  isAdmin():          boolean       { return this.getRol() === 'admin_clinica'; }
  isRecepcionista():  boolean       { return this.getRol() === 'recepcionista'; }

  getClinicaId(): number | null {
    const v = this.isBrowser() ? localStorage.getItem('clinica_id') : null;
    return v ? Number(v) : null;
  }
}
