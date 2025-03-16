import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client"; // Correct Prisma import

const prisma = new PrismaClient(); // Initialize Prisma Client

// GET: Fetch all employees
export async function GET() {
  try {
    const employees = await prisma.employeeDetails.findMany();
    return NextResponse.json(employees, { status: 200 });
  } catch (error) {
    console.error("Error fetching employees:", error); // Logs full error details
    return NextResponse.json(
      { error: error.message || "An unknown error occurred" }, 
      { status: 500 }
    );
  }
}
// POST: Add a new employee
export async function POST(req: Request) {
  try {
    const body = await req.json(); // Await the JSON body
    const newEmployee = await prisma.employeeDetails.create({
      data: body,
    });
    return NextResponse.json(newEmployee, { status: 201 });
  } catch (error) {
    console.error("Error adding employee:", error);
    return NextResponse.json({ error: "Error adding employee" }, { status: 500 });
  }
}

// PUT: Update an existing employee
export async function PUT(req: Request) {
  try {
    const body = await req.json(); // Await the JSON body
    const { id, ...data } = body;

    // Ensure the `id` field is provided
    if (!id) {
      return NextResponse.json({ error: "Missing employee ID" }, { status: 400 });
    }

    const updatedEmployee = await prisma.employeeDetails.update({
      where: { id },
      data,
    });

    return NextResponse.json(updatedEmployee, { status: 200 });
  } catch (error) {
    console.error("Error updating employee:", error);
    return NextResponse.json({ error: "Error updating employee" }, { status: 500 });
  }
}
