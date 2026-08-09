import { Eye, EyeOff, Landmark } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Input } from "../components/Input";

export default function LoginPage() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (userId === "admin" && password === "Admin@123") {
      localStorage.setItem("loan_demo_auth", "true");
      localStorage.setItem("loan_demo_remember", String(remember));
      navigate("/dashboard");
      return;
    }
    setError("Invalid demo credentials. Use admin / Admin@123.");
  };

  return (
    <main className="grid min-h-screen place-items-center bg-sky-50 px-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-lg border border-sky-100 bg-white p-8 shadow-xl">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-lg bg-sky-600 text-white"><Landmark size={28} /></div>
          <h1 className="text-2xl font-black text-slate-950">Loan Management System</h1>
          <p className="mt-2 text-sm font-semibold text-slate-500">Frontend demo login</p>
        </div>
        <div className="grid gap-4">
          <Input label="User ID" value={userId} onChange={(event) => setUserId(event.target.value)} autoComplete="username" />
          <div className="relative">
            <Input label="Password" type={visible ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />
            <button type="button" aria-label={visible ? "Hide password" : "Show password"} className="absolute right-3 top-8 text-slate-500" onClick={() => setVisible((value) => !value)}>
              {visible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} className="h-4 w-4 accent-sky-600" />
            Remember Me
          </label>
          {error ? <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p> : null}
          <Button type="submit" className="w-full">Login</Button>
        </div>
      </form>
    </main>
  );
}
