import Event from "@/database/event.model";
import connectDB from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: {
    slug: string;
  };
}

/**
 * GET /api/events/[slug]
 *
 * Returns a single event by its slug.
 */
export async function GET(_req: NextRequest, {params}: {params: Promise<{slug: string}>}) {
  try {
    const { slug } = await params;

    // Basic validation for slug parameter.
    if (typeof slug !== "string" || slug.trim().length === 0) {
      return NextResponse.json(
        { message: "Invalid or missing slug parameter." },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the event by slug. Slug is stored in lowercase in the schema.
    const normalizedSlug = slug.trim().toLowerCase();
    const event = await Event.findOne({ slug: normalizedSlug }).lean().exec();

    if (!event) {
      return NextResponse.json(
        { message: "Event not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ event }, { status: 200 });
  } catch (error) {
    // Log full error on the server for debugging/monitoring.
    console.error("Error fetching event by slug:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch event.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}