import { mockPayments, mockTodayDues } from "../data/mockPayments";
import type { Payment, PaymentMethod, TodayDue } from "../types";
import { receiptNumber } from "../utils/format";

const duesKey = "loan_demo_today_dues";
const paymentsKey = "loan_demo_payments";

const readDues = (): TodayDue[] => {
  const saved = localStorage.getItem(duesKey);
  if (!saved) return mockTodayDues;
  const savedDues = JSON.parse(saved) as TodayDue[];
  const savedIds = new Set(savedDues.map((due) => due.loanId));
  return [...savedDues, ...mockTodayDues.filter((due) => !savedIds.has(due.loanId))];
};

const readPayments = (): Payment[] => {
  const saved = localStorage.getItem(paymentsKey);
  if (!saved) return mockPayments;
  const savedPayments = JSON.parse(saved) as Payment[];
  const savedIds = new Set(savedPayments.map((payment) => payment.receiptNumber));
  return [...savedPayments, ...mockPayments.filter((payment) => !savedIds.has(payment.receiptNumber))];
};

const writeDues = (dues: TodayDue[]) => localStorage.setItem(duesKey, JSON.stringify(dues));
const writePayments = (payments: Payment[]) => localStorage.setItem(paymentsKey, JSON.stringify(payments));

export const paymentService = {
  todayDues: async () => readDues(),
  list: async () => readPayments(),
  collect: async (due: TodayDue, amount: number, method: PaymentMethod, remarks: string) => {
    const paid = Math.min(due.dueAmount, due.paid + amount);
    const balance = Math.max(0, due.dueAmount - paid);
    const updatedDue: TodayDue = {
      ...due,
      paid,
      balance,
      status: balance === 0 ? "PAID" : paid > 0 ? "PARTIAL" : "PENDING",
    };
    writeDues(readDues().map((item) => (item.loanId === due.loanId ? updatedDue : item)));
    const payment: Payment = {
      receiptNumber: receiptNumber(125 + readPayments().length),
      date: new Date().toISOString().slice(0, 10),
      customerId: due.customerId,
      customerName: due.customerName,
      loanId: due.loanId,
      dueAmount: due.dueAmount,
      paidAmount: amount,
      balance,
      paymentMethod: method,
      collectedBy: "Admin",
      remarks,
    };
    writePayments([payment, ...readPayments()]);
    return payment;
  },
};
