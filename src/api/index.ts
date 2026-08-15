import { apiClient } from './client';
import type { Area, Customer, Loan, Payment, Installment, DashboardStats, AreaDashboardStats, BackupItem, ExcelImportPreview } from '../types';

export const authApi = {
  login: async (username: string, password: string) => {
    const res = await apiClient.post('/auth/login', { username, password });
    return res.data;
  },
  getMe: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },
  getUsers: async () => {
    const res = await apiClient.get('/auth/users');
    return res.data;
  },
  createUser: async (user: any) => {
    const res = await apiClient.post('/auth/users', user);
    return res.data;
  }
};

export const areaApi = {
  getAreas: async (): Promise<Area[]> => {
    const res = await apiClient.get('/areas');
    return res.data;
  },
  createArea: async (area: { area_name: string; district?: string; pincode?: string }): Promise<Area> => {
    const res = await apiClient.post('/areas', area);
    return res.data;
  },
  updateArea: async (areaId: string, area: Partial<Area>): Promise<Area> => {
    const res = await apiClient.put(`/areas/${areaId}`, area);
    return res.data;
  },
  deleteArea: async (areaId: string) => {
    const res = await apiClient.delete(`/areas/${areaId}`);
    return res.data;
  }
};

export const customerApi = {
  getCustomers: async (params?: { area_id?: string; search?: string }): Promise<Customer[]> => {
    const res = await apiClient.get('/customers', { params });
    return res.data;
  },
  getCustomer: async (customerId: string): Promise<Customer> => {
    const res = await apiClient.get(`/customers/${customerId}`);
    return res.data;
  },
  createCustomer: async (customer: any): Promise<Customer> => {
    const res = await apiClient.post('/customers', customer);
    return res.data;
  },
  updateCustomer: async (customerId: string, customer: any): Promise<Customer> => {
    const res = await apiClient.put(`/customers/${customerId}`, customer);
    return res.data;
  },
  deleteCustomer: async (customerId: string) => {
    const res = await apiClient.delete(`/customers/${customerId}`);
    return res.data;
  }
};

export const loanApi = {
  calculateLoan: async (params: { loan_amount: number; interest_percentage: number; emi_type: string; number_of_installments: number; first_due_date: string }) => {
    const res = await apiClient.post('/loans/calculate', params);
    return res.data;
  },
  getLoans: async (params?: { area_id?: string; customer_id?: string; status?: string }): Promise<Loan[]> => {
    const res = await apiClient.get('/loans', { params });
    return res.data;
  },
  getLoan: async (loanId: string): Promise<Loan> => {
    const res = await apiClient.get(`/loans/${loanId}`);
    return res.data;
  },
  createLoan: async (loan: any): Promise<Loan> => {
    const res = await apiClient.post('/loans', loan);
    return res.data;
  }
};

export const paymentApi = {
  getPayments: async (params?: { area_id?: string; customer_id?: string; loan_id?: string; date_from?: string; date_to?: string }): Promise<Payment[]> => {
    const res = await apiClient.get('/payments', { params });
    return res.data;
  },
  recordPayment: async (payment: { loan_id: string; installment_id?: string; amount_paid: number; payment_method?: string; remarks?: string }): Promise<Payment> => {
    const res = await apiClient.post('/payments', payment);
    return res.data;
  }
};

export const installmentApi = {
  getInstallments: async (params?: { area_id?: string; loan_id?: string; customer_id?: string; status?: string; date?: string }): Promise<Installment[]> => {
    const res = await apiClient.get('/installments', { params });
    return res.data;
  },
  getTodayDue: async (area_id?: string): Promise<Installment[]> => {
    const res = await apiClient.get('/installments/today', { params: { area_id } });
    return res.data;
  }
};

export const dashboardApi = {
  getDashboard: async (area_id?: string): Promise<DashboardStats> => {
    const res = await apiClient.get('/dashboard', { params: { area_id } });
    return res.data;
  },
  getAreaDashboard: async (areaId: string): Promise<AreaDashboardStats> => {
    const res = await apiClient.get(`/dashboard/area/${areaId}`);
    return res.data;
  }
};

export const reportApi = {
  getDailyReport: async (area_id?: string, date?: string) => {
    const res = await apiClient.get('/reports/daily', { params: { area_id, date } });
    return res.data;
  },
  getWeeklyReport: async (area_id?: string) => {
    const res = await apiClient.get('/reports/weekly', { params: { area_id } });
    return res.data;
  },
  getMonthlyReport: async (area_id?: string, month?: string) => {
    const res = await apiClient.get('/reports/monthly', { params: { area_id, month } });
    return res.data;
  },
  getAreaReport: async (area_id?: string) => {
    const res = await apiClient.get('/reports/area', { params: { area_id } });
    return res.data;
  }
};

export const pdfApi = {
  downloadReceipt: (receiptNumber: string) => {
    const baseURL = apiClient.defaults.baseURL;
    const token = localStorage.getItem('loan_auth_token');
    window.open(`${baseURL}/pdf/receipt/${receiptNumber}?token=${token}`, '_blank');
  },
  downloadReport: (reportType: string, areaId?: string) => {
    const baseURL = apiClient.defaults.baseURL;
    window.open(`${baseURL}/pdf/report?report_type=${reportType}&area_id=${areaId || ''}`, '_blank');
  }
};

export const emailApi = {
  sendReport: async (report_type: string, area_id?: string, recipient_email?: string) => {
    const res = await apiClient.post('/email/report', { report_type, area_id, recipient_email });
    return res.data;
  },
  sendExcelBackup: async () => {
    const res = await apiClient.post('/email/excel-backup');
    return res.data;
  }
};

export const excelApi = {
  previewImport: async (file: File): Promise<ExcelImportPreview> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post('/import/excel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  commitImport: async (previewData: any) => {
    const res = await apiClient.post('/import/excel/commit', previewData);
    return res.data;
  },
  exportCustomers: (area_id?: string) => {
    const baseURL = apiClient.defaults.baseURL;
    window.open(`${baseURL}/export/customers?area_id=${area_id || ''}`, '_blank');
  },
  exportLoans: (area_id?: string) => {
    const baseURL = apiClient.defaults.baseURL;
    window.open(`${baseURL}/export/loans?area_id=${area_id || ''}`, '_blank');
  },
  exportPayments: (area_id?: string) => {
    const baseURL = apiClient.defaults.baseURL;
    window.open(`${baseURL}/export/payments?area_id=${area_id || ''}`, '_blank');
  },
  exportAreaReport: (area_id?: string) => {
    const baseURL = apiClient.defaults.baseURL;
    window.open(`${baseURL}/export/area?area_id=${area_id || ''}`, '_blank');
  }
};

export const backupApi = {
  triggerBackup: async () => {
    const res = await apiClient.post('/backup');
    return res.data;
  },
  listBackups: async (): Promise<BackupItem[]> => {
    const res = await apiClient.get('/backups');
    return res.data;
  },
  downloadBackup: (filename: string) => {
    const baseURL = apiClient.defaults.baseURL;
    window.open(`${baseURL}/backups/download/${filename}`, '_blank');
  },
  restoreBackup: async (backup_filename: string) => {
    const res = await apiClient.post('/restore', { backup_filename });
    return res.data;
  }
};
