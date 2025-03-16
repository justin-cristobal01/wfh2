import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();



// Register a new Employee
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Request body:", body);

    if (!body.email) {
      return NextResponse.json({ error: "Missing Email" }, { status: 400 });
    }

    // Check if user already exists


    // Check if Employee already exists by email
    const existingEmployee = await prisma.employeeDetails.findUnique({
      where: { email: body.email },
    });

    if (existingEmployee) {
      return NextResponse.json({ error: "Employee with this email already exists" }, { status: 400 });
    }

    if(!body.scheduleTimein || !body.scheduleTimeout){
      return NextResponse.json({error: "Missing schedule"},{status:400})
    }

    // Ensure unique Employee ID generation
    // let newEmployeeId;
    // let isUnique = false;

    // while (!isUnique) {
    //   newEmployeeId = await generateEmployeeId();
    //   const existingId = await prisma.employeeDetails.findUnique({
    //     where: { employeeId: newEmployeeId },
    //   });

    //   if (!existingId) isUnique = true;
    // }

    // Create new EmployeeDetails entry
    const employee = await prisma.employeeDetails.create({
      data: {
        employeeId: String(body.employeeId),
        name: body.name,
        email: body.email,
        position: body.position,
        department: body.department,
        contactNumber: body.contactNumber || null,
        address: body.address || null,
        scheduleTimeIn: body.scheduleTimein || null,
        scheduleTimeOut: body.scheduleTimeout || null,
      },
    });

    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    console.error("❌ Error registering employee:", error);
    return NextResponse.json(
      { error: `Error registering employee: ${error.message || "Unknown error"}` },
      { status: 500 }
    );
  }
}

async function testConnection() {
  try {
    await prisma.$connect();
    console.log("✅ Connected to the database successfully!");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}


const generateEmployeeId = async () => {
  const lastEmployee = await prisma.user.findFirst({
    orderBy: { id: "desc" }, // Use the primary key (auto-incremented `id`) for correct ordering
  });

  let newIdNumber = 1;

  if (lastEmployee) {
    const lastIdNumber = await prisma.user.findMany({
      select: { employeeId: true },
    });

    // Extract numbers from employeeId and sort them
    const numericIds = lastIdNumber
      .map((e) => parseInt(e.employeeId.replace("EMP", ""), 10))
      .filter((num) => !isNaN(num))
      .sort((a, b) => b - a); // Sort descending

    if (numericIds.length > 0) {
      newIdNumber = numericIds[0] + 1; // Increment the highest number
    }
  }

  return `EMP${newIdNumber}`;
};


// GET method to fetch the latest employee ID
export async function GET() {
  try {
    await prisma.$connect(); // Ensure database is connected
    console.log("✅ Database connection successful!");
    const generatedEmployeeId = await generateEmployeeId();
    return NextResponse.json({ employeeId: generatedEmployeeId }, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching latest employee ID:", error);
    return NextResponse.json(
      { error: "Failed to fetch the latest employee ID", details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

