import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// PATCH request handler to deactivate the employee
export async function PATCH(
  request: Request,
  { params }: { params: { employeeId: string } }
) {
  try {
    console.log("🔹 Received request to deactivate user");

    const { employeeId } = params; // Keep as a string (e.g., "EMP5")

    if (!employeeId) {
      return NextResponse.json({ error: "Invalid Employee ID" }, { status: 400 });
    }

    // Check if the employee exists
    const existingEmployee = await prisma.user.findUnique({
      where: { employeeId }, // Keep it as a string
    });

    if (!existingEmployee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // Deactivate the employee (set status to "INACTIVE")
    const updatedUser = await prisma.user.update({
      where: { employeeId },
      data: {
        status: "INACTIVE",
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(
      { message: "✅ User deactivated successfully", user: updatedUser },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error deactivating user:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

