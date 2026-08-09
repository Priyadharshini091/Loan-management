export type LoanStatus = "ACTIVE" | "COMPLETED" | "OVERDUE";
export type PaymentStatus = "PAID" | "PENDING" | "PARTIAL" | "OVERDUE";
export type PaymentMethod = "Cash" | "UPI" | "Bank Transfer" | "Other";
export type Frequency = "Daily" | "Weekly" | "Monthly";

export interface Guarantor {
  name: string;
  mobile: string;
  address: string;
  aadhaar?: string;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  alternateMobile?: string;
  address: string;
  aadhaar?: string;
  occupation: string;
  photoUrl?: string;
  guarantor?: Guarantor;
  notes?: string;
  status: "Active" | "Inactive";
  activeLoans: number;
  outstanding: number;
}

export interface Loan {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  interestRate: number;
  interestType: "Flat Interest" | "Reducing Balance";
  interestAmount: number;
  totalPayable: number;
  emi: number;
  frequency: Frequency;
  installments: number;
  loanDate: string;
  firstDueDate: string;
  nextDueDate: string;
  paid: number;
  outstanding: number;
  status: LoanStatus;
}

export interface EMISchedule {
  installment: number;
  dueDate: string;
  dueAmount: number;
  paid: number;
  balance: number;
  status: PaymentStatus;
}

export interface Payment {
  receiptNumber: string;
  date: string;
  customerId: string;
  customerName: string;
  loanId: string;
  dueAmount: number;
  paidAmount: number;
  balance: number;
  paymentMethod: PaymentMethod;
  collectedBy: string;
  remarks?: string;
}

export interface DashboardStats {
  totalCustomers: number;
  activeLoans: number;
  totalLoanGiven: number;
  collectionToday: number;
  pendingAmount: number;
  overdueCustomers: number;
}

export interface Report {
  period: string;
  totalDue: number;
  totalCollected: number;
  pending: number;
  numberOfPayments: number;
  methods: Record<"Cash" | "UPI" | "Bank Transfer", number>;
}

export interface Receipt extends Payment {
  businessName: string;
  remainingBalance: number;
}

export interface User {
  id: string;
  name: string;
  role: "ADMIN" | "STAFF";
  status: "Active" | "Inactive";
  lastLogin: string;
}

export interface TodayDue {
  customerId: string;
  customerName: string;
  mobile: string;
  loanId: string;
  dueAmount: number;
  paid: number;
  balance: number;
  status: PaymentStatus;
}
