import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { canAdmin } from "@/lib/permissions";

export async function GET() {
  const platforms = await prisma.platform.findMany({
    include: {
      _count: { select: { products: true } },
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(platforms);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !canAdmin(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { name, description, logo } = await req.json();
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const platform = await prisma.platform.create({
    data: { name, slug: slugify(name), description, logo },
  });
  return NextResponse.json(platform, { status: 201 });
}
