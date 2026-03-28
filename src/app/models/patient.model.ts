export interface Paciente {
  id?: number;
  name: string;
  last_name: string;
  birth_date: string;
  phone: string;
  email: string;
  registration_date?: string;
}

export interface Sesion {
  id?: number;
  patient_id: number;
  date: string;
  session_notes: string;
  prescribed_exercises: string;
  progress: string;
  file_name?: string;
}

export interface Ficha {
  id?: number;
  patient_id: number;
  diagnosis_text: string;
  pathology: string;
  medication: string;
  contraindications: string;
  observations: string;
}

export interface FichaCompleta {
  patient: Paciente;
  clinical_record: Ficha;
  sessions: Sesion[];
}
