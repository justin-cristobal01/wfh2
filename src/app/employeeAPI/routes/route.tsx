import { NextResponse } from "next/server";

export async function GET() {
  const main='localhost:3000';
  const employeeAPIRoutes = [
    { method: "GET", path: "/employeeAPI/user", description: "Get all Users" },
    { method: "POST", path: "/employeeAPI/user", description: "Add a User" },
    { method: "PUT", path: "/employeeAPI/user", description: "Update a User" },
    { method: "DELETE", path: "/employeeAPI/user", description: "Delete a User" },
    { method: "GET", path: "/employeeAPI/employee", description: "Get all employees" },
    { method: "POST", path: "/employeeAPI/employee", description: "Add a new employee" },
    { method: "PUT", path: "/employeeAPI/employee", description: "Update an employee" },
    { method: "GET", path: "/employeeAPI/dailytimerecord", description: "Get all Daily Time Records" },
    { method: "POST", path: "/employeeAPI/dailytimerecord", description: "Add a new Daily Time Record" },
    { method: "PUT", path: "/employeeAPI/dailytimerecord", description: "Update a Daily Time Record" },
    { method: "GET", path: "/employeeAPI/dtrp", description: "Get all Daily Time Record Problems" },
    { method: "POST", path: "/employeeAPI/dtrp", description: "Add a new DTR Problem" },
    { method: "PUT", path: "/employeeAPI/dtrp", description: "Update a DTR Problem" },
    { method: "GET", path: "/employeeAPI/leave", description: "Get all Leave records" },
    { method: "POST", path: "/employeeAPI/leave", description: "Add a new Leave request" },
    { method: "PUT", path: "/employeeAPI/leave", description: "Update a Leave request" },
    { method: "GET", path: "/employeeAPI/overtime", description: "Get all Overtime records" },
    { method: "POST", path: "/employeeAPI/overtime", description: "Add a new Overtime request" },
    { method: "PUT", path: "/employeeAPI/overtime", description: "Update an Overtime request" },
  ];

  return NextResponse.json(employeeAPIRoutes, { status: 200 });
}
