"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminLayout from "@/components/templates/AdminLayout";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import FormField from "@/components/molecules/FormField";
import { STAFF_ROLE_LABELS, MENU_CATEGORY_LABELS, type StaffRole } from "@/types";
import type { Staff } from "@/db/schema";

const SPECIALTY_OPTIONS = [
  { value: "acupuncture", label: MENU_CATEGORY_LABELS.acupuncture },
  { value: "chiropractic", label: MENU_CATEGORY_LABELS.chiropractic },
  { value: "massage", label: MENU_CATEGORY_LABELS.massage },
];

const COLOR_PRESETS = [
  "#f472b6", // pink
  "#fb923c", // orange
  "#facc15", // yellow
  "#4ade80", // green
  "#60a5fa", // blue
  "#a78bfa", // purple
  "#f87171", // red
  "#2dd4bf", // teal
];

export default function AdminStaffPage() {
  const router = useRouter();
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    role: "practitioner" as StaffRole,
    specialties: [] as string[],
    color: "#f472b6",
    isActive: true,
    sortOrder: 0,
  });

  const fetchStaff = () => {
    fetch("/api/admin/staff")
      .then((r) => {
        if (r.status === 401) {
          router.push("/admin/login");
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data) setStaffList(data.staff || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      role: "practitioner",
      specialties: [],
      color: "#f472b6",
      isActive: true,
      sortOrder: 0,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (s: Staff) => {
    let specialties: string[] = [];
    try {
      specialties = s.specialties ? JSON.parse(s.specialties) : [];
    } catch {
      specialties = [];
    }
    setFormData({
      name: s.name,
      role: s.role as StaffRole,
      specialties,
      color: s.color,
      isActive: s.isActive,
      sortOrder: s.sortOrder,
    });
    setEditingId(s.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      ...formData,
      specialties: JSON.stringify(formData.specialties),
    };

    const url = editingId ? `/api/admin/staff/${editingId}` : "/api/admin/staff";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      resetForm();
      fetchStaff();
    } else {
      alert("保存に失敗しました");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("このスタッフを削除してもよろしいですか？関連する勤務スケジュールも全て削除されます。")) return;
    setDeleting(id);
    const res = await fetch(`/api/admin/staff/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchStaff();
    } else {
      alert("削除に失敗しました");
    }
    setDeleting(null);
  };

  const toggleActive = async (s: Staff) => {
    const res = await fetch(`/api/admin/staff/${s.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !s.isActive }),
    });
    if (res.ok) fetchStaff();
  };

  const toggleSpecialty = (value: string) => {
    setFormData((p) => ({
      ...p,
      specialties: p.specialties.includes(value)
        ? p.specialties.filter((s) => s !== value)
        : [...p.specialties, value],
    }));
  };

  const parseSpecialties = (s: Staff): string[] => {
    try {
      return s.specialties ? JSON.parse(s.specialties) : [];
    } catch {
      return [];
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">スタッフ管理</h1>
          <Button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            + 新規スタッフ追加
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <Card className="p-6 mb-6">
            <h2 className="font-bold text-gray-800 mb-4">
              {editingId ? "スタッフ編集" : "新規スタッフ追加"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <FormField label="スタッフ名" required>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    placeholder="例: 山田太郎"
                    required
                  />
                </FormField>
                <FormField label="役割" required>
                  <Select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, role: e.target.value as StaffRole }))
                    }
                    options={Object.entries(STAFF_ROLE_LABELS).map(([value, label]) => ({
                      value,
                      label,
                    }))}
                  />
                </FormField>
              </div>

              <FormField label="得意分野">
                <div className="flex flex-wrap gap-2">
                  {SPECIALTY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggleSpecialty(opt.value)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                        formData.specialties.includes(opt.value)
                          ? "bg-sakura-400 text-white border-sakura-400"
                          : "bg-white text-gray-600 border-gray-300 hover:border-sakura-300"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </FormField>

              <div className="grid md:grid-cols-2 gap-4">
                <FormField label="表示色">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      {COLOR_PRESETS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setFormData((p) => ({ ...p, color: c }))}
                          className={`w-8 h-8 rounded-full border-2 transition-transform ${
                            formData.color === c
                              ? "border-gray-800 scale-110"
                              : "border-transparent hover:scale-105"
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <Input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData((p) => ({ ...p, color: e.target.value }))}
                      className="w-10 h-10 p-1 cursor-pointer"
                    />
                  </div>
                </FormField>
                <FormField label="表示順">
                  <Input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))
                    }
                  />
                </FormField>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="staffIsActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData((p) => ({ ...p, isActive: e.target.checked }))}
                  className="w-4 h-4"
                />
                <label htmlFor="staffIsActive" className="text-sm text-gray-700">
                  有効（シフト管理に表示）
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" isLoading={saving}>
                  保存
                </Button>
                <Button type="button" variant="secondary" onClick={resetForm}>
                  キャンセル
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Staff List */}
        {loading ? (
          <p className="text-gray-400 text-center py-12">読み込み中...</p>
        ) : staffList.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-400 mb-4">スタッフが登録されていません</p>
            <Button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
            >
              + 最初のスタッフを追加
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {staffList.map((s) => {
              const specialties = parseSpecialties(s);
              return (
                <Card key={s.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className="w-3 h-10 rounded-full shrink-0"
                        style={{ backgroundColor: s.color }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-gray-800">{s.name}</span>
                          <Badge className="bg-gray-100 text-gray-600">
                            {STAFF_ROLE_LABELS[s.role as StaffRole] || s.role}
                          </Badge>
                          {!s.isActive && (
                            <Badge className="bg-red-100 text-red-600">無効</Badge>
                          )}
                        </div>
                        {specialties.length > 0 && (
                          <p className="text-sm text-gray-500 mt-0.5">
                            {specialties
                              .map(
                                (sp) =>
                                  MENU_CATEGORY_LABELS[sp as keyof typeof MENU_CATEGORY_LABELS] ||
                                  sp,
                              )
                              .join(" / ")}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Link href={`/admin/staff/${s.id}`}>
                        <Button variant="ghost" className="text-sm">
                          勤務設定
                        </Button>
                      </Link>
                      <Button variant="ghost" className="text-sm" onClick={() => startEdit(s)}>
                        編集
                      </Button>
                      <Button
                        variant="ghost"
                        className="text-sm"
                        onClick={() => toggleActive(s)}
                      >
                        {s.isActive ? "無効化" : "有効化"}
                      </Button>
                      <Button
                        variant="ghost"
                        className="text-sm text-red-500"
                        onClick={() => handleDelete(s.id)}
                        isLoading={deleting === s.id}
                      >
                        削除
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
