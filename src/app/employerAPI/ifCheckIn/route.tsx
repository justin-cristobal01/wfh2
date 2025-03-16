import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Fetch employees' records for today
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId");

    if (!employeeId) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
    }
    
    // Get today's date (UTC) without the time part
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // Reset to start of the day

    const tomorrow = new Date(today);
    tomorrow.setUTCMinutes(0);
    tomorrow.setUTCHours(0, 0, 0, 0);
    tomorrow.setUTCDate(today.getUTCDate() + 1); // Move to next day

    const employees = await prisma.dailyTimeRecord.findFirst({
      where: {
        employeeId: employeeId,
        date: {
          gte: today, // Greater than or equal to today at 00:00:00
          lt: tomorrow, // Less than tomorrow at 00:00:00
        },
      },
    });

    return NextResponse.json({ message: "check employee" ,employees}, { status: 200 });
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json(
      { error: error.message || "An unknown error occurred" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect(); // Close the database connection after execution
  }
}
