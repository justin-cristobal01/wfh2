import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ✅ GET: Fetch all overtime requests for a specific user with optional filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId");
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Pagination parameters
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    if (!employeeId) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
    }

    // Construct filter conditions
    const whereClause = {
      employeeId,
      ...(status && { status }),
      ...(startDate && endDate && {
        AND: [
          { startDate: { gte: new Date(startDate) } },
          { endDate: { lte: new Date(endDate) } },
        ],
      }),
    };

    // Fetch overtime requests with filters and pagination
    const [overtimes, totalOvertimes] = await prisma.$transaction([
      prisma.overtime.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.overtime.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(totalOvertimes / pageSize);

    return NextResponse.json(
      { overtimes, totalPages, totalOvertimes, currentPage: page, pageSize },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching overtime requests:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}


// ✅ POST: Create a new overtime request
export async function POST(req: NextRequest) {
  try {
    const { employeeId, startDate, endDate, reason } = await req.json();

    if (!employeeId || !startDate || !endDate || !reason) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Convert the provided startDate and endDate to Date objects
    const newStartDate = new Date(startDate);
    const newEndDate = new Date(endDate);

    // Check if there are any existing overtime requests that overlap with the new one
    const overlappingOvertimes = await prisma.overtime.findMany({
      where: {
        employeeId,
        status: { not: "REJECTED" }, 
        startDate: {
          lt: newEndDate, // New startDate should be before an existing endDate
        },
        endDate: {
          gt: newStartDate, // New endDate should be after an existing startDate
        },
      },
    });

    if (overlappingOvertimes.length > 0) {
      return NextResponse.json({ error: "❌ Overtime request overlaps with an existing request." }, { status: 400 });
    }

    // 📌 Create a new overtime request
    const newOvertime = await prisma.overtime.create({
      data: {
        employeeId,
        startDate: newStartDate,
        endDate: newEndDate,
        reason,
        status: "PENDING",
      },
    });

    return NextResponse.json(
      { message: "Overtime request submitted", overtime: newOvertime },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating overtime request:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error }, { status: 500 });
  }
}

// ✅ DELETE: Remove an overtime request
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Overtime ID is required" }, { status: 400 });
    }

    // 🔍 Check if overtime request exists
    const existingOvertime = await prisma.overtime.findUnique({ where: { id } });

    if (!existingOvertime) {
      return NextResponse.json({ error: "Overtime request not found" }, { status: 404 });
    }

    // ❌ Delete the overtime request
    await prisma.overtime.delete({ where: { id } });

    return NextResponse.json({ message: "Overtime request deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting overtime request:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error }, { status: 500 });
  }
}

// ✅ PATCH: Update an existing overtime request
export async function PATCH(req: NextRequest) {
  try {
    const { id, startDate, endDate, reason, status } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Overtime ID is required" }, { status: 400 });
    }

    // 🔍 Check if overtime request exists
    const existingOvertime = await prisma.overtime.findUnique({ where: { id } });

    if (!existingOvertime) {
      return NextResponse.json({ error: "Overtime request not found" }, { status: 404 });
    }

    // Convert the provided startDate and endDate to Date objects
    const newStartDate = startDate ? new Date(startDate) : existingOvertime.startDate;
    const newEndDate = endDate ? new Date(endDate) : existingOvertime.endDate;

    // Check if there are any existing overtime requests that overlap with the updated one
    const overlappingOvertimes = await prisma.overtime.findMany({
      where: {
        employeeId: existingOvertime.employeeId,
        id: { not: id }, // Exclude the current record from the check
        status: { not: "REJECTED" }, 
        startDate: {
          lt: newEndDate, // New startDate should be before an existing endDate
        },
        endDate: {
          gt: newStartDate, // New endDate should be after an existing startDate
        },
      },
    });

    if (overlappingOvertimes.length > 0) {
      return NextResponse.json({ error: "❌ Overtime request overlaps with an existing request." }, { status: 400 });
    }

    // 🔄 Update the overtime request
    const updatedOvertime = await prisma.overtime.update({
      where: { id },
      data: {
        startDate: newStartDate,
        endDate: newEndDate,
        reason: reason || existingOvertime.reason,
        status: status ?? existingOvertime.status,
      },
    });

    return NextResponse.json(
      { message: "Overtime request updated successfully", overtime: updatedOvertime },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating overtime request:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error }, { status: 500 });
  }
}