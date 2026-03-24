import { getResend } from "./client";
import { CLINIC_INFO } from "@/lib/constants";

interface ReservationEmailData {
  id: string;
  patientName: string;
  patientKana: string;
  phone: string;
  email?: string | null;
  menuName: string;
  menuCategory: string;
  reservationDate: string;
  reservationTime: string;
  isFirstVisit: boolean;
  symptoms?: string | null;
}

export async function sendClinicNotification(data: ReservationEmailData) {
  const adminUrl = `${process.env.NEXTAUTH_URL}/admin/reservations/${data.id}`;
  const resend = getResend();
  if (!resend) {
    console.warn("Resend API key not configured, skipping clinic notification email");
    return;
  }

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "noreply@sakura-clinic.resend.dev",
      to: process.env.CLINIC_EMAIL!,
      subject: `[${CLINIC_INFO.name}] 新規予約: ${data.patientName}様 ${data.reservationDate} ${data.reservationTime}`,
      html: `
        <h2>新規予約が入りました</h2>
        <table style="border-collapse:collapse;width:100%;max-width:500px;">
          <tr><th style="text-align:left;padding:8px;border-bottom:1px solid #eee;width:120px;">患者名</th><td style="padding:8px;border-bottom:1px solid #eee;">${data.patientName} (${data.patientKana})</td></tr>
          <tr><th style="text-align:left;padding:8px;border-bottom:1px solid #eee;">電話番号</th><td style="padding:8px;border-bottom:1px solid #eee;">${data.phone}</td></tr>
          ${data.email ? `<tr><th style="text-align:left;padding:8px;border-bottom:1px solid #eee;">メール</th><td style="padding:8px;border-bottom:1px solid #eee;">${data.email}</td></tr>` : ""}
          <tr><th style="text-align:left;padding:8px;border-bottom:1px solid #eee;">施術メニュー</th><td style="padding:8px;border-bottom:1px solid #eee;">${data.menuName} (${data.menuCategory})</td></tr>
          <tr><th style="text-align:left;padding:8px;border-bottom:1px solid #eee;">予約日時</th><td style="padding:8px;border-bottom:1px solid #eee;">${data.reservationDate} ${data.reservationTime}</td></tr>
          <tr><th style="text-align:left;padding:8px;border-bottom:1px solid #eee;">来院歴</th><td style="padding:8px;border-bottom:1px solid #eee;">${data.isFirstVisit ? "初診" : "再診"}</td></tr>
          ${data.symptoms ? `<tr><th style="text-align:left;padding:8px;border-bottom:1px solid #eee;">症状・ご要望</th><td style="padding:8px;border-bottom:1px solid #eee;">${data.symptoms}</td></tr>` : ""}
        </table>
        <p style="margin-top:20px;"><a href="${adminUrl}" style="background:#F4A7B9;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px;">管理画面で確認</a></p>
      `,
    });
  } catch (error) {
    console.error("Failed to send clinic notification email:", error);
  }
}

export async function sendPatientConfirmation(data: ReservationEmailData) {
  if (!data.email) return;

  const resend = getResend();
  if (!resend) {
    console.warn("Resend API key not configured, skipping patient confirmation email");
    return;
  }

  const phone = CLINIC_INFO.phone;

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "noreply@sakura-clinic.resend.dev",
      to: data.email,
      subject: `[${CLINIC_INFO.name}] ご予約を受け付けました`,
      html: `
        <div style="max-width:600px;margin:0 auto;font-family:sans-serif;">
          <h2 style="color:#D4879A;">${CLINIC_INFO.name}</h2>
          <p>${data.patientName}様</p>
          <p>ご予約を受け付けました。以下の内容をご確認ください。</p>

          <div style="background:#FDF8F5;padding:20px;border-radius:8px;margin:20px 0;">
            <h3 style="margin-top:0;">ご予約内容</h3>
            <p><strong>施術メニュー:</strong> ${data.menuName}</p>
            <p><strong>予約日時:</strong> ${data.reservationDate} ${data.reservationTime}</p>
            <p><strong>お名前:</strong> ${data.patientName}様</p>
          </div>

          <div style="background:#FFF3CD;padding:15px;border-radius:8px;margin:20px 0;">
            <p style="margin:0;"><strong>こちらは仮予約です。</strong></p>
            <p style="margin:5px 0 0;">院からの確認連絡をお待ちください。</p>
          </div>

          ${
            data.isFirstVisit
              ? `
          <div style="background:#E8F5E9;padding:15px;border-radius:8px;margin:20px 0;">
            <h3 style="margin-top:0;">初めてご来院の方へ</h3>
            <ul>
              <li>予約時間の10分前にお越しください（問診票のご記入があります）</li>
              <li>動きやすい服装でお越しください</li>
              <li>健康保険証をお持ちください</li>
            </ul>
          </div>
          `
              : ""
          }

          <div style="background:#FFEBEE;padding:15px;border-radius:8px;margin:20px 0;">
            <h3 style="margin-top:0;">キャンセル・変更について</h3>
            <p>予約のキャンセル・変更はお電話にてご連絡ください。</p>
            <p style="font-size:1.2em;"><strong>TEL: ${phone}</strong></p>
          </div>

          <hr style="margin:30px 0;border:none;border-top:1px solid #eee;">
          <p style="color:#666;font-size:0.9em;">
            ${CLINIC_INFO.name}<br>
            ${CLINIC_INFO.address}<br>
            TEL: ${phone}<br>
            営業時間: 月〜金 9:00-12:30 / 15:00-20:00、土 9:00-14:00<br>
            定休日: ${CLINIC_INFO.closedDays}
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send patient confirmation email:", error);
  }
}
