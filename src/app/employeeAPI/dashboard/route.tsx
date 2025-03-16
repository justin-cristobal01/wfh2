import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const url = new URL(req.url);
  const employeeId = url.searchParams.get("employeeId");

  if (!employeeId) {
    return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
  }

  // Get today's date at midnight to filter timein records for today only
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set time to midnight (00:00:00)

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1); // Set time to tomorrow (00:00:00) for comparison

  try {
    // Fetch employee status
    const employeeStatus = await prisma.user.findUnique({
      where: { employeeId: employeeId },
      select: { status: true },
    });

    if (!employeeStatus) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    let dailyTimeRecord = null;

    // Infinite loop until we find the timeIn record
    while (!dailyTimeRecord || !dailyTimeRecord.timeIn) {
      // Fetch the daily time record for today
      dailyTimeRecord = await prisma.dailyTimeRecord.findFirst({
        where: {
          employeeId: employeeId,
          timeIn: {
            gte: today,  
            lt: tomorrow, 
          },
        },
        orderBy: {
          timeIn: "asc", 
        },
        select: { timeIn: true },
      });

      if (!dailyTimeRecord || !dailyTimeRecord.timeIn) {
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds
      }
    }

    const timein = new Date(dailyTimeRecord.timeIn); // Convert timein to Date object

    // Function to calculate total time spent in a given set of logs
    const calculateTimeSpent = (logs: any[]) => {
      return logs.reduce((total, log) => {
        const startTime = new Date(log.start);
        if (isNaN(startTime.getTime())) {
          console.warn(`Invalid start time for log: ${JSON.stringify(log)}`);
          return total;
        }
  
        const endTime = log.end ? new Date(log.end) : new Date();
        if (isNaN(endTime.getTime())) {
          console.warn(`Invalid end time for log: ${JSON.stringify(log)}`);
          return total;
        }
  
        return total + (endTime.getTime() - startTime.getTime());
      }, 0);
    };

    // Function to get and calculate the current time spent in Idle and Sleeping
    const getProductivityData = async () => {
      // Fetch the activity logs (Idle and Sleeping) for today
      const sleeping = await prisma.humanActivityLog.findMany({
        where: {
          employeeId,
          activity: "Sleeping",
          start: {
            gte: today,
          },
        },
      });

      const idle = await prisma.humanActivityLog.findMany({
        where: {
          employeeId,
          activity: "Idle",
          start: {
            gte: today,
          },
        },
      });

      const lastActivityLog = await prisma.humanActivityLog.findFirst({
        where: {
          employeeId,
          start: {
            gte: today, // Greater than or equal to today's midnight
          },
          end: null, // Ongoing activities (end is null)
        },
        orderBy: {
          start: "desc", // Get the most recent log
        },
        select: {
          activity: true,
        },
      });
  
      let wakefulnessStatus = "Awake"; // Default is "Awake"
      if (lastActivityLog) {
        if (lastActivityLog.activity === "Sleeping" || lastActivityLog.activity === "Idle") {
          wakefulnessStatus = lastActivityLog.activity;
        }
      }

      // Calculate idle and sleeping times
      const idleTime = calculateTimeSpent(idle);
      const sleepingTime = calculateTimeSpent(sleeping);

      // Calculate total time for the day (from first timein to now)
      const totalTime = new Date().getTime() - timein.getTime();

      // Calculate the total time spent in non-productive activities (Idle + Sleeping)
      const nonProductiveTime = idleTime + sleepingTime;

      // Calculate productivity percentage
      let productivityPercentage = 100;

      if (nonProductiveTime > 0) {
        productivityPercentage = ((totalTime - nonProductiveTime) / totalTime) * 100;
      }

      return { idleTime, sleepingTime, productivityPercentage,totalTime ,wakefulnessStatus};
    };


    

    // Prepare the response using TransformStream
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    // Send initial connection message
    writer.write(encoder.encode("event: open\ndata: Connection established\n\n"));

    // Function to send updates
    async function sendUpdates() {
      const { idleTime, sleepingTime, productivityPercentage,totalTime,wakefulnessStatus } = await getProductivityData();

      const message = {
        employeeStatus: employeeStatus.status,
        wakefulnessStatus: wakefulnessStatus, 
        productivityPercentage: Math.round(productivityPercentage),
        idleTime: idleTime,
        sleepingTime: sleepingTime,
        totaltime:totalTime,
      };

      console.log(`data: ${JSON.stringify(message)}\n\n`);
      writer.write(encoder.encode(`data: ${JSON.stringify(message)}\n\n`));
    }

    // Send updates every 3 seconds
    const interval = setInterval(sendUpdates, 3000);

    // Handle abort signal from client (when the request is canceled or closed)
    req.signal.addEventListener("abort", () => {
      clearInterval(interval);
      writer.close(); // Close the writer when done
    });

    // Return the readable stream
    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream", // Content type for SSE
        "Cache-Control": "no-cache",         // No caching
        "Connection": "keep-alive",          // Keep connection alive
      },
    });

  } catch (error) {
    console.error("❌ Error fetching dashboard data:", error);
    return NextResponse.json({ error: "Internal server error", details: error }, { status: 500 });
  }
}
