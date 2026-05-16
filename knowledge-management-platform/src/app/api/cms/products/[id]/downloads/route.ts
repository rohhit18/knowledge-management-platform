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

  const downloads = await prisma.download.findMany({
    where: { productId: params.id },
    orderBy: { order: "asc" },
  });

  return NextResponse.json(downloads);
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
  const { name, fileUrl, description, fileType, fileSize, order } = body;

  if (!name || !fileUrl) {
    return NextResponse.json({ error: "name and fileUrl are required" }, { status: 400 });
  }

  const download = await prisma.download.create({
    data: {
      productId: params.id,
      name,
      fileUrl,
      ...(description !== undefined && { description }),
      ...(fileType !== undefined && { fileType }),
      ...(fileSize !== undefined && { fileSize }),
      ...(order !== undefined && { order }),
    },
  });

  return NextResponse.json(download, { status: 201 });
}
