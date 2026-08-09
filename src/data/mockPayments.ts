import type { Payment, TodayDue } from "../types";

export const mockTodayDues: TodayDue[] = [
  { customerId: "CU0001", customerName: "Ravi Kumar", mobile: "9876543210", loanId: "LN0001", dueAmount: 1100, paid: 1100, balance: 0, status: "PAID" },
  { customerId: "CU0002", customerName: "Kumar", mobile: "9876543211", loanId: "LN0002", dueAmount: 1100, paid: 500, balance: 600, status: "PARTIAL" },
  { customerId: "CU0003", customerName: "Suresh", mobile: "9876543212", loanId: "LN0003", dueAmount: 1100, paid: 0, balance: 1100, status: "PENDING" },
  { customerId: "CU0005", customerName: "Arjun Reddy", mobile: "9876543214", loanId: "LN0004", dueAmount: 2500, paid: 0, balance: 2500, status: "OVERDUE" },
  { customerId: "CU0006", customerName: "Lakshmi Narayan", mobile: "9876543215", loanId: "LN0006", dueAmount: 1980, paid: 980, balance: 1000, status: "PARTIAL" },
  { customerId: "CU0007", customerName: "Priya Sharma", mobile: "9876543216", loanId: "LN0007", dueAmount: 3360, paid: 0, balance: 3360, status: "PENDING" },
  { customerId: "CU0008", customerName: "Imran Khan", mobile: "9876543217", loanId: "LN0008", dueAmount: 1296, paid: 0, balance: 1296, status: "OVERDUE" },
];

export const mockPayments: Payment[] = [
  { receiptNumber: "REC000121", date: "2026-08-06", customerId: "CU0001", customerName: "Ravi Kumar", loanId: "LN0001", dueAmount: 1100, paidAmount: 1100, balance: 0, paymentMethod: "Cash", collectedBy: "Admin" },
  { receiptNumber: "REC000122", date: "2026-08-07", customerId: "CU0002", customerName: "Kumar", loanId: "LN0002", dueAmount: 1100, paidAmount: 500, balance: 600, paymentMethod: "UPI", collectedBy: "Staff" },
  { receiptNumber: "REC000123", date: "2026-08-08", customerId: "CU0005", customerName: "Arjun Reddy", loanId: "LN0004", dueAmount: 2500, paidAmount: 2500, balance: 0, paymentMethod: "Bank Transfer", collectedBy: "Admin" },
  { receiptNumber: "REC000124", date: "2026-08-09", customerId: "CU0001", customerName: "Ravi Kumar", loanId: "LN0001", dueAmount: 1100, paidAmount: 1100, balance: 0, paymentMethod: "Cash", collectedBy: "Admin" },
  { receiptNumber: "REC000125", date: "2026-08-09", customerId: "CU0006", customerName: "Lakshmi Narayan", loanId: "LN0006", dueAmount: 1980, paidAmount: 980, balance: 1000, paymentMethod: "UPI", collectedBy: "Staff" },
  { receiptNumber: "REC000126", date: "2026-08-09", customerId: "CU0007", customerName: "Priya Sharma", loanId: "LN0007", dueAmount: 3360, paidAmount: 1200, balance: 2160, paymentMethod: "Cash", collectedBy: "Admin" },
  { receiptNumber: "REC000127", date: "2026-08-05", customerId: "CU0008", customerName: "Imran Khan", loanId: "LN0008", dueAmount: 1296, paidAmount: 768, balance: 528, paymentMethod: "Bank Transfer", collectedBy: "Staff" },
];
