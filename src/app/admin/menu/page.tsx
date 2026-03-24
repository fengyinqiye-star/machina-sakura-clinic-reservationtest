"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/templates/AdminLayout";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Textarea from "@/components/atoms/Textarea";
import Select from "@/components/atoms/Select";
import FormField from "@/components/molecules/FormField";
import { MENU_CATEGORY_LABELS, type MenuCategory } from "@/types";
import type { Menu } from "@/db/schema";

export default function AdminMenuPage() {
  const router = useRouter();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    category: "acupuncture" as MenuCategory,
    description: "",
    duration: 30,
    price: 0,
    targetSymptoms: "",
    sortOrder: 0,
    isActive: true,
  });

  const fetchMenus = () => {
    fetch("/api/admin/menus")
      .then((r) => {
        if (r.status === 401) {
          router.push("/admin/login");
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data) setMenus(data.menus || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      category: "acupuncture",
      description: "",
      duration: 30,
      price: 0,
      targetSymptoms: "",
      sortOrder: 0,
      isActive: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (menu: Menu) => {
    setFormData({
      name: menu.name,
      category: menu.category as MenuCategory,
      description: menu.description,
      duration: menu.duration,
      price: menu.price,
      targetSymptoms: menu.targetSymptoms || "",
      sortOrder: menu.sortOrder,
      isActive: menu.isActive,
    });
    setEditingId(menu.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const url = editingId ? `/api/admin/menus/${editingId}` : "/api/admin/menus";
    const method = editingId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      resetForm();
      fetchMenus();
    } else {
      alert("保存に失敗しました");
    }
    setSaving(false);
  };

  const toggleActive = async (menu: Menu) => {
    const res = await fetch(`/api/admin/menus/${menu.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !menu.isActive }),
    });

    if (res.ok) fetchMenus();
  };

  const categories = Object.keys(MENU_CATEGORY_LABELS) as MenuCategory[];

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">メニュー管理</h1>
          <Button onClick={() => { resetForm(); setShowForm(true); }}>
            + 新規メニュー追加
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <Card className="p-6 mb-6">
            <h2 className="font-bold text-gray-800 mb-4">
              {editingId ? "メニュー編集" : "新規メニュー追加"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <FormField label="メニュー名" required>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    required
                  />
                </FormField>
                <FormField label="カテゴリ" required>
                  <Select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, category: e.target.value as MenuCategory }))
                    }
                    options={categories.map((c) => ({ value: c, label: MENU_CATEGORY_LABELS[c] }))}
                  />
                </FormField>
              </div>
              <FormField label="説明">
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                />
              </FormField>
              <div className="grid grid-cols-3 gap-4">
                <FormField label="所要時間(分)" required>
                  <Input
                    type="number"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, duration: parseInt(e.target.value) || 0 }))
                    }
                    min={10}
                    required
                  />
                </FormField>
                <FormField label="料金(円)" required>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, price: parseInt(e.target.value) || 0 }))
                    }
                    min={0}
                    required
                  />
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
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData((p) => ({ ...p, isActive: e.target.checked }))}
                  className="w-4 h-4"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">公開する</label>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" isLoading={saving}>保存</Button>
                <Button type="button" variant="secondary" onClick={resetForm}>
                  キャンセル
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Menu List */}
        {loading ? (
          <p className="text-gray-400 text-center py-12">読み込み中...</p>
        ) : (
          categories.map((cat) => {
            const catMenus = menus.filter((m) => m.category === cat);
            if (catMenus.length === 0) return null;
            return (
              <div key={cat} className="mb-8">
                <h2 className="text-lg font-bold text-gray-700 mb-3">
                  {MENU_CATEGORY_LABELS[cat]}
                </h2>
                <div className="space-y-2">
                  {catMenus.map((menu) => (
                    <Card key={menu.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-800">{menu.name}</span>
                            {!menu.isActive && (
                              <Badge className="bg-gray-100 text-gray-500">非公開</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {menu.duration}分 / {menu.price.toLocaleString()}円
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" onClick={() => startEdit(menu)}>
                            編集
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => toggleActive(menu)}
                          >
                            {menu.isActive ? "非公開" : "公開"}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </AdminLayout>
  );
}
