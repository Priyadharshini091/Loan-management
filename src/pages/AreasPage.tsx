import React, { useState, useEffect } from "react";
import { Plus, Search, MapPin, Edit, CheckCircle, XCircle, Trash2 } from "lucide-react";
import type { Area } from "../types";
import { areaApi } from "../api";
import { useToast } from "../components/Toast";
import { Button } from "../components/Button";
import { Modal } from "../components/Modal";
import { Input } from "../components/Input";
import { Badge } from "../components/Badge";

export default function AreasPage() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);

  const [areaName, setAreaName] = useState("");
  const [district, setDistrict] = useState("Karur");
  const [pincode, setPincode] = useState("");

  const { showToast } = useToast();

  const loadAreas = async () => {
    try {
      setLoading(true);
      const data = await areaApi.getAreas();
      setAreas(data);
    } catch (err: any) {
      showToast("Failed to load areas", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAreas();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!areaName.trim()) {
      showToast("Area name is required", "error");
      return;
    }
    try {
      if (editingArea) {
        await areaApi.updateArea(editingArea.area_id, {
          area_name: areaName,
          district,
          pincode,
        });
        showToast("Area updated successfully", "success");
      } else {
        await areaApi.createArea({ area_name: areaName, district, pincode });
        showToast("Area created successfully", "success");
      }
      setIsAddOpen(false);
      setEditingArea(null);
      setAreaName("");
      setPincode("");
      loadAreas();
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Operation failed", "error");
    }
  };

  const handleToggleStatus = async (area: Area) => {
    const newStatus = area.status === "Active" ? "Inactive" : "Active";
    try {
      await areaApi.updateArea(area.area_id, { status: newStatus });
      showToast(`Area ${area.area_name} marked as ${newStatus}`, "success");
      loadAreas();
    } catch (err: any) {
      showToast("Failed to update status", "error");
    }
  };

  const openEdit = (area: Area) => {
    setEditingArea(area);
    setAreaName(area.area_name);
    setDistrict(area.district);
    setPincode(area.pincode);
    setIsAddOpen(true);
  };

  const filtered = areas.filter(
    (a) =>
      a.area_name.toLowerCase().includes(search.toLowerCase()) ||
      a.district.toLowerCase().includes(search.toLowerCase()) ||
      a.pincode.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Area Management</h1>
          <p className="text-sm font-medium text-slate-500">
            Manage business collection zones and districts
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingArea(null);
            setAreaName("");
            setPincode("");
            setIsAddOpen(true);
          }}
          icon={<Plus size={18} />}
        >
          Add New Area
        </Button>
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-sky-100 bg-white p-3 shadow-xs">
        <Search className="text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Search areas by name, district or pincode..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
        />
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-500 font-medium">Loading areas...</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-sky-200 bg-sky-50/50 py-12 text-center">
          <MapPin className="mx-auto text-sky-400" size={36} />
          <p className="mt-2 text-sm font-bold text-slate-700">No Areas Found</p>
          <p className="text-xs text-slate-500">Create your first collection area to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((area) => (
            <div
              key={area.area_id}
              className="flex flex-col justify-between rounded-xl border border-sky-100 bg-white p-5 shadow-xs transition hover:border-sky-300"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{area.area_name}</h3>
                    <p className="text-xs font-semibold text-slate-500">{area.district} District</p>
                  </div>
                  <Badge variant={area.status === "Active" ? "success" : "secondary"}>
                    {area.status}
                  </Badge>
                </div>
                <div className="mt-4 space-y-1 text-xs font-medium text-slate-600">
                  <p>
                    <span className="font-semibold text-slate-700">Area ID:</span> {area.area_id}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-700">Pincode:</span> {area.pincode || "N/A"}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-700">Created:</span> {area.created_at.slice(0, 10)}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-3">
                <button
                  onClick={() => openEdit(area)}
                  className="flex items-center gap-1.5 text-xs font-bold text-sky-700 hover:text-sky-900"
                >
                  <Edit size={14} /> Edit Area
                </button>
                <button
                  onClick={() => handleToggleStatus(area)}
                  className={`flex items-center gap-1.5 text-xs font-bold ${
                    area.status === "Active" ? "text-amber-600 hover:text-amber-800" : "text-emerald-600 hover:text-emerald-800"
                  }`}
                >
                  {area.status === "Active" ? <XCircle size={14} /> : <CheckCircle size={14} />}
                  {area.status === "Active" ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isAddOpen && (
        <Modal
          title={editingArea ? "Edit Area" : "Add New Area"}
          onClose={() => setIsAddOpen(false)}
        >
          <form onSubmit={handleSave} className="space-y-4">
            <Input
              label="Area Name *"
              value={areaName}
              onChange={(e) => setAreaName(e.target.value)}
              placeholder="e.g. Thogamalai"
              required
            />
            <Input
              label="District *"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="e.g. Karur"
              required
            />
            <Input
              label="Pincode"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder="e.g. 621313"
            />
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" type="button" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingArea ? "Update Area" : "Save Area"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
