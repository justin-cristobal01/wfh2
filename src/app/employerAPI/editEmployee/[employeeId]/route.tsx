// app/employerAPI/editEmployee/[employeeId]/route.tsx
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(request: Request, { params }: { params: { employeeId: string } }) {
  try {
    console.log("Received request to update employee");
    console.log("Employee ID from URL:", params.employeeId);  // Log the employeeId to check if it's coming through

    const body = await request.json();
    console.log("Request body:", body);

    const { name, email, position, department, contactNumber, address ,scheduleTimeIn,scheduleTimeOut } = body;
    const { employeeId } = params;  // Extract employeeId from the URL params

    
    // Your logic here (validation, updating employee data)

    const updatedEmployee = await prisma.employeeDetails.update({
      where: { employeeId },
      data: {
        name,
        email,
        position,
        department,
        contactNumber,
        address,
        scheduleTimeIn,
        scheduleTimeOut,
        updatedAt: new Date(),
      },
    });

    console.log("✅ Employee updated successfully:", updatedEmployee);
    return NextResponse.json({ message: "Employee updated successfully", user: updatedEmployee }, { status: 200 });
  } catch (error: any) {
    console.error("❌ Error updating employee:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
