import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAdmin } from "@/lib/permissions";

interface Params { params: { id: string; featureId: string } }

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const feature = await prisma.productFeature.findFirst({
    where: { id: params.featureId, productId: params.id },
  });

  if (!feature) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(feature);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!canAdmin(user.role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await prisma.productFeature.findFirst({
    where: { id: params.featureId, productId: params.id },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const { name, slug, overview, details, coverImage, status, order, metaTitle, metaDescription, keywords } = body;

  const feature = await prisma.productFeature.update({
    where: { id: params.featureId },
    data: {
      ...(name !== undefined && { name }),
      ...(slug !== undefined && { slug }),
      ...(overview !== undefined && { overview }),
      ...(details !== undefined && { details }),
      ...(coverImage !== undefined && { coverImage }),
      ...(status !== undefined && { status }),
      ...(order !== undefined && { order }),
      ...(metaTitle !== undefined && { metaTitle }),
      ...(metaDescription !== undefined && { metaDescription }),
      ...(keywords !== undefined && { keywords }),
    },
  });

  return NextResponse.json(feature);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!canAdmin(user.role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await prisma.productFeature.findFirst({
    where: { id: params.featureId, productId: params.id },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.productFeature.delete({ where: { id: params.featureId } });

  return NextResponse.json({ success: true });
}
