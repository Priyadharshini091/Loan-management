import { mockLoans, mockSchedule } from "../data/mockLoans";
import type { EMISchedule, Loan } from "../types";

const storageKey = "loan_demo_loans";

const read = (): Loan[] => {
  const saved = localStorage.getItem(storageKey);
  if (!saved) return mockLoans;
  const savedLoans = JSON.parse(saved) as Loan[];
  const savedIds = new Set(savedLoans.map((loan) => loan.id));
  return [...savedLoans, ...mockLoans.filter((loan) => !savedIds.has(loan.id))];
};

const write = (loans: Loan[]) => localStorage.setItem(storageKey, JSON.stringify(loans));

export const calculateFlatLoan = (amount: number, rate: number, installments: number) => {
  const interestAmount = amount * (rate / 100);
  const totalPayable = amount + interestAmount;
  const emi = installments > 0 ? totalPayable / installments : 0;
  return { interestAmount, totalPayable, emi };
};

export const loanService = {
  list: async () => read(),
  get: async (id: string) => read().find((loan) => loan.id === id),
  schedule: async (id: string): Promise<EMISchedule[]> => mockSchedule[id] ?? [],
  create: async (loan: Omit<Loan, "id" | "paid" | "outstanding" | "status">) => {
    const loans = read();
    const next: Loan = {
      ...loan,
      id: `LN${String(loans.length + 1).padStart(4, "0")}`,
      paid: 0,
      outstanding: loan.totalPayable,
      status: "ACTIVE",
    };
    write([next, ...loans]);
    return next;
  },
};
