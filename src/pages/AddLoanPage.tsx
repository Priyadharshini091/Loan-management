import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Customer } from "../types";
import { customerApi, loanApi } from "../api";
import { useToast } from "../components/Toast";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Select } from "../components/Select";
import { BackButton } from "../components/BackButton";

export default function AddLoanPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustId, setSelectedCustId] = useState("");
  const [amount, setAmount] = useState("50000");
  const [interestRate, setInterestRate] = useState("12");
  const [emiType, setEmiType] = useState("Daily");
  const [installments, setInstallments] = useState("100");
  const [loanDate, setLoanDate] = useState(new Date().toISOString().slice(0, 10));
  const [firstDueDate, setFirstDueDate] = useState(new Date().toISOString().slice(0, 10));

  const [calculation, setCalculation] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    customerApi.getCustomers().then((list) => {
      setCustomers(list);
      if (list.length > 0) setSelectedCustId(list[0].customer_id);
    });
  }, []);

  const selectedCust = customers.find((c) => c.customer_id === selectedCustId);

  // Recalculate loan preview schedule
  useEffect(() => {
    const amtNum = parseFloat(amount);
    const rateNum = parseFloat(interestRate);
    const instNum = parseInt(installments);

    if (amtNum > 0 && rateNum >= 0 && instNum > 0 && firstDueDate) {
      loanApi
        .calculateLoan({
          loan_amount: amtNum,
          interest_percentage: rateNum,
          emi_type: emiType,
          number_of_installments: instNum,
          first_due_date: firstDueDate,
        })
        .then((res) => setCalculation(res))
        .catch(() => setCalculation(null));
    }
  }, [amount, interestRate, emiType, installments, firstDueDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustId) {
      showToast("Please select a customer", "error");
      return;
    }

    setLoading(true);
    try {
      await loanApi.createLoan({
        customer_id: selectedCustId,
        loan_amount: parseFloat(amount),
        interest_percentage: parseFloat(interestRate),
        emi_type: emiType,
        number_of_installments: parseInt(installments),
        loan_date: loanDate,
        first_due_date: firstDueDate,
      });

      showToast("Loan account created successfully!", "success");
      navigate("/loans");
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Failed to create loan", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <BackButton />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create New Loan</h1>
          <p className="text-sm font-medium text-slate-500">
            Issue loan account and auto-generate EMI schedule
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-sky-100 bg-white p-6 shadow-xs space-y-4">
        <Select
          label="Select Customer *"
          value={selectedCustId}
          onChange={(e) => setSelectedCustId(e.target.value)}
          options={customers.map((c) => ({
            value: c.customer_id,
            label: `${c.customer_name} - ${c.mobile_number} (${c.area_name})`,
          }))}
          required
        />

        {selectedCust && (
          <div className="rounded-lg bg-sky-50 p-3 text-xs font-semibold text-slate-700 grid grid-cols-2 gap-2 border border-sky-100">
            <p>Customer Name: <span className="font-bold text-slate-900">{selectedCust.customer_name}</span></p>
            <p>Mobile: <span className="font-bold text-slate-900">{selectedCust.mobile_number}</span></p>
            <p>Assigned Area: <span className="font-bold text-sky-800">{selectedCust.area_name}</span></p>
            <p>Existing Active Loans: <span className="font-bold text-slate-900">{selectedCust.active_loans_count || 0}</span></p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Loan Amount (₹) *"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <Input
            label="Interest Rate (%) *"
            type="number"
            step="0.1"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="EMI Frequency *"
            value={emiType}
            onChange={(e) => setEmiType(e.target.value)}
            options={[
              { value: "Daily", label: "Daily" },
              { value: "Weekly", label: "Weekly" },
              { value: "Monthly", label: "Monthly" },
            ]}
          />
          <Input
            label="Number of Installments *"
            type="number"
            value={installments}
            onChange={(e) => setInstallments(e.target.value)}
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Loan Date *"
            type="date"
            value={loanDate}
            onChange={(e) => setLoanDate(e.target.value)}
            required
          />
          <Input
            label="First Due Date *"
            type="date"
            value={firstDueDate}
            onChange={(e) => setFirstDueDate(e.target.value)}
            required
          />
        </div>

        {calculation && (
          <div className="rounded-xl border border-sky-200 bg-sky-50/50 p-4 space-y-2 text-xs font-semibold text-slate-800">
            <h4 className="text-xs font-bold uppercase text-sky-800">Calculated Loan Financial Summary</h4>
            <div className="grid grid-cols-2 gap-2 text-slate-700">
              <p>Interest Amount: <span className="font-bold text-slate-900">₹{calculation.interest_amount.toLocaleString()}</span></p>
              <p>Total Payable Amount: <span className="font-bold text-slate-900">₹{calculation.total_payable.toLocaleString()}</span></p>
              <p>EMI Amount per Installment: <span className="font-bold text-emerald-700">₹{calculation.emi_amount.toLocaleString()}</span></p>
              <p>Final Maturity Date: <span className="font-bold text-slate-900">{calculation.final_due_date}</span></p>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" type="button" onClick={() => navigate("/loans")}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Confirm & Create Loan Account"}
          </Button>
        </div>
      </form>
    </div>
  );
}
