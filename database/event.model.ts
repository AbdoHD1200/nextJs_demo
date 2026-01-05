import mongoose, { Document, Model, Schema } from 'mongoose';

/**
 * Public shape of an Event entity used throughout the app.
 */
export interface IEvent {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string; // stored as ISO date string (YYYY-MM-DD)
  time: string; // stored as HH:MM (24h)
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Event document type as stored in MongoDB.
 */
export interface EventDocument extends IEvent, Document {}

export interface EventModel extends Model<EventDocument> {}

/**
 * Simple slug generator to create URL-friendly identifiers from titles.
 */
function generateSlug(title: string): string {
  return title
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace into dashes
    .replace(/-+/g, '-') // collapse consecutive dashes
    .replace(/^-|-$/g, ''); // trim leading/trailing dashes
}

/**
 * Event schema definition with validation and strong typing.
 */
const EventSchema = new Schema<EventDocument, EventModel>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    overview: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    venue: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: String,
      required: true,
      trim: true,
    },
    time: {
      type: String,
      required: true,
      trim: true,
    },
    mode: {
      type: String,
      required: true,
      trim: true,
    },
    audience: {
      type: String,
      required: true,
      trim: true,
    },
    agenda: {
      type: [String],
      required: true,
      validate: {
        validator(value: string[]): boolean {
          return Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === 'string' && item.trim().length > 0);
        },
        message: 'Agenda must be a non-empty array of non-empty strings.',
      },
    },
    organizer: {
      type: String,
      required: true,
      trim: true,
    },
    tags: {
      type: [String],
      required: true,
      validate: {
        validator(value: string[]): boolean {
          return Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === 'string' && item.trim().length > 0);
        },
        message: 'Tags must be a non-empty array of non-empty strings.',
      },
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

/**
 * Pre-save hook to:
 * - generate a unique, URL-safe slug from the title when needed
 * - normalize and validate date and time formats
 * - ensure required string fields are non-empty
 */
EventSchema.pre<EventDocument>('save', function preSave(next) {
  // Basic non-empty validation for required string fields.
  const requiredStringFields: (keyof IEvent)[] = [
    'title',
    'description',
    'overview',
    'image',
    'venue',
    'location',
    'date',
    'time',
    'mode',
    'audience',
    'organizer',
  ];

  for (const field of requiredStringFields) {
    const value = this[field];
    if (typeof value !== 'string' || value.trim().length === 0) {
      return next(new Error(`Field "${String(field)}" is required and cannot be empty.`));
    }
  }

  // Generate or update slug only when title has changed.
  if (this.isModified('title') || !this.slug) {
    this.slug = generateSlug(this.title);
  }

  // Normalize `date` to ISO date string (YYYY-MM-DD).
  if (this.isModified('date')) {
    const parsedDate = new Date(this.date);

    if (Number.isNaN(parsedDate.getTime())) {
      return next(new Error('Invalid date value. Expected a valid date string.'));
    }

    const year = parsedDate.getUTCFullYear();
    const month = String(parsedDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(parsedDate.getUTCDate()).padStart(2, '0');

    this.date = `${year}-${month}-${day}`;
  }

  // Enforce a consistent 24-hour HH:MM format for `time`.
  if (this.isModified('time')) {
    const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/; // 00:00 to 23:59

    if (!timePattern.test(this.time)) {
      return next(new Error('Invalid time format. Expected HH:MM in 24-hour format.'));
    }

    // Normalize to HH:MM (already enforced by regex; trim just in case).
    this.time = this.time.trim();
  }

  next();
});

// Create a unique index on slug for fast lookups and uniqueness guarantees.
EventSchema.index({ slug: 1 }, { unique: true });

export const Event: EventModel =
  (mongoose.models.Event as EventModel | undefined) || mongoose.model<EventDocument, EventModel>('Event', EventSchema);
