import { Save, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Select } from "../components/Select";
import { useToast } from "../components/Toast";
import { useAppData } from "../context/AppDataContext";
import { calculateFlatLoan, loanService } from "../services/loanService";
import { formatCurrency } from "../utils/format";

export default function AddLoanPage() {
  const { customers, refresh } = useAppData();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? "");
  const [amount, setAmount] = useState(25000);
  const [rate, setRate] = useState(12);
  const [installments, setInstallments] = useState(10);
  const [frequency, setFrequency] = useState("Weekly");
  const [loanDate, setLoanDate] = useState("2026-08-09");
  const [firstDueDate, setFirstDueDate] = useState("2026-08-16");
  const selected = customers.find((customer) => customer.id === customerId) ?? customers[0];
  const calc = useMemo(() => calculateFlatLoan(amount, rate, installments), [amount, rate, installments]);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected) return;
    await loanService.create({
      customerId: selected.id,
      customerName: selected.name,
      amount,
      interestRate: rate,
      interestType: "Flat Interest",
      interestAmount: calc.interestAmount,
      totalPayable: calc.totalPayable,
      emi: calc.emi,
      frequency: frequency as "Daily" | "Weekly" | "Monthly",
      installments,
      loanDate,
      firstDueDate,
      nextDueDate: firstDueDate,
    });
    await refresh();
    showToast("Loan created successfully.");
    navigate("/loans");
  };
  return (
    <form onSubmit={submit} className="grid gap-6">
      <div><h1 className="text-2xl font-black text-slate-950">Add Loan</h1><p className="text-sm font-semibold text-slate-500">Flat interest calculation is a frontend demo only.</p></div>
      <section className="rounded-lg border border-sky-100 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Select label="Customer" value={customerId} onChange={(event) => setCustomerId(event.target.value)} options={customers.map((customer) => customer.id)} />
          <Input label="Loan Amount" type="number" value={amount} onChange={(event) => setAmount(Number(event.target.value))} />
          <Input label="Interest Rate" type="number" value={rate} onChange={(event) => setRate(Number(event.target.value))} />
          <Select label="Interest Type" defaultValue="Flat Interest" options={["Flat Interest", "Reducing Balance"]} />
          <Input label="Loan Date" type="date" value={loanDate} onChange={(event) => setLoanDate(event.target.value)} />
          <Select label="EMI Frequency" value={frequency} onChange={(event) => setFrequency(event.target.value)} options={["Daily", "Weekly", "Monthly"]} />
          <Input label="Number of Installments" type="number" value={installments} onChange={(event) => setInstallments(Number(event.target.value))} />
          <Input label="First Due Date" type="date" value={firstDueDate} onChange={(event) => setFirstDueDate(event.target.value)} />
        </div>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[["Loan Amount", amount], ["Interest Amount", calc.interestAmount], ["Total Payable", calc.totalPayable], ["EMI", calc.emi]].map(([label, value]) => <div key={label} className="rounded-lg border border-sky-100 bg-white p-4 shadow-sm"><p className="text-sm font-bold text-slate-500">{label}</p><p className="mt-2 text-xl font-black text-slate-950">{formatCurrency(Number(value))}</p></div>)}
      </section>
      <div className="flex justify-end gap-3"><Button type="button" variant="secondary" icon={<X size={18} />} onClick={() => navigate("/loans")}>Cancel</Button><Button type="submit" icon={<Save size={18} />}>Save Loan</Button></div>
    </form>
  );
}
