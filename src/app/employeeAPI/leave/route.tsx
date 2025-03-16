import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Import the singleton Prisma client

// ✅ GET: Fetch all leave requests for a specific user with optional filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId");
    const leaveType = searchParams.get("leaveType");
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Pagination parameters
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    if (!employeeId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // 📌 Construct filter conditions
    const whereClause = {
      employeeId,
      ...(leaveType && { leaveType }),
      ...(status && { status }),
      ...(startDate && endDate && {
        AND: [
          { startDate: { gte: new Date(startDate) } },
          { endDate: { lte: new Date(endDate) } },
        ],
      }),
    };

    // 📌 Fetch leave requests with filters and pagination
    const [leaves, totalLeaves] = await prisma.$transaction([
      prisma.leave.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.leave.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(totalLeaves / pageSize);

    return NextResponse.json(
      { leaves, totalPages, totalLeaves, currentPage: page, pageSize },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching leaves:", error, error);
    return NextResponse.json({ error: "Internal Server Error", details: error }, { status: 500 });
  }
}

// ✅ POST: Create a new leave request
export async function POST(req: NextRequest) {
  try {
    const { employeeId, leaveType, startDate, endDate, reason } = await req.json();

    if (!employeeId || !leaveType || !startDate || !endDate || !reason) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Check if any leave requests already exist for this employee that overlap with the new date range
    const overlappingLeaves = await prisma.leave.findMany({
      where: {
        employeeId,
        status: { not: "REJECTED" }, 
        AND: [
          { startDate: { lte: new Date(endDate) } }, // Check if the new leave's end date is after any existing start date
          { endDate: { gte: new Date(startDate) } }, // Check if the new leave's start date is before any existing end date
        ],
      },
    });

    if (overlappingLeaves.length > 0) {
      return NextResponse.json(
        { error: "You already have a leave request within the specified date range" },
        { status: 400 }
      );
    }

    // 📌 Create a new leave request
    const newLeave = await prisma.leave.create({
      data: {
        employeeId,
        leaveType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        status: "PENDING",
      },
    });

    return NextResponse.json({ message: "Leave request submitted", leave: newLeave }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating leave request:", error.message, error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}


// ✅ DELETE: Remove a leave request
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Leave ID is required" }, { status: 400 });
    }

    // 🔍 Check if leave request exists
    const existingLeave = await prisma.leave.findUnique({ where: { id } });

    if (!existingLeave) {
      return NextResponse.json({ error: "Leave not found" }, { status: 404 });
    }

    // ❌ Delete the leave request
    await prisma.leave.delete({ where: { id } });

    return NextResponse.json({ message: "Leave request deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting leave request:", error.message, error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}

// ✅ PATCH: Update an existing leave request
export async function PATCH(req: NextRequest) {
  try {
    const { id, leaveType, startDate, endDate, reason, status } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Leave ID is required" }, { status: 400 });
    }

    // 🔍 Check if leave exists
    const existingLeave = await prisma.leave.findUnique({ where: { id } });

    if (!existingLeave) {
      return NextResponse.json({ error: "Leave not found" }, { status: 404 });
    }

    // Check if any leave requests already exist for this employee that overlap with the new date range (excluding the current leave request)
    const overlappingLeaves = await prisma.leave.findMany({
      where: {
        employeeId: existingLeave.employeeId,
        status: { not: "REJECTED" },
        AND: [
          { startDate: { lte: new Date(endDate) } },
          { endDate: { gte: new Date(startDate) } },
        ],
        NOT: {
          id: id, 
        },
      },
    });

    if (overlappingLeaves.length > 0) {
      return NextResponse.json(
        { error: "You already have a leave request within the specified date range" },
        { status: 400 }
      );
    }

    // 🔄 Update the leave request
    const updatedLeave = await prisma.leave.update({
      where: { id },
      data: {
        leaveType: leaveType || existingLeave.leaveType,
        startDate: startDate ? new Date(startDate) : existingLeave.startDate,
        endDate: endDate ? new Date(endDate) : existingLeave.endDate,
        reason: reason || existingLeave.reason,
        status: status ?? existingLeave.status,
      },
    });

    return NextResponse.json({ message: "Leave request updated successfully", leave: updatedLeave }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating leave request:", error.message, error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}