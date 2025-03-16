import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// PUT request handler to update the user by employeeId
export async function PUT(request: Request, { params }: { params: { employeeId: string } }) {
  try {
    console.log("Received request to update user");

    const body = await request.json();
    console.log("Request body:", body);

    const { name, email, password, role, status } = body;
    const { employeeId } = params;  // Extract employeeId from the URL parameters

    // Validate required fields
    if (!employeeId || !name || !email || !role || !status) {
      console.log("❌ Missing required fields");
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if the email already exists in the database, but ignore if it's the same user's email
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser && existingUser.employeeId !== employeeId) {
      console.log("❌ Email already exists:", email);
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }

    // Hash password only if it's provided
    let hashedPassword = undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
      console.log("✅ Password hashed successfully");
    }

    // Validate role if provided
    const validRoles = ["ADMIN", "EMPLOYEE"];
    const roleEnum = role.toUpperCase();
    if (!validRoles.includes(roleEnum)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Update the user
    const updatedUser = await prisma.user.update({
      where: { employeeId },  // Using employeeId from the URL
      data: {
        name: name,
        email: email,
        password: hashedPassword || undefined, // Only update password if provided
        role: roleEnum,
        status: status,
        updatedAt: new Date(), // Set the updatedAt field
      },
    });

    console.log("✅ User updated successfully:", updatedUser);
    return NextResponse.json({ message: "User updated successfully", user: updatedUser }, { status: 200 });
  } catch (error: any) {
    console.error("❌ Error updating user:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
