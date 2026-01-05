import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { Event, EventDocument } from './event.model';

/**
 * Public shape of a Booking entity.
 */
export interface IBooking {
  eventId: Types.ObjectId;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Booking document type as stored in MongoDB.
 */
export interface BookingDocument extends IBooking, Document {}

export interface BookingModel extends Model<BookingDocument> {}

/**
 * Simple email format validator for basic sanity checking.
 */
function isValidEmail(email: string): boolean {
  // Intentionally strict but not overly complex RegExp for production use.
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

const BookingSchema = new Schema<BookingDocument, BookingModel>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate: {
        validator(value: string): boolean {
          return isValidEmail(value);
        },
        message: 'Invalid email address.',
      },
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

/**
 * Pre-save hook to enforce referential integrity and validate email.
 *
 * - Ensures the referenced Event exists.
 * - Performs a final, explicit email format check.
 */
BookingSchema.pre<BookingDocument>('save', async function preSave(next) {
  // Final sanity check for email format in case the document is mutated directly.
  if (!this.email || !isValidEmail(this.email)) {
    return next(new Error('Invalid email address.'));
  }

  // Ensure the referenced event exists before saving a booking.
  try {
    const exists = await Event.exists({ _id: this.eventId } as Partial<EventDocument>);

    if (!exists) {
      return next(new Error('Cannot create booking: referenced event does not exist.'));
    }

    return next();
  } catch (error) {
    return next(error as Error);
  }
});

// Explicit index on eventId to optimize lookups by event.
BookingSchema.index({ eventId: 1 });

export const Booking: BookingModel =
  (mongoose.models.Booking as BookingModel | undefined) ||
  mongoose.model<BookingDocument, BookingModel>('Booking', BookingSchema);
