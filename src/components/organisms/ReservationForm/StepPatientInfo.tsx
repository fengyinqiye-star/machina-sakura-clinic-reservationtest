"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Textarea from "@/components/atoms/Textarea";
import FormField from "@/components/molecules/FormField";
import FirstVisitNotice from "./FirstVisitNotice";
import { patientInfoSchema, type PatientInfoInput } from "@/lib/validators/reservation";

interface StepPatientInfoProps {
  defaultValues: PatientInfoInput;
  onSubmit: (data: PatientInfoInput) => void;
  onBack: () => void;
}

export default function StepPatientInfo({
  defaultValues,
  onSubmit,
  onBack,
}: StepPatientInfoProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PatientInfoInput>({
    resolver: zodResolver(patientInfoSchema),
    defaultValues,
  });

  const isFirstVisit = watch("isFirstVisit");
  const symptomsLength = watch("symptoms")?.length || 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h3 className="font-serif text-xl font-bold text-gray-800">
        Step 3: お客様情報の入力
      </h3>

      <FormField label="氏名" required htmlFor="patientName">
        <Input
          id="patientName"
          placeholder="山田 太郎"
          error={errors.patientName?.message}
          {...register("patientName")}
        />
      </FormField>

      <FormField label="フリガナ" required htmlFor="patientKana">
        <Input
          id="patientKana"
          placeholder="ヤマダ タロウ"
          error={errors.patientKana?.message}
          {...register("patientKana")}
        />
      </FormField>

      <FormField label="電話番号" required htmlFor="phone">
        <Input
          id="phone"
          type="tel"
          placeholder="09012345678"
          error={errors.phone?.message}
          {...register("phone")}
        />
      </FormField>

      <FormField label="メールアドレス" required htmlFor="email">
        <Input
          id="email"
          type="email"
          placeholder="example@mail.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <p className="text-xs text-sakura-500 mt-1">
          ※ 予約確認メールを自動送信します
        </p>
      </FormField>

      <FormField label="来院歴" required>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
            <input
              type="radio"
              value="true"
              className="w-4 h-4 text-sakura-400"
              {...register("isFirstVisit", { setValueAs: (v) => v === "true" })}
              defaultChecked={defaultValues.isFirstVisit === true}
            />
            <span>初診（初めて）</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
            <input
              type="radio"
              value="false"
              className="w-4 h-4 text-sakura-400"
              {...register("isFirstVisit", { setValueAs: (v) => v === "true" })}
              defaultChecked={defaultValues.isFirstVisit === false}
            />
            <span>再診</span>
          </label>
        </div>
      </FormField>

      {isFirstVisit && <FirstVisitNotice />}

      <FormField label="症状・ご要望（任意）" htmlFor="symptoms">
        <Textarea
          id="symptoms"
          placeholder="気になる症状やご要望がありましたらご記入ください"
          maxLength={500}
          currentLength={symptomsLength}
          error={errors.symptoms?.message}
          {...register("symptoms")}
        />
      </FormField>

      {/* Honeypot - hidden from users */}
      <div className="hidden" aria-hidden="true">
        <input type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="secondary" onClick={onBack}>
          戻る
        </Button>
        <Button type="submit">確認画面へ</Button>
      </div>
    </form>
  );
}
