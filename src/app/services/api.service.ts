import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Paciente, FichaCompleta, Sesion } from '../models/paciente.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  buscarPacientes(nombre: string): Observable<Paciente[]> {
    return this.http.get<Paciente[]>(`${this.baseUrl}/pacientes`, { params: { nombre } });
  }

  obtenerPaciente(id: number): Observable<FichaCompleta> {
    return this.http.get<FichaCompleta>(`${this.baseUrl}/paciente/${id}`);
  }

  crearPaciente(datos: Paciente): Observable<Paciente> {
    return this.http.post<Paciente>(`${this.baseUrl}/paciente`, datos);
  }

  añadirSesion(pacienteId: number, datos: Sesion): Observable<Sesion> {
    return this.http.post<Sesion>(`${this.baseUrl}/sesion`, { ...datos, paciente_id: pacienteId });
  }

  enviarMensaje(pacienteId: number, mensaje: string): Observable<{respuesta: string}> {
    return this.http.post<{respuesta: string}>(`${this.baseUrl}/chat`, { paciente_id: pacienteId, mensaje });
  }

  crearFicha(ficha: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/ficha`, ficha);
  }

  actualizarPaciente(id: number, datos: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/paciente/${id}`, datos);
  }

  eliminarPaciente(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/paciente/${id}`);
  }

  actualizarFicha(paciente_id: number, datos: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/ficha/${paciente_id}`, datos);
  }

  añadirDiagnostico(paciente_id: number, datos: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/diagnostico`, { ...datos, paciente_id });
  }

  obtenerDiagnosticos(paciente_id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/diagnosticos/${paciente_id}`);
  }

  actualizarDiagnostico(id: number, datos: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/diagnostico/${id}`, datos);
  }

  getDashboard(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/dashboard`);
  }

  subirArchivoSesion(sesionId: number, archivo: File): Observable<any> {
    const form = new FormData();
    form.append('archivo', archivo);
    return this.http.post<any>(`${this.baseUrl}/sesion/${sesionId}/archivo`, form);
  }

  getArchivoSesionUrl(sesionId: number): string {
    return `${this.baseUrl}/sesion/${sesionId}/archivo`;
  }
}
