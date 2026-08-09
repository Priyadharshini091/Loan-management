import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { customerService } from "../services/customerService";
import { loanService } from "../services/loanService";
import { paymentService } from "../services/paymentService";
import type { Customer, Loan, Payment, TodayDue } from "../types";

interface AppData {
  customers: Customer[];
  loans: Loan[];
  payments: Payment[];
  todayDues: TodayDue[];
  refresh: () => Promise<void>;
  setCustomers: (customers: Customer[]) => void;
  setLoans: (loans: Loan[]) => void;
  setPayments: (payments: Payment[]) => void;
  setTodayDues: (dues: TodayDue[]) => void;
}

const AppDataContext = createContext<AppData | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [todayDues, setTodayDues] = useState<TodayDue[]>([]);

  const refresh = async () => {
    const [nextCustomers, nextLoans, nextPayments, nextDues] = await Promise.all([
      customerService.list(),
      loanService.list(),
      paymentService.list(),
      paymentService.todayDues(),
    ]);
    setCustomers(nextCustomers);
    setLoans(nextLoans);
    setPayments(nextPayments);
    setTodayDues(nextDues);
  };

  useEffect(() => {
    void refresh();
  }, []);

  const value = useMemo(() => ({ customers, loans, payments, todayDues, refresh, setCustomers, setLoans, setPayments, setTodayDues }), [customers, loans, payments, todayDues]);
  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export const useAppData = () => {
  const value = useContext(AppDataContext);
  if (!value) throw new Error("useAppData must be used inside AppDataProvider");
  return value;
};
