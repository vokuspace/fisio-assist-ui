export interface Paciente {
  id?: number;
  nombre: string;
  apellidos: string;
  fecha_nacimiento: string;
  telefono: string;
  email: string;
  fecha_alta?: string;
}

export interface Sesion {
  id?: number;
  paciente_id: number;
  fecha: string;
  notas_sesion: string;
  ejercicios_prescritos: string;
  evolucion: string;
  archivo_nombre?: string;
}

export interface Ficha {
  id?: number;
  paciente_id: number;
  diagnostico: string;
  patologia: string;
  medicacion: string;
  contraindicaciones: string;
  observaciones: string;
}

export interface FichaCompleta {
  paciente: Paciente;
  ficha: Ficha;
  sesiones: Sesion[];
}