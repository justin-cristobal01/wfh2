import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

// POST: Create a new user
export async function POST(request: Request) {
  try {
    console.log("Received request to create user");

    const body = await request.json();
    console.log("Request body:", body);

    

    const { name, email, password, role } = body;

    if (!name || !email || !password || !role) {
      console.log("❌ Missing required fields");
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      console.log("❌ Email already exists:", email);
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("✅ Password hashed successfully");

    const roleEnum = body.role.toUpperCase();

    if (roleEnum !== "ADMIN" && roleEnum !== "EMPLOYEE") {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: {
        employeeId: String(body.employeeId),
        name: body.name,
        email: body.email,
        password: hashedPassword,
        role: roleEnum,
        status: "ACTIVE",
      },
    });

    console.log("✅ User created successfully:", user);
    return NextResponse.json({ message: "User created successfully", user }, { status: 201 });
  } catch (error: any) {
    console.error("❌ Error creating user:", error.message);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

// GET: Fetch all employees
export async function GET() {
  try {
    const employees = await prisma.user.findMany();
    return NextResponse.json(employees, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Error fetching employees" }, { status: 500 });
  }
}

// PUT: Edit user details
