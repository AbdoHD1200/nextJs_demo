import Image from "next/image";
import { Image as Main_image, ImageKitProvider } from "@imagekit/next";
import { notFound } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
if (!BASE_URL) throw new Error("NEXT_PUBLIC_BASE_URL is not configured");

// Utility function to safely parse agenda/tags data
// Handles both properly stored arrays and double-encoded string arrays
const safelyParseArray = (data: string | string[]): string[] => {
  // If it's already an array
  if (Array.isArray(data)) {
    // Check if first element is a JSON string (double-encoded)
    if (data.length > 0 && typeof data[0] === 'string' && data[0].startsWith('[')) {
      try {
        const parsed = JSON.parse(data[0]);
        return Array.isArray(parsed) ? parsed : data;
      } catch {
        return data;
      }
    }
    // Return the array as-is
    return data;
  }

  // If it's a single string, try to parse it
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [data];
    } catch {
      return [data];
    }
  }

  return [];
}

const EventDetailItem = ({ icon, alt, label }: { icon: string; alt: string; label: string }) => (
  <div className="flex-row-gap-2 items-center">

    <Image src={icon} alt={alt} width={17} height={17} />
    <p>{label}</p>
  </div>
)

const EventAgenda = ({ agendaItems }: { agendaItems: string[] }) => (
  <div>
    <h2>Agenda</h2>
    <ul>
      {agendaItems.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  </div>
)

const EventTags = ({ tags }: { tags: string[] }) => (
  <div className="flex flex-row gap-1.5 flex-wrap">
    {tags.map((tag) => (
      <div className="pill" key={tag}>{tag}</div>
    ))}
  </div>
)

const EventDetailsPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const response = await fetch(`${BASE_URL}/api/events/${slug}`);
  if (!response.ok) return notFound();

  const data = await response.json();
  const event = data?.event;
  if (!event?.description) return notFound();

  const { description, image, overview, date, time, location, mode, agenda, audience, tags, organizer } = event;

  return (
    <section id="event">
      <div className="header">
        <h1>Event Description</h1>
        <p>{description}</p>
      </div>

      <div className="details">
        {/* Left Side - Event Content */}
        <div className="content">
          {/* <Image src={image} alt="Event Banner" width={300} height={800} className="banner" /> */}
          <Main_image
            urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}
            src={image}
            alt="Event Banner"
            width={700}
            height={700}
          />

          <section className="flex-col-gap-2">
            <h2>Overview</h2>
            <p>{overview}</p>
          </section>

          <section className="flex-col-gap-2">
            <h2>Event Details</h2>
            <EventDetailItem icon="/icons/calendar.svg" alt="calendar" label={date} />
            <EventDetailItem icon="/icons/clock.svg" alt="clock" label={time} />
            <EventDetailItem icon="/icons/pin.svg" alt="pin" label={location} />
            <EventDetailItem icon="/icons/mode.svg" alt="mode" label={mode} />
            <EventDetailItem icon="/icons/audience.svg" alt="audience" label={audience} />
          </section>

          <EventAgenda agendaItems={safelyParseArray(agenda)} />

          <section className="flex-col-gap-2">
            <h2>About the Organizer</h2>
            <p>{organizer}</p>
          </section>

          <EventTags tags={safelyParseArray(tags)} />
        </div>

        {/* Right Side - Booking Form */}
        <aside className="booking">
          <p className="text-lg font-semibold">Book Event</p>
        </aside>

      </div>

    </section>
  )
}

export default EventDetailsPage;
