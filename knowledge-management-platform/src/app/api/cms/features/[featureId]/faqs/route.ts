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

  const faqs = await prisma.fAQ.findMany({
    where: { productFeatureId: params.featureId },
    orderBy: { order: "asc" },
  });

  return NextResponse.json(faqs);
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
  const { question, answer, order } = body;

  if (!question || !answer) {
    return NextResponse.json({ error: "question and answer are required" }, { status: 400 });
  }

  const faq = await prisma.fAQ.create({
    data: {
      question,
      answer,
      order: order ?? 0,
      productFeatureId: params.featureId,
    },
  });

  return NextResponse.json(faq, { status: 201 });
}
