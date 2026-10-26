import { Report, User, UserRole } from '../types';

const API_BASE = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('crs_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const apiService = {
  // Auth
  async login(credentials: any): Promise<{ token: string, user: User }> {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!res.ok) throw new Error('Login failed');
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('crs_token', data.token);
    }
    return data;
  },

  logout() {
    localStorage.removeItem('crs_token');
  },

  // Reports
  async getReports(): Promise<Report[]> {
    const res = await fetch(`${API_BASE}/reports`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch reports');
    return res.json();
  },

  async getReportByTrackingId(trackingId: string): Promise<Report> {
    const res = await fetch(`${API_BASE}/reports/${trackingId}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Report not found');
    return res.json();
  },

  async createReport(reportData: any): Promise<Report> {
    const res = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData),
    });
    if (!res.ok) throw new Error('Failed to create report');
    return res.json();
  },

  async updateReportStatus(trackingId: string, status: string): Promise<void> {
    const res = await fetch(`${API_BASE}/reports/${trackingId}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update status');
  },

  // Stats
  async getStats(): Promise<any> {
    const res = await fetch(`${API_BASE}/stats`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  },

  // Configuration Items
  async getCategories(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },
  async addCategory(data: any): Promise<void> {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to add category');
  },

  async getIndustries(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/industries`);
    if (!res.ok) throw new Error('Failed to fetch industries');
    return res.json();
  },
  async addIndustry(data: any): Promise<void> {
    const res = await fetch(`${API_BASE}/industries`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to add industry');
  },

  async getDepartments(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/departments`);
    if (!res.ok) throw new Error('Failed to fetch departments');
    return res.json();
  },
  async addDepartment(data: any): Promise<void> {
    const res = await fetch(`${API_BASE}/departments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to add department');
  }
};
