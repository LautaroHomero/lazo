export type Locale = 'en' | 'es';

export interface DocumentInfo {
  id: string;
  file_name: string;
  storage_path: string;
  uploaded_at: string;
}

export interface AuditEvent {
  id: string;
  from_status: string;
  to_status: string;
  created_at: string;
}

export interface Obligation {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  due_date: string;
  owner: string;
  requires_document: boolean;
  company_tax_id: string;
  version: number;
  is_overdue: boolean;
  available_transitions: string[];
  can_submit: boolean;
  document: DocumentInfo | null;
  audit_events: AuditEvent[];
}

export interface DashboardPayload {
  [status: string]: Obligation[];
}
const API_URL =
  typeof window === 'undefined'
    ? process.env.API_URL || 'http://backend:8000/api'
    : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Request failed');
  }

  return response.json() as Promise<T>;
}

export async function getDashboard(): Promise<DashboardPayload> {
  return request<DashboardPayload>('/dashboard');
}

export async function getObligations(): Promise<Obligation[]> {
  return request<Obligation[]>('/obligations');
}

export async function getObligation(id: string): Promise<Obligation> {
  return request<Obligation>(`/obligations/${id}`);
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-CA');
}
