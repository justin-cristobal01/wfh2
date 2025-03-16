import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { addDays, isToday } from "date-fns";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Fetch approved leave records
    const leaves = await prisma.leave.findMany({
      where: { status: "APPROVED" },
      select: { startDate: true, employeeId: true, endDate: true },
    });

    // Fetch ongoing activity logs
    const checkLatestActivity = await prisma.humanActivityLog.findMany({
      where: { end: null },
      select: { activity: true, employeeId: true },
    });

    // Find employees with null activityStatus
    const checkNull = await prisma.employeeDetails.findMany({
      where: { activityStatus: null },
      select: { employeeId: true },
    });

    // Mark employees as "On Leave" if their leave starts today
    for (const leave of leaves) {
      if (isToday(new Date(leave.startDate))) {
        await prisma.employeeDetails.updateMany({
          where: { 
            employeeId: leave.employeeId, 
            activityStatus: { not: "On Leave" } 
          },
          data: {
            activityStatus: "On Leave",
            updatedAt: new Date(),
          },
        });
      }
    }

    // Reset "On Leave" employees to "Active" the day after their leave ends
    for (const leave of leaves) {
      const nextDay = addDays(new Date(leave.endDate), 1);
      if (isToday(nextDay)) {
        await prisma.employeeDetails.updateMany({
          where: { 
            employeeId: leave.employeeId, 
            activityStatus: "On Leave" 
          },
          data: {
            activityStatus: "Active",
            updatedAt: new Date(),
          },
        });
      }
    }

    // Update activity status from latest activity logs
    for (const activityLog of checkLatestActivity) {
      await prisma.employeeDetails.updateMany({
        where: { employeeId: activityLog.employeeId },
        data: { activityStatus: activityLog.activity },
      });
    }

    // Set null activityStatus employees to "Active"
    for (const employee of checkNull) {
      await prisma.employeeDetails.updateMany({
        where: { employeeId: employee.employeeId },
        data: { activityStatus: "Active" },
      });
    }

    return NextResponse.json(
      { message: "Leave status updated successfully", checkLatestActivity, checkNull }, 
      { status: 200 }
    );

  } catch (error) {
    console.error("Error updating leave status:", error);
    return NextResponse.json(
      { 
        error: "Internal Server Error", 
        details: error.message, 
        stack: error.stack 
      }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(req: Request) {
  try {

    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId");

    if (!employeeId) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
    }

    // Check if employee exists before updating
    const employee = await prisma.employeeDetails.findUnique({
      where: { employeeId: employeeId },
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // Update employee's activity status to Active
    await prisma.employeeDetails.update({
      where: { employeeId: employeeId },
      data: { activityStatus: "Active" },
    });

    return NextResponse.json({ message: "Employee status updated to Active" }, { status: 200 });

  } catch (error) {
    console.error("Error updating employee status:", error);
    return NextResponse.json(
      { 
        error: "Internal Server Error", 
        details: error.message, 
        stack: error.stack 
      }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
