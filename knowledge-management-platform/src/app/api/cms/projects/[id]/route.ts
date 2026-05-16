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

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      slug: true,
      shortDescription: true,
      fullDescription: true,
      overviewText: true,
      bannerImage: true,
      metaTitle: true,
      metaDescription: true,
      keywords: true,
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(project);
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

  const existing = await prisma.project.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const {
    shortDescription,
    fullDescription,
    overviewText,
    bannerImage,
    metaTitle,
    metaDescription,
    keywords,
  } = body;

  const updated = await prisma.project.update({
    where: { id: params.id },
    data: {
      ...(shortDescription !== undefined && { shortDescription }),
      ...(fullDescription !== undefined && { fullDescription }),
      ...(overviewText !== undefined && { overviewText }),
      ...(bannerImage !== undefined && { bannerImage }),
      ...(metaTitle !== undefined && { metaTitle }),
      ...(metaDescription !== undefined && { metaDescription }),
      ...(keywords !== undefined && { keywords }),
    },
    select: {
      id: true,
      name: true,
      slug: true,
      shortDescription: true,
      fullDescription: true,
      overviewText: true,
      bannerImage: true,
      metaTitle: true,
      metaDescription: true,
      keywords: true,
    },
  });

  return NextResponse.json(updated);
}
