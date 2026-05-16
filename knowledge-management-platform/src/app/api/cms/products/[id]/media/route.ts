import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAdmin } from "@/lib/permissions";

interface Params { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const product = await prisma.product.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const media = await prisma.mediaItem.findMany({
    where: { productId: params.id },
    orderBy: { order: "asc" },
  });

  return NextResponse.json(media);
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

  const product = await prisma.product.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const { url, type, title, description, order } = body;

  if (!url) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  const mediaItem = await prisma.mediaItem.create({
    data: {
      productId: params.id,
      url,
      ...(type !== undefined && { type }),
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(order !== undefined && { order }),
    },
  });

  return NextResponse.json(mediaItem, { status: 201 });
}
