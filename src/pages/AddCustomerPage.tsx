import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Area } from "../types";
import { areaApi, customerApi } from "../api";
import { useToast } from "../components/Toast";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Select } from "../components/Select";
import { BackButton } from "../components/BackButton";

export default function AddCustomerPage() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [address, setAddress] = useState("");
  const [areaId, setAreaId] = useState("");
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [guarantorName, setGuarantorName] = useState("");
  const [guarantorMobile, setGuarantorMobile] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    areaApi.getAreas().then((list) => {
      setAreas(list);
      if (list.length > 0) setAreaId(list[0].area_id);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      showToast("Customer name is required", "error");
      return;
    }
    if (mobileNumber.replace(/\D/g, "").length !== 10) {
      showToast("Mobile number must be a valid 10-digit number", "error");
      return;
    }
    if (!areaId) {
      showToast("Please select an Area for the customer", "error");
      return;
    }
    if (aadhaarNumber && aadhaarNumber.replace(/\D/g, "").length !== 12) {
      showToast("Aadhaar number must be a valid 12-digit number", "error");
      return;
    }

    setLoading(true);
    try {
      await customerApi.createCustomer({
        customer_name: customerName,
        mobile_number: mobileNumber,
        address,
        area_id: areaId,
        aadhaar_number: aadhaarNumber,
        guarantor_name: guarantorName,
        guarantor_mobile: guarantorMobile,
      });

      showToast("Customer created successfully", "success");
      navigate("/customers");
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Failed to create customer", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <BackButton />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Add New Customer</h1>
          <p className="text-sm font-medium text-slate-500">Register new borrower profile</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-sky-100 bg-white p-6 shadow-xs space-y-4">
        <Input
          label="Customer Full Name *"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="e.g. Priya Dharshini"
          required
        />

        <Input
          label="Mobile Number (10 digits) *"
          value={mobileNumber}
          onChange={(e) => setMobileNumber(e.target.value)}
          placeholder="e.g. 9876543210"
          required
        />

        <Select
          label="Area / Collection Zone *"
          value={areaId}
          onChange={(e) => setAreaId(e.target.value)}
          options={areas.map((a) => ({ value: a.area_id, label: `${a.area_name} (${a.district})` }))}
          required
        />

        <Input
          label="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Street address..."
        />

        <Input
          label="Aadhaar Number (12 digits)"
          value={aadhaarNumber}
          onChange={(e) => setAadhaarNumber(e.target.value)}
          placeholder="e.g. 987654321012"
        />

        <div className="border-t border-slate-100 pt-4 space-y-4">
          <h3 className="text-sm font-bold text-slate-800">Guarantor Information</h3>
          <Input
            label="Guarantor Name"
            value={guarantorName}
            onChange={(e) => setGuarantorName(e.target.value)}
            placeholder="e.g. Murugan"
          />
          <Input
            label="Guarantor Mobile Number"
            value={guarantorMobile}
            onChange={(e) => setGuarantorMobile(e.target.value)}
            placeholder="e.g. 9876543219"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" type="button" onClick={() => navigate("/customers")}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Customer"}
          </Button>
        </div>
      </form>
    </div>
  );
}
