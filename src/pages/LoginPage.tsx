import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api";
import { useToast } from "../components/Toast";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { BarChart3, Lock, User as UserIcon } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authApi.login(username, password);
      localStorage.setItem("loan_auth_token", data.access_token);
      localStorage.setItem("loan_user", JSON.stringify(data.user));
      localStorage.setItem("loan_demo_auth", "true");

      showToast(`Welcome back, ${data.user.username}!`, "success");
      navigate("/dashboard");
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Invalid username or password", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-900 via-sky-800 to-slate-900 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl space-y-6">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-lg shadow-sky-600/30">
            <BarChart3 size={32} />
          </div>
          <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-900">
            LOAN MANAGEMENT SYSTEM
          </h1>
          <p className="mt-1 text-xs font-semibold text-sky-700 uppercase tracking-wider">
            Finance Office Sign In
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin / staff"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <div className="rounded-lg bg-sky-50 p-3 text-xs text-slate-600 space-y-1 border border-sky-100">
            <p className="font-bold text-slate-800">Demo Accounts:</p>
            <p>Admin: <span className="font-mono text-sky-700">admin</span> / <span className="font-mono text-sky-700">admin123</span></p>
            <p>Staff: <span className="font-mono text-sky-700">staff</span> / <span className="font-mono text-sky-700">staff123</span></p>
          </div>

          <Button type="submit" className="w-full justify-center py-2.5" disabled={loading}>
            {loading ? "Authenticating..." : "Sign In to Dashboard"}
          </Button>
        </form>
      </div>
    </div>
  );
}
