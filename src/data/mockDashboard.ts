import type { DashboardStats, Report } from "../types";

export const dashboardStats: DashboardStats = {
  totalCustomers: 125,
  activeLoans: 86,
  totalLoanGiven: 1250000,
  collectionToday: 18500,
  pendingAmount: 45200,
  overdueCustomers: 12,
};

export const dailyCollections = [
  { name: "Monday", amount: 12500 },
  { name: "Tuesday", amount: 15200 },
  { name: "Wednesday", amount: 18000 },
  { name: "Thursday", amount: 14500 },
  { name: "Friday", amount: 20000 },
  { name: "Saturday", amount: 16800 },
  { name: "Sunday", amount: 18500 },
];

export const monthlyCollections = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
].map((name, index) => ({ name, amount: [82000, 91000, 96000, 104000, 99000, 112000, 118000, 125000, 121000, 132000, 138000, 146000][index] }));

export const loanStatus = [
  { name: "Active", value: 86 },
  { name: "Completed", value: 27 },
  { name: "Overdue", value: 12 },
];

export const paymentStatus = [
  { name: "Paid", value: 64 },
  { name: "Pending", value: 22 },
  { name: "Partial", value: 11 },
  { name: "Overdue", value: 12 },
];

export const reports: Record<string, Report> = {
  daily: { period: "09 Aug 2026", totalDue: 27500, totalCollected: 18500, pending: 9000, numberOfPayments: 18, methods: { Cash: 9500, UPI: 6200, "Bank Transfer": 2800 } },
  weekly: { period: "03 Aug - 09 Aug 2026", totalDue: 168000, totalCollected: 129500, pending: 38500, numberOfPayments: 96, methods: { Cash: 64000, UPI: 45500, "Bank Transfer": 20000 } },
  monthly: { period: "August 2026", totalDue: 620000, totalCollected: 415000, pending: 205000, numberOfPayments: 312, methods: { Cash: 210000, UPI: 145000, "Bank Transfer": 60000 } },
};
