import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAdmin } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !canAdmin(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role");

  const users = await prisma.user.findMany({
    where: role ? { role: role as never } : undefined,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      department: true,
      designation: true,
      createdAt: true,
      _count: { select: { documents: true, enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(users);
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !canAdmin(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id, role, department, designation } = await req.json();
  const user = await prisma.user.update({
    where: { id },
    data: { role, department, designation },
    select: { id: true, email: true, name: true, role: true },
  });
  return NextResponse.json(user);
}
