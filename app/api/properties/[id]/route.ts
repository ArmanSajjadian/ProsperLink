import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/properties/[id] — single property by id or slug
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Try by id first, then by slug
    const property = await prisma.property.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found." }, { status: 404 });
    }

    return NextResponse.json(property);
  } catch {
    return NextResponse.json({ error: "Failed to fetch property." }, { status: 500 });
  }
}
