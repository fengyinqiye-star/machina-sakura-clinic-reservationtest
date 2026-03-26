import { NextResponse } from "next/server";
import { getDbReady } from "@/db";
import { staff } from "@/db/schema";
import { and, eq, asc } from "drizzle-orm";
import { autoSeedStaffIfEmpty } from "@/db/auto-seed";

/**
 * Public API to get active practitioner staff for the reservation form.
 * Only returns minimal info needed for staff selection UI.
 */
export async function GET() {
  try {
    await autoSeedStaffIfEmpty();
    const db = await getDbReady();

    const activeStaff = await db
      .select({
        id: staff.id,
        name: staff.name,
        specialties: staff.specialties,
        profileImageUrl: staff.profileImageUrl,
        color: staff.color,
      })
      .from(staff)
      .where(and(eq(staff.isActive, true), eq(staff.role, "practitioner")))
      .orderBy(asc(staff.sortOrder));

    return NextResponse.json({ staff: activeStaff });
  } catch (error) {
    console.error("Failed to fetch staff:", error);
    return NextResponse.json({ staff: [] });
  }
}
