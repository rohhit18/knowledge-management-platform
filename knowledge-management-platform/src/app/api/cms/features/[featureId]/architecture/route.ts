import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAdmin } from "@/lib/permissions";

interface Params { params: { featureId: string } }

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sections = await prisma.architectureSection.findMany({
    where: { productFeatureId: params.featureId },
    orderBy: { order: "asc" },
  });

  return NextResponse.json(sections);
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!canAdmin(user.role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { title, description, imageUrl, order } = body;

  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const section = await prisma.architectureSection.create({
    data: {
      title,
      description: description ?? null,
      imageUrl: imageUrl ?? null,
      order: order ?? 0,
      productFeatureId: params.featureId,
    },
  });

  return NextResponse.json(section, { status: 201 });
}
