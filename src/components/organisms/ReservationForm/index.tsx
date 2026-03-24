"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import StepMenu from "./StepMenu";
import StepDateTime from "./StepDateTime";
import StepPatientInfo from "./StepPatientInfo";
import StepConfirm from "./StepConfirm";
import type { ReservationFormData } from "@/types";
import type { PatientInfoInput } from "@/lib/validators/reservation";
import type { Menu } from "@/db/schema";

const STEPS = ["メニュー選択", "日時選択", "情報入力", "確認"];

export default function ReservationForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ReservationFormData>({
    menuId: "",
    menuName: "",
    category: "",
    duration: 0,
    price: 0,
    date: "",
    time: "",
    patientName: "",
    patientKana: "",
    phone: "",
    email: "",
    symptoms: "",
    isFirstVisit: true,
    agreedToPolicy: false,
    honeypot: "",
  });

  const handleMenuSelect = useCallback((menu: Menu) => {
    setFormData((prev) => ({
      ...prev,
      menuId: menu.id,
      menuName: menu.name,
      category: menu.category,
      duration: menu.duration,
      price: menu.price,
    }));
  }, []);

  const handlePatientInfoSubmit = useCallback((data: PatientInfoInput) => {
    setFormData((prev) => ({
      ...prev,
      ...data,
      email: data.email || "",
      symptoms: data.symptoms || "",
    }));
    setStep(4);
  }, []);

  const handleSubmit = async () => {
    const body = {
      menuId: formData.menuId,
      reservationDate: formData.date,
      reservationTime: formData.time,
      patientName: formData.patientName,
      patientKana: formData.patientKana,
      phone: formData.phone,
      email: formData.email || undefined,
      isFirstVisit: formData.isFirstVisit,
      symptoms: formData.symptoms || undefined,
      honeypot: formData.honeypot,
    };

    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const result = await res.json();
    if (!res.ok || !result.success) {
      throw new Error(result.error || "予約に失敗しました");
    }

    // Store reservation data for thanks page
    sessionStorage.setItem("reservationResult", JSON.stringify({
      ...result.reservation,
      isFirstVisit: formData.isFirstVisit,
    }));
    router.push("/reservation/thanks");
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                i + 1 <= step
                  ? "bg-sakura-400 text-white"
                  : "bg-gray-200 text-gray-400"
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`ml-1 text-xs hidden sm:inline ${
                i + 1 <= step ? "text-sakura-600" : "text-gray-400"
              }`}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div
                className={`w-8 h-0.5 mx-1 ${
                  i + 1 < step ? "bg-sakura-400" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      {step === 1 && (
        <StepMenu
          selectedMenuId={formData.menuId || null}
          onSelect={handleMenuSelect}
          onNext={() => setStep(2)}
        />
      )}
      {step === 2 && (
        <StepDateTime
          menuId={formData.menuId}
          selectedDate={formData.date || null}
          selectedTime={formData.time || null}
          onSelectDate={(date) => setFormData((p) => ({ ...p, date }))}
          onSelectTime={(time) => setFormData((p) => ({ ...p, time }))}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && (
        <StepPatientInfo
          defaultValues={{
            patientName: formData.patientName,
            patientKana: formData.patientKana,
            phone: formData.phone,
            email: formData.email,
            isFirstVisit: formData.isFirstVisit,
            symptoms: formData.symptoms,
          }}
          onSubmit={handlePatientInfoSubmit}
          onBack={() => setStep(2)}
        />
      )}
      {step === 4 && (
        <StepConfirm
          data={formData}
          onSubmit={handleSubmit}
          onEditStep={(s) => setStep(s)}
        />
      )}
    </div>
  );
}
