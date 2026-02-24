import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// GET /api/properties — public listing of all FUNDING/FUNDED/ACTIVE properties
export async function GET() {
  try {
    const properties = await prisma.property.findMany({
      where: { status: { not: "DRAFT" } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(properties);
  } catch {
    return NextResponse.json({ error: "Failed to fetch properties." }, { status: 500 });
  }
}

// POST /api/properties — create a new property listing (owner only)
export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

    if (user.role !== "OWNER" && user.role !== "BOTH") {
      return NextResponse.json({ error: "Only property owners can list properties." }, { status: 403 });
    }

    const body = await req.json();
    const {
      name, description, type, imageUrl, address, city, state,
      totalValue, targetRaise, annualYield,
      highlights, bedrooms, bathrooms, sqft, yearBuilt,
      spvEntity, jurisdiction,
    } = body;

    // Basic validation
    if (!name || !description || !address || !city || !state) {
      return NextResponse.json({ error: "Missing required property fields." }, { status: 400 });
    }

    const tokenPrice = 1.25;
    const totalTokens = Math.floor((targetRaise ?? totalValue) / tokenPrice);
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const property = await prisma.property.create({
      data: {
        slug,
        name,
        description,
        type: type ?? "Residential",
        imageUrl: imageUrl ?? "",
        address,
        city,
        state,
        totalValue: Number(totalValue),
        totalTokens,
        tokenPrice,
        annualYield: Number(annualYield ?? 0),
        fundedAmount: 0,
        status: "DRAFT",
        spvEntity: spvEntity ?? "",
        jurisdiction: jurisdiction ?? "",
        ownerId: user.id,
        highlights: highlights ?? [],
        bedrooms: bedrooms ? Number(bedrooms) : null,
        bathrooms: bathrooms ? Number(bathrooms) : null,
        sqft: sqft ? Number(sqft) : null,
        yearBuilt: yearBuilt ? Number(yearBuilt) : null,
      },
    });

    return NextResponse.json({ success: true, propertyId: property.id, slug: property.slug }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create property." }, { status: 500 });
  }
}
