import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    // Get the employeeId from the request's query parameters
    const url = new URL(request.url);
    const employeeId = url.searchParams.get('employeeId');

    if (!employeeId) {
      return NextResponse.json(
        { error: "Employee ID is required" },
        { status: 400 }
      );
    }

    // Fetch the latest DTRP and Leave requests for the specified employee
    const latestDTRP = await prisma.dailyTimeRecordProblem.findFirst({
      where: { employeeId: employeeId }, // Filter by employeeId
      orderBy: { createdAt: "desc" },
      select: { id: true, createdAt: true, status: true },
    });

    const latestOvertime = await prisma.overtime.findFirst({
      where: { employeeId: employeeId }, // Filter by employeeId
      orderBy: { createdAt: "desc" },
      select: { id: true, createdAt: true, status: true },
    });

    const latestLeave = await prisma.leave.findFirst({
      where: { employeeId: employeeId }, // Filter by employeeId
      orderBy: { createdAt: "desc" },
      select: { id: true, createdAt: true, status: true },
    });

    // Fetch all pending DTRP and Leave requests for the specified employee
    const pendingDTRP = await prisma.dailyTimeRecordProblem.findMany({
      where: { employeeId: employeeId, status: "PENDING" }, // Filter by employeeId and status
      select: { id: true, createdAt: true, status: true },
    });

    const pendingOvertime= await prisma.overtime.findMany({
      where: { employeeId: employeeId, status: "PENDING" }, // Filter by employeeId and status
      select: { id: true, createdAt: true, status: true },
    });

    const pendingLeave = await prisma.leave.findMany({
      where: { employeeId: employeeId, status: "PENDING" }, // Filter by employeeId and status
      select: { id: true, createdAt: true, status: true },
    });

    // Return the response with structured data
    return NextResponse.json({
      latest: [
        latestDTRP ? { type: "DTRP", ...latestDTRP } : null,
        latestOvertime ? { type: "Overtime", ...latestOvertime } : null,
        latestLeave ? { type: "Leave", ...latestLeave } : null,
      ].filter(Boolean), // Filter out null values
      pending: [
        ...pendingDTRP.map((req: any) => ({ type: "DTRP", ...req })),
        ...pendingOvertime.map((req: any) => ({ type: "Overtime", ...req })),
        ...pendingLeave.map((req: any) => ({ type: "Leave", ...req })),
      ],
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Error fetching notifications", details: error },
      { status: 500 }
    );
  }
}
