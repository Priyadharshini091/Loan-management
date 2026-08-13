export type LoanStatus = "ACTIVE" | "COMPLETED" | "OVERDUE";
export type PaymentStatus = "PAID" | "PENDING" | "PARTIAL" | "OVERDUE";
export type PaymentMethod = "Cash" | "UPI" | "Bank Transfer" | "Other";
export type EMIType = "Daily" | "Weekly" | "Monthly";

export interface User {
  user_id: string;
  username: string;
  email: string;
  role: "Admin" | "Staff" | "ADMIN" | "STAFF";
  status: "Active" | "Inactive";
  created_at: string;
}

export interface Area {
  area_id: string;
  area_name: string;
  district: string;
  pincode: string;
  status: "Active" | "Inactive";
  created_at: string;
}

export interface Customer {
  customer_id: string;
  customer_name: string;
  mobile_number: string;
  address: string;
  area_id: string;
  area_name: string;
  aadhaar_number?: string;
  photo_path?: string;
  guarantor_name?: string;
  guarantor_mobile?: string;
  created_at: string;
  status: "Active" | "Inactive";
  active_loans_count?: number;
  total_outstanding?: number;
}

export interface Loan {
  loan_id: string;
  loan_number: string;
  customer_id: string;
  customer_name: string;
  area_id: string;
  area_name: string;
  loan_amount: number;
  interest_percentage: number;
  interest_amount: number;
  total_payable: number;
  loan_date: string;
  emi_type: EMIType;
  number_of_installments: number;
  emi_amount: number;
  first_due_date: string;
  final_due_date: string;
  status: LoanStatus;
  paid_amount?: number;
  outstanding?: number;
}

export interface Installment {
  installment_id: string;
  loan_id: string;
  customer_id: string;
  customer_name: string;
  area_id: string;
  area_name: string;
  loan_number: string;
  mobile_number: string;
  installment_number: number;
  due_date: string;
  due_amount: number;
  paid_amount: number;
  balance: number;
  status: PaymentStatus;
  paid_date?: string;
  receipt_number?: string;
}

export interface Payment {
  payment_id: string;
  receipt_number: string;
  loan_id: string;
  customer_id: string;
  customer_name: string;
  area_id: string;
  area_name: string;
  payment_date: string;
  due_date: string;
  amount_due: number;
  amount_paid: number;
  partial_payment: number;
  balance: number;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  collected_by: string;
  remarks?: string;
}

export interface DashboardStats {
  total_customers: number;
  active_loans: number;
  total_loan_given: number;
  collection_today: number;
  pending_amount: number;
  overdue_customers: number;
  area_summaries?: AreaDashboardStats[];
}

export interface AreaDashboardStats {
  area_id: string;
  area_name: string;
  total_customers: number;
  total_active_loans: number;
  total_loan_given: number;
  total_collected: number;
  total_pending: number;
  todays_due: number;
  todays_collection: number;
  overdue_amount: number;
  overdue_customers: number;
}

export interface BackupItem {
  filename: string;
  size_bytes: number;
  created_at: string;
}

export interface ExcelImportPreview {
  valid: boolean;
  summary: { Customers: number; Areas: number; Loans: number };
  preview_customers: any[];
  preview_areas: any[];
  errors: string[];
}
