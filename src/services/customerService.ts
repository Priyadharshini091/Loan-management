import { mockCustomers } from "../data/mockCustomers";
import type { Customer } from "../types";

const storageKey = "loan_demo_customers";

const read = (): Customer[] => {
  const saved = localStorage.getItem(storageKey);
  if (!saved) return mockCustomers;
  const savedCustomers = JSON.parse(saved) as Customer[];
  const savedIds = new Set(savedCustomers.map((customer) => customer.id));
  return [...savedCustomers, ...mockCustomers.filter((customer) => !savedIds.has(customer.id))];
};

const write = (customers: Customer[]) => localStorage.setItem(storageKey, JSON.stringify(customers));

export const customerService = {
  list: async () => read(),
  get: async (id: string) => read().find((customer) => customer.id === id),
  create: async (customer: Omit<Customer, "id" | "activeLoans" | "outstanding" | "status">) => {
    const customers = read();
    const next: Customer = {
      ...customer,
      id: `CU${String(customers.length + 1).padStart(4, "0")}`,
      activeLoans: 0,
      outstanding: 0,
      status: "Active",
    };
    write([next, ...customers]);
    return next;
  },
  update: async (customer: Customer) => {
    const customers = read().map((item) => (item.id === customer.id ? customer : item));
    write(customers);
    return customer;
  },
};
