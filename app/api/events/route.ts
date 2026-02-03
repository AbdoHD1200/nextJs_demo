import Event from "@/database/event.model";
import connectDB from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { Buffer } from "buffer";
import { imagekit, type ImageKitUploadResult } from "@/lib/imagekit";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const formData = await req.formData();

    // ----- 1. Extract scalar fields -----
    const title = formData.get("title")?.toString().trim() || "";
    const description = formData.get("description")?.toString().trim() || "";
    const overview = formData.get("overview")?.toString().trim() || "";
    const venue = formData.get("venue")?.toString().trim() || "";
    const location = formData.get("location")?.toString().trim() || "";
    const date = formData.get("date")?.toString().trim() || "";
    const time = formData.get("time")?.toString().trim() || "";
    const mode = formData.get("mode")?.toString().trim() || "";
    const audience = formData.get("audience")?.toString().trim() || "";
    const organizer = formData.get("organizer")?.toString().trim() || "";

    // ----- 2. Extract list fields (agenda, tags) -----
    // If multiple inputs with same name are used, use getAll().
    // If a single comma-separated string is used, split on commas.
    const rawAgendaValues = formData.getAll("agenda").map((v) => v.toString().trim());
    const rawTagsValues = formData.getAll("tags").map((v) => v.toString().trim());

    const agenda: string[] =
      rawAgendaValues.length > 1
        ? rawAgendaValues.filter((v) => v.length > 0)
        : rawAgendaValues.length === 1
          ? rawAgendaValues[0]
            .split(",")
            .map((v) => v.trim())
            .filter((v) => v.length > 0)
          : [];

    const tags: string[] =
      rawTagsValues.length > 1
        ? rawTagsValues.filter((v) => v.length > 0)
        : rawTagsValues.length === 1
          ? rawTagsValues[0]
            .split(",")
            .map((v) => v.trim())
            .filter((v) => v.length > 0)
          : [];

    // ----- 3. Basic required field check before hitting Mongoose -----
    if (!title || !description || !overview || !venue || !location || !date || !time || !mode || !audience || !organizer) {
      return NextResponse.json(
        { message: "Missing required event fields." },
        { status: 400 }
      );
    }

    if (agenda.length === 0 || tags.length === 0) {
      return NextResponse.json(
        { message: "Agenda and tags must each contain at least one item." },
        { status: 400 }
      );
    }

    // ----- 4. Handle image upload -----
    const rawFile = formData.get("image");

    if (!rawFile || typeof (rawFile as any).arrayBuffer !== "function") {
      return NextResponse.json(
        { message: "Invalid image field. Expecting a file upload under 'image'." },
        { status: 400 }
      );
    }

    const file = rawFile as File;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = (await imagekit.upload({
      file: buffer,
      fileName: file.name || "event-photo.jpg",
      folder: "DevEvent",
    })) as ImageKitUploadResult;

    const image = uploadResult.url;

    // ----- 5. Build event payload that matches schema -----
    const eventPayload = {
      title,
      description,
      overview,
      image,
      venue,
      location,
      date,
      time,
      mode,
      audience,
      organizer,
      agenda,
      tags,
    };

    const createdEvent = await Event.create(eventPayload);

    return NextResponse.json(
      { message: "Event created successfully", event: createdEvent },
      { status: 201 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      {
        message: "Event Creation Failed",
        error: e instanceof Error ? e.message : "Unknown",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    const events = await Event.find().sort({ createdAt: -1});

    return NextResponse.json({ message: 'Events fetched successfully', events }, {status: 200});
  } catch (e) {
    return NextResponse.json({ message: 'Event fetching failed', error: e }, { status: 500});
  }
}