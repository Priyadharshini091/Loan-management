import { Plus } from "lucide-react";
import { useState } from "react";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { DataTable, type Column } from "../components/DataTable";
import { Input } from "../components/Input";
import { Modal } from "../components/Modal";
import { Select } from "../components/Select";
import { useToast } from "../components/Toast";
import type { User } from "../types";

const initialUsers: User[] = [
  { id: "admin", name: "System Admin", role: "ADMIN", status: "Active", lastLogin: "2026-08-09 09:00" },
  { id: "staff01", name: "Collection Staff", role: "STAFF", status: "Active", lastLogin: "2026-08-08 18:20" },
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState<"ADMIN" | "STAFF">("STAFF");
  const { showToast } = useToast();
  const add = () => {
    setUsers([{ id: `user${users.length + 1}`, name, role, status: "Active", lastLogin: "-" }, ...users]);
    setOpen(false);
    setName("");
    showToast("User created successfully.");
  };
  const columns: Column<User>[] = [
    { key: "id", header: "User ID", render: (row) => row.id },
    { key: "name", header: "Name", render: (row) => row.name },
    { key: "role", header: "Role", render: (row) => row.role },
    { key: "status", header: "Status", render: (row) => <Badge>{row.status}</Badge> },
    { key: "login", header: "Last Login", render: (row) => row.lastLogin },
    { key: "actions", header: "Actions", render: () => <Button variant="secondary">Edit</Button> },
  ];
  return (
    <div className="grid gap-5">
      <div className="flex justify-between gap-3"><div><h1 className="text-2xl font-black text-slate-950">Users</h1><p className="text-sm font-semibold text-slate-500">Frontend-only user management.</p></div><Button icon={<Plus size={18} />} onClick={() => setOpen(true)}>Add User</Button></div>
      <DataTable columns={columns} data={users} />
      <Modal title="Add User" open={open} onClose={() => setOpen(false)}>
        <div className="grid gap-4"><Input label="Name" value={name} onChange={(event) => setName(event.target.value)} /><Select label="Role" value={role} onChange={(event) => setRole(event.target.value as "ADMIN" | "STAFF")} options={["ADMIN", "STAFF"]} /><div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={add} disabled={!name.trim()}>Save User</Button></div></div>
      </Modal>
    </div>
  );
}
