import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client"; // Correct Prisma import

const prisma = new PrismaClient(); // Initialize Prisma Client

// GET: Fetch all employees
export async function GET() {
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // Reset to start of the day

    const tomorrow = new Date(today);
    tomorrow.setUTCMinutes(0);
    tomorrow.setUTCHours(0, 0, 0, 0);
    tomorrow.setUTCDate(today.getUTCDate() + 1); // Move to next day
    const employees = await prisma.humanActivityLog.findMany({
      where: {
        start: {
          gte: today, // Greater than or equal to today at 00:00:00
          lt: tomorrow, // Less than tomorrow at 00:00:00
        },
      },
    });
    return NextResponse.json(employees, { status: 200 });
  } catch (error) {
    console.error("Error fetching employees:", error); // Logs full error details
    return NextResponse.json(
      { error: error.message || "An unknown error occurred" }, 
      { status: 500 }
    );
  }
}
