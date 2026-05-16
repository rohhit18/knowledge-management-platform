import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const includeAll = searchParams.get("all") === "1";

  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;

  const courses = await prisma.course.findMany({
    where: {
      ...(!includeAll || !["SUPER_ADMIN", "ADMIN", "PRODUCT_MANAGER", "PROJECT_MANAGER"].includes(role ?? "") ? { published: true } : {}),
      ...(category ? { category: { slug: category } } : {})
    },
    include: {
      instructor: { select: { id: true, name: true, email: true } },
      category: { select: { id: true, name: true, slug: true } },
      tags: { select: { id: true, name: true } },
      courseModules: { select: { id: true, lessons: { select: { id: true } } } },
      _count: { select: { enrollments: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(courses);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id || !["SUPER_ADMIN", "ADMIN", "PRODUCT_MANAGER", "PROJECT_MANAGER"].includes(user.role ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description, thumbnail, categoryId, tagNames, published } = await req.json();
  if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

  const slug = slugify(title);
  const tags = tagNames?.length
    ? await Promise.all(
        (tagNames as string[]).map((name: string) =>
          prisma.tag.upsert({ where: { name }, create: { name }, update: {} })
        )
      )
    : [];

  const course = await prisma.course.create({
    data: {
      title, slug, description, thumbnail,
      published: published ?? false,
      instructorId: user.id,
      categoryId: categoryId ?? null,
      tags: { connect: tags.map((t) => ({ id: t.id })) }
    },
    include: {
      instructor: { select: { id: true, name: true, email: true } },
      category: { select: { id: true, name: true, slug: true } },
      tags: { select: { id: true, name: true } },
      courseModules: true
    }
  });

  return NextResponse.json(course, { status: 201 });
}
