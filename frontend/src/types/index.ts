// Types pour l'authentification
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'doctor' | 'patient' | 'nurse' | 'billing';
  firstName: string;
  lastName: string;
  createdAt?: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'patient' | 'doctor' | 'nurse';
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Types pour les patients
export interface Patient {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  bloodType?: string;
  allergies?: string;
  chronicDiseases?: string;
  currentMedications?: string;
  medicalHistory?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
  createdAt?: string;
}

// Types pour les rendez-vous
export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  patientName?: string;
  doctorName?: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  type: 'consultation' | 'follow-up' | 'emergency' | 'check-up' | 'surgery';
  reason: string;
  notes?: string;
  createdAt?: string;
}

// Types pour les factures
export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  code?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  appointmentId?: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  taxRate: number;
  discount: number;
  total: number;
  paidAmount: number;
  balance: number;
  status: 'draft' | 'issued' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled';
  createdAt?: string;
}

export interface Payment {
  id: string;
  paymentNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  method: 'cash' | 'card' | 'insurance' | 'bank_transfer' | 'check' | 'online';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentDate: string;
}

// Types pour les statistiques
export interface DashboardStats {
  totalPatients: number;
  totalAppointments: number;
  totalInvoices: number;
  totalRevenue: number;
  upcomingAppointments: number;
  overdueInvoices: number;
}