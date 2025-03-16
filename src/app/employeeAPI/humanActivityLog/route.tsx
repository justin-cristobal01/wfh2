import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { timeStamp } from "console";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    // Extract data from the request body
    const { activity, employeeId, start, end, remarks } = await req.json();

    // Validate required fields
    if (!employeeId || !activity || !start ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create a log entry in the database
    const logEntry = await prisma.humanActivityLog.create({
      data: {
        activity,
        employeeId,
        start,
        end,
        remarks,  
      },
    });

    // if (activity === "Sleeping" || activity === "Idle") {
      
    //     await prisma.user.update({
    //       where: { employeeId: employeeId }, 
    //       data: {
    //         status: "INACTIVE", 
    //       },
    //     });
    // }
    
    // Return the created log entry as a response
    return NextResponse.json(logEntry, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// fetch logs for a specific employee
export async function GET(req: Request) {
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  try {
    const url = new URL(req.url);
    const employeeId = url.searchParams.get("employeeId");

    if (!employeeId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    writer.write(encoder.encode("event: open\ndata: Connection established\n\n"));
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    async function sendUpdates() {
      // Fetch the logs for the employee with all necessary details
      const logs = await prisma.humanActivityLog.findMany({
        where: { employeeId, 
          start: {
          gte: today, 
          lt: tomorrow, 
        }, },
        orderBy: { start: "desc" },
      });

      writer.write(encoder.encode(`data: ${JSON.stringify(logs)}\n\n`));
    }

    // Send updates every 3 seconds (adjust as needed)
    const interval = setInterval(sendUpdates, 3000);

    req.signal.addEventListener("abort", () => {
      clearInterval(interval);
      writer.close();
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("❌ Error fetching activity logs:", error);
    return NextResponse.json({ error: "Internal server error", details: error }, { status: 500 });
  }
}

// Update a log entry
export async function PUT(req: Request) {
  try {
    // Extract data from the request body and URL query parameters
    const { remarks, end } = await req.json();
    const url = new URL(req.url);
    const activity = url.searchParams.get("activity");
    const employeeId = url.searchParams.get("employeeId");

    // Validate required fields
    if (!employeeId || !activity || !remarks || !end) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Log the request parameters for debugging
    console.log("Received PUT request:", { activity, employeeId, remarks, end });

    // Find the existing activity log for the employee and activity
    const existingLog = await prisma.humanActivityLog.findFirst({
      where: { 
        employeeId, 
        activity,
        end:null,
      },
      orderBy: { start: 'desc' }, // Order by start date in descending order to get the latest one
    });


    if (!existingLog) {
      console.log(`Activity log not found for employee ${employeeId} and activity ${activity}`);
      return NextResponse.json({ error: "Activity log not found" }, { status: 404 });
    }
    const start = existingLog.start;
    const endTimestamp = new Date(end).getTime(); // Convert the provided end to a timestamp
    const startTimestamp = new Date(start).getTime(); // Convert the start timestamp to a timestamp

    // Calculate the duration in seconds
    const duration = (endTimestamp - startTimestamp) / 1000;

    // Update the activity log entry with remarks, end, and duration
    const updatedLog = await prisma.humanActivityLog.update({
      where: { id: existingLog.id },
      data: {
        remarks,
        end, // The end timestamp of the activity
        duration, // The duration in seconds
      },
    });
      await prisma.user.update({
        where: { employeeId: employeeId }, 
        data: {
          status: "ACTIVE", 
        },
      });
     
    // Return the updated log entry as a response
    return NextResponse.json(updatedLog, { status: 200 });
  } catch (error) {
    console.error("❌ Error updating activity log:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
