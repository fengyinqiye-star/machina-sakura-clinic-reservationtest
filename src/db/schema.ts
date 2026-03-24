import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const menus = sqliteTable("menus", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  category: text("category", {
    enum: ["acupuncture", "chiropractic", "massage"],
  }).notNull(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  duration: integer("duration").notNull(),
  price: integer("price").notNull(),
  targetSymptoms: text("target_symptoms"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const reservations = sqliteTable("reservations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  patientName: text("patient_name").notNull(),
  patientKana: text("patient_kana").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  menuId: text("menu_id")
    .notNull()
    .references(() => menus.id),
  reservationDate: text("reservation_date").notNull(),
  reservationTime: text("reservation_time").notNull(),
  isFirstVisit: integer("is_first_visit", { mode: "boolean" }).notNull(),
  symptoms: text("symptoms"),
  status: text("status", {
    enum: ["new", "confirmed", "completed", "cancelled"],
  })
    .notNull()
    .default("new"),
  staffMemo: text("staff_memo"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const schedules = sqliteTable("schedules", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  dayOfWeek: integer("day_of_week"),
  specificDate: text("specific_date"),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  slotInterval: integer("slot_interval").notNull().default(30),
  maxSlots: integer("max_slots").notNull().default(2),
  isHoliday: integer("is_holiday", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export type Menu = typeof menus.$inferSelect;
export type NewMenu = typeof menus.$inferInsert;
export type Reservation = typeof reservations.$inferSelect;
export type NewReservation = typeof reservations.$inferInsert;
export type Schedule = typeof schedules.$inferSelect;
export type NewSchedule = typeof schedules.$inferInsert;

export const staff = sqliteTable("staff", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  role: text("role", {
    enum: ["practitioner", "reception"],
  })
    .notNull()
    .default("practitioner"),
  specialties: text("specialties"),
  color: text("color").notNull().default("#f472b6"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const staffSchedules = sqliteTable("staff_schedules", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  staffId: text("staff_id")
    .notNull()
    .references(() => staff.id),
  dayOfWeek: integer("day_of_week"),
  specificDate: text("specific_date"),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  isOff: integer("is_off", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export type Staff = typeof staff.$inferSelect;
export type NewStaff = typeof staff.$inferInsert;
export type StaffSchedule = typeof staffSchedules.$inferSelect;
export type NewStaffSchedule = typeof staffSchedules.$inferInsert;
