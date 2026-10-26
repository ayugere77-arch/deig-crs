import { Report, User, UserRole } from '../types';
import { CATEGORIES, INDUSTRIES, DEPARTMENTS } from '../constants';

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
    try {
      const res = await fetch(`${API_BASE}/reports`, {
        headers: getHeaders()
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Could not fetch reports from server');
    }
    return [];
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
    try {
      const res = await fetch(`${API_BASE}/stats`, {
        headers: getHeaders()
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Could not fetch stats from server');
    }
    return { total: 0, pending: 0, investigating: 0, resolved: 0, trends: [], byCategory: [], byLocation: [] };
  },

  // Configuration Items with automatic fallback to constants
  async getCategories(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/categories`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch (e) {
      console.warn('Using local fallback for categories');
    }
    return CATEGORIES.map((name, i) => ({ id: i + 1, name }));
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
    try {
      const res = await fetch(`${API_BASE}/industries`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch (e) {
      console.warn('Using local fallback for industries');
    }
    return INDUSTRIES.map((name, i) => ({ id: i + 1, name }));
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
    try {
      const res = await fetch(`${API_BASE}/departments`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch (e) {
      console.warn('Using local fallback for departments');
    }
    return DEPARTMENTS.map((name, i) => ({ id: i + 1, name }));
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
