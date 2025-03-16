import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client"; // Correct Prisma import

const prisma = new PrismaClient(); // Initialize Prisma Client

// GET: Fetch all employees
export async function GET(req: Request) {
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();
  try {
  writer.write(encoder.encode("event: open\ndata: Connection established\n\n"));
  
      async function sendUpdates() {
        // Fetch the logs for the employee with all necessary details
        const logs = await prisma.humanActivityLog.findMany({
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
      return NextResponse.json( { error: "Internal server error", details: error.message || error.toString() }, { status: 500 });
    }
  }