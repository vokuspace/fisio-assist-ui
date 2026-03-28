import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Paciente, FichaCompleta, Sesion } from '../models/patient.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  buscarPacientes(name: string): Observable<Paciente[]> {
    return this.http.get<Paciente[]>(`${this.baseUrl}/patients`, { params: { name } });
  }

  obtenerPaciente(id: number): Observable<FichaCompleta> {
    return this.http.get<FichaCompleta>(`${this.baseUrl}/patient/${id}`);
  }

  crearPaciente(datos: Paciente): Observable<Paciente> {
    return this.http.post<Paciente>(`${this.baseUrl}/patient`, datos);
  }

  añadirSesion(patientId: number, datos: Sesion): Observable<Sesion> {
    return this.http.post<Sesion>(`${this.baseUrl}/session`, { ...datos, patient_id: patientId });
  }

  enviarMensaje(patientId: number, message: string): Observable<{response: string}> {
    return this.http.post<{response: string}>(`${this.baseUrl}/chat`, { patient_id: patientId, message });
  }

  crearFicha(ficha: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/clinical-record`, ficha);
  }

  actualizarPaciente(id: number, datos: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/patient/${id}`, datos);
  }

  eliminarPaciente(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/patient/${id}`);
  }

  actualizarFicha(patient_id: number, datos: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/clinical-record/${patient_id}`, datos);
  }

  añadirDiagnostico(patient_id: number, datos: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/diagnosis`, { ...datos, patient_id });
  }

  obtenerDiagnosticos(patient_id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/diagnoses/${patient_id}`);
  }

  actualizarDiagnostico(id: number, datos: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/diagnosis/${id}`, datos);
  }

  getDashboard(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/dashboard`);
  }

  subirArchivoSesion(sessionId: number, archivo: File): Observable<any> {
    const form = new FormData();
    form.append('file', archivo);
    return this.http.post<any>(`${this.baseUrl}/session/${sessionId}/file`, form);
  }

  getArchivoSesionUrl(sessionId: number): string {
    return `${this.baseUrl}/session/${sessionId}/file`;
  }
}
