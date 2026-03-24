export type MenuCategory = "acupuncture" | "chiropractic" | "massage";
export type ReservationStatus = "new" | "confirmed" | "completed" | "cancelled";

export type MenuCategoryLabel = {
  [key in MenuCategory]: string;
};

export const MENU_CATEGORY_LABELS: MenuCategoryLabel = {
  acupuncture: "鍼灸",
  chiropractic: "整体",
  massage: "マッサージ",
};

export const STATUS_LABELS: Record<ReservationStatus, string> = {
  new: "新規",
  confirmed: "確認済み",
  completed: "完了",
  cancelled: "キャンセル",
};

export const STATUS_COLORS: Record<ReservationStatus, string> = {
  new: "bg-red-100 text-red-800",
  confirmed: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-600",
};

export interface TimeSlot {
  time: string;
  available: boolean;
  availableStaffCount?: number;
}

export interface ReservationFormData {
  menuId: string;
  menuName: string;
  category: string;
  duration: number;
  price: number;
  date: string;
  time: string;
  patientName: string;
  patientKana: string;
  phone: string;
  email: string;
  symptoms: string;
  isFirstVisit: boolean;
  agreedToPolicy: boolean;
  honeypot: string;
}

export interface DashboardData {
  todayReservations: ReservationWithMenu[];
  newCount: number;
  weekSummary: Record<string, number>;
}

export interface ReservationWithMenu {
  id: string;
  patientName: string;
  patientKana: string;
  phone: string;
  email: string | null;
  menuId: string;
  reservationDate: string;
  reservationTime: string;
  isFirstVisit: boolean;
  symptoms: string | null;
  status: ReservationStatus;
  staffMemo: string | null;
  createdAt: string;
  updatedAt: string;
  menuName?: string;
  menuCategory?: MenuCategory;
  menuDuration?: number;
  menuPrice?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export type StaffRole = "practitioner" | "reception";

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  practitioner: "施術者",
  reception: "受付",
};

export const DAY_OF_WEEK_LABELS = ["日", "月", "火", "水", "木", "金", "土"] as const;

export interface StaffScheduleEntry {
  dayOfWeek: number | null;
  specificDate: string | null;
  startTime: string;
  endTime: string;
  isOff: boolean;
}
