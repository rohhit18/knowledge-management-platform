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

  const downloads = await prisma.download.findMany({
    where: { productFeatureId: params.featureId },
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

  const body = await req.json();
  const { name, fileUrl, description, fileType, fileSize, order } = body;

  if (!name || !fileUrl) {
    return NextResponse.json({ error: "name and fileUrl are required" }, { status: 400 });
  }

  const download = await prisma.download.create({
    data: {
      name,
      fileUrl,
      description: description ?? null,
      fileType: fileType ?? null,
      fileSize: fileSize ?? null,
      order: order ?? 0,
      productFeatureId: params.featureId,
    },
  });

  return NextResponse.json(download, { status: 201 });
}
