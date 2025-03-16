import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!employeeId) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
    }

    let dateFilter = {}; // Default filter

    if (startDate && endDate) {
      // Convert start and end dates to Date objects
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Ensure end date includes the whole day
      end.setUTCHours(23, 59, 59, 999);

      dateFilter = {
        date: {
          gte: start,
          lte: end,
        },
      };
    }

    // Fetch attendance records based on filters
    const employees = await prisma.dailyTimeRecord.findMany({
      where: {
        employeeId: employeeId,
        ...dateFilter, // Apply date filter if provided
      },
    });

    return NextResponse.json({ message: "Attendance data retrieved", employees }, { status: 200 });

  } catch (error) {
    console.error("Error fetching attendance records:", error);
    return NextResponse.json(
      { error: error.message || "An unknown error occurred" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect(); // Ensure database connection is closed
  }
}
