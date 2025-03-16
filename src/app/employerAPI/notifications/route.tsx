import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Fetch latest requests (only 1 each) and include createdAt, status, and employeeId
    const latestDTRP = await prisma.dailyTimeRecordProblem.findFirst({
      orderBy: { createdAt: "desc" },
      select: { id: true, createdAt: true, status: true, employeeId: true ,remarks: true ,type:true,date:true},
    });

    const latestLeave = await prisma.leave.findFirst({
      orderBy: { createdAt: "desc" },
      select: { id: true, createdAt: true, status: true, employeeId: true ,reason: true,leaveType:true,startDate:true,endDate:true}, // Include employeeId
    });

    // Fetch all pending requests
    const pendingDTRP = await prisma.dailyTimeRecordProblem.findMany({
      orderBy: { createdAt: "desc" },
      where: { status: "PENDING" },
      select: { id: true, createdAt: true, status: true, employeeId: true,remarks: true,type:true ,date:true },
    });

    const pendingLeave = await prisma.leave.findMany({
      orderBy: { createdAt: "desc" },
      where: { status: "PENDING" },
      select: { id: true, createdAt: true, status: true, employeeId: true ,reason:true ,leaveType:true ,startDate:true,endDate:true}, // Include employeeId
    });

    return NextResponse.json({
      latest: [
        latestDTRP ? { file_type: "DTRP", ...latestDTRP } : null,
        latestLeave ? { file_type: "Leave", ...latestLeave } : null,
      ].filter(Boolean), // Remove null values

      pending: [
        ...pendingDTRP.map((req) => ({ file_type: "DTRP", ...req })),
        ...pendingLeave.map((req) => ({ file_type: "Leave", ...req })),
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