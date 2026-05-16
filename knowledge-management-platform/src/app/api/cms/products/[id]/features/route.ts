import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
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

  const features = await prisma.productFeature.findMany({
    where: { productId: params.id },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });

  return NextResponse.json(features);
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
  const { name, overview, details, coverImage, status, order, metaTitle, metaDescription, keywords } = body;

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  // Generate a unique slug within this product
  const baseSlug = slugify(name);
  let slug = baseSlug;
  let suffix = 2;

  while (true) {
    const collision = await prisma.productFeature.findFirst({
      where: { productId: params.id, slug },
      select: { id: true },
    });
    if (!collision) break;
    slug = `${baseSlug}-${suffix}`;
    suffix++;
  }

  const feature = await prisma.productFeature.create({
    data: {
      name,
      slug,
      productId: params.id,
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

  return NextResponse.json(feature, { status: 201 });
}
