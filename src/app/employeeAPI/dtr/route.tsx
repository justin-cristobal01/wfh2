import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { employeeId, timeIn, timeOut, remarks } = body;

        if (!employeeId) {
            return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
        }

        if (timeIn) {
            // Create a new record for "Time In"
            await prisma.dailyTimeRecord.create({
                data: {
                    employeeId,
                    date: new Date(),
                    timeIn: new Date(timeIn),
                    timeOut: null, 
                    remarks: remarks,
                },
            });
        } else if (timeOut) {
            // Find the latest record with a null timeOut
            const lastRecord = await prisma.dailyTimeRecord.findFirst({
                where: { employeeId, timeOut: null },
                orderBy: { date: "desc" }, // Get the latest record
            });
        
            if (!lastRecord) {
                return NextResponse.json({ error: "No active Time In record found" }, { status: 400 });
            }
        
            // Parse the timeOut and timeIn
            const timeIn = new Date(lastRecord.timeIn);  // Assume timeIn is a Date object
            const timeOutDate = new Date(timeOut);  // Convert string to Date object
        
            // Calculate duration in seconds
            const durationInSeconds = Math.floor((timeOutDate.getTime() - timeIn.getTime()) / 1000);
        
            // Update the found record with timeOut, duration, and remarks
            await prisma.dailyTimeRecord.update({
                where: { id: lastRecord.id },
                data: {
                    timeOut: timeOutDate,
                    duration: durationInSeconds,
                    remarks: remarks || "Clocked out",  // Use default remark if none is provided
                },
            });
            }
        else {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }

        return NextResponse.json({ message: "Daily Time Record updated successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error in DTR API:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

//fetch null time out to check if the last entry is time in

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const employeeId = searchParams.get("employeeId");

        if (!employeeId) {
            return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
        }
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);  
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);  

        
        const lastRecord = await prisma.dailyTimeRecord.findMany({
            where: {
                employeeId,
            },
        });

        return NextResponse.json(lastRecord, { status: 200 });
    } catch (error) {
        console.error("Error fetching last DTR:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
