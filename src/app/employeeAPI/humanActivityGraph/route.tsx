import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Fetch logs for a specific employee with real-time updates using SSE
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const employeeId = url.searchParams.get("employeeId");

    if (!employeeId) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
    }

    // Get today's date, ignoring the time part
    const today = new Date();
    today.setHours(0, 0, 0, 0);  // Set time to midnight

    // Create a readable stream for SSE
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    // Function to send updates
    async function sendUpdates() {
      const today = new Date();
      today.setHours(0, 0, 0, 0); 
  
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      // Fetch logs for the specific employee, only for today's date
      const logs = await prisma.humanactivitylog.findMany({
        where: {
          employeeId,
          activity: { not: "Yawning" },
          start: {
            gte: today, 
            lt: tomorrow, 
          },
        },
        select: {
          activity: true,
          start: true,
          end: true,
          employeeId: true,
        },
        orderBy: { start: "desc" },
      });

      // Log the fetched logs to the console

      // Send logs as SSE event
      writer.write(encoder.encode(`event: update\ndata: ${JSON.stringify(logs)}\n\n`));
    }

    // Send updates every 5 seconds (can adjust the interval as needed)
    const interval = setInterval(sendUpdates, 5000);

    // If the connection is closed, stop the interval
    req.signal.addEventListener("abort", () => {
      clearInterval(interval);
      writer.close();
    });

    // Return the stream as the response
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
