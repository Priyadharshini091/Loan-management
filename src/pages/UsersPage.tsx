import React, { useState, useEffect } from "react";
import type { User } from "../types";
import { authApi } from "../api";
import { useToast } from "../components/Toast";
import { Button } from "../components/Button";
import { Badge } from "../components/Badge";
import { Modal } from "../components/Modal";
import { Input } from "../components/Input";
import { Select } from "../components/Select";
import { Plus, Users as UsersIcon, ShieldCheck } from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"Admin" | "Staff">("Staff");

  const { showToast } = useToast();

  const loadUsers = async () => {
    setLoading(true);
    try {
      const list = await authApi.getUsers();
      setUsers(list);
    } catch (err) {
      showToast("Failed to load user list", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authApi.createUser({ username, email, password, role });
      showToast("User account created successfully", "success");
      setIsOpen(false);
      setUsername("");
      setEmail("");
      setPassword("");
      loadUsers();
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Failed to create user", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Access Management</h1>
          <p className="text-sm font-medium text-slate-500">Manage Admin and Staff operator permissions</p>
        </div>
        <Button onClick={() => setIsOpen(true)} icon={<Plus size={18} />}>
          Add User Account
        </Button>
      </div>

      <div className="rounded-xl border border-sky-100 bg-white p-5 shadow-xs">
        {loading ? (
          <div className="py-12 text-center text-slate-500 font-medium">Loading user accounts...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="border-b border-sky-100 bg-sky-50/50 text-xs font-bold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">User ID</th>
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.user_id} className="hover:bg-sky-50/40">
                    <td className="px-4 py-3.5 font-bold text-slate-900">{u.user_id}</td>
                    <td className="px-4 py-3.5 font-bold text-sky-800">{u.username}</td>
                    <td className="px-4 py-3.5 font-medium text-slate-600">{u.email || "N/A"}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-800">
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs">
                        <ShieldCheck size={14} className="text-sky-600" /> {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={u.status === "Active" ? "success" : "secondary"}>{u.status}</Badge>
                    </td>
                    <td className="px-4 py-3.5 text-xs font-medium text-slate-500">{u.created_at.slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isOpen && (
        <Modal title="Add New User Account" onClose={() => setIsOpen(false)}>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <Input label="Username *" value={username} onChange={(e) => setUsername(e.target.value)} required />
            <Input label="Email Address *" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input label="Password *" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Select
              label="User Role *"
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              options={[
                { value: "Staff", label: "Staff" },
                { value: "Admin", label: "Admin" },
              ]}
            />
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" type="button" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Account</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
