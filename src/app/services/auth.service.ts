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
          localStorage.setItem('token',       res.token);
          localStorage.setItem('name',        res.name);
          localStorage.setItem('clinic_id',   String(res.clinic_id ?? ''));
          localStorage.setItem('clinic_name', res.clinic_name ?? '');
          localStorage.setItem('role',        res.role ?? 'physiotherapist');
        }
      }));
  }

  registrarClinica(datos: {
    clinic_name: string; email: string;
    password: string; admin_name: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/register-clinic`, datos)
      .pipe(tap(res => {
        if (this.isBrowser()) {
          localStorage.setItem('token',       res.token);
          localStorage.setItem('name',        res.name);
          localStorage.setItem('clinic_id',   String(res.clinic_id ?? ''));
          localStorage.setItem('clinic_name', res.clinic_name ?? '');
          localStorage.setItem('role',        res.role ?? 'clinic_admin');
        }
      }));
  }

  logout(): void {
    if (this.isBrowser()) {
      localStorage.removeItem('token');
      localStorage.removeItem('name');
      localStorage.removeItem('clinic_id');
      localStorage.removeItem('clinic_name');
      localStorage.removeItem('role');
    }
  }

  getToken():        string | null { return this.isBrowser() ? localStorage.getItem('token')       : null; }
  isLoggedIn():      boolean       { return !!this.getToken(); }
  getNombre():       string | null { return this.isBrowser() ? localStorage.getItem('name')        : null; }
  getClinicaNombre():string | null { return this.isBrowser() ? localStorage.getItem('clinic_name') : null; }
  getRol():          string        { return (this.isBrowser() ? localStorage.getItem('role') : null) ?? 'physiotherapist'; }
  isAdmin():         boolean       { return this.getRol() === 'clinic_admin'; }
  isRecepcionista(): boolean       { return this.getRol() === 'receptionist'; }

  getClinicaId(): number | null {
    const v = this.isBrowser() ? localStorage.getItem('clinic_id') : null;
    return v ? Number(v) : null;
  }
}
