const mongoose = require("mongoose");
const {
  buildDefaultTickets,
  inferIsFreeEventFromTickets,
  normalizeTicketEntry,
} = require("../utils/ticketing");

const ticketTypeSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      trim: true,
      default: "general",
    },
    label: {
      type: String,
      default: "",
      trim: true,
      maxlength: 60,
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalSeats: {
      type: Number,
      required: true,
      min: 1,
    },
    description: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const eventSchema = new mongoose.Schema(
  {
    societyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Society",
      default: null,
    },
    societyRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SocietyRequest",
      default: null,
    },
    title: {
      type: String,
      required: [true, "Title required"],
      trim: true,
      minlength: [5, "Min 5 chars"],
      maxlength: [100, "Max 100 chars"],
    },
    description: {
      type: String,
      required: [true, "Description required"],
      minlength: [20, "Min 20 chars"],
      maxlength: [1000, "Max 1000 chars"],
    },
    shortDescription: {
      type: String,
      default: null,
      maxlength: 200,
    },
    date: {
      type: String,
      required: [true, "Date required"],
    },
    time: {
      type: String,
      default: null,
    },
    venue: {
      type: String,
      required: [true, "Venue required"],
      trim: true,
    },
    category: {
      type: String,
      default: "Other",
      trim: true,
    },
    organizer: {
      type: String,
      required: [true, "Organizer required"],
      trim: true,
    },
    organizerEmail: {
      type: String,
      required: [true, "Email required"],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email"],
    },
    organizerContact: {
      email: {
        type: String,
        default: null,
      },
      phone: {
        type: String,
        default: null,
      },
    },
    maxParticipants: {
      type: Number,
      default: 100,
      min: [1, "Min 1"],
    },
    tickets: {
      type: [ticketTypeSchema],
      default: [],
    },
    isFreeEvent: {
      type: Boolean,
      default: false,
    },
    totalSeats: {
      type: Number,
      default: 0,
      min: 0,
    },
    bookedSeats: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: [
        "draft",
        "pending",
        "approved",
        "published",
        "rejected",
        "cancelled",
        "upcoming",
        "active",
        "completed",
      ],
      default: "pending",
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    adminReason: {
      type: String,
      default: null,
    },
    adminActionAt: {
      type: Date,
      default: null,
    },
    image: {
      type: String,
      default: null,
    },
    bannerImage: {
      type: String,
      default: null,
    },
    location: {
      address: {
        type: String,
        default: null,
      },
      city: {
        type: String,
        default: null,
      },
      mapLink: {
        type: String,
        default: null,
      },
    },
    requirements: {
      type: String,
      default: null,
    },
    agenda: {
      type: String,
      default: null,
    },
    speakers: [
      {
        name: {
          type: String,
          default: null,
        },
        title: {
          type: String,
          default: null,
        },
        bio: {
          type: String,
          default: null,
        },
        photo: {
          type: String,
          default: null,
        },
      },
    ],
    reminderSent7Days: {
      type: Boolean,
      default: false,
    },
    reminderSent1Day: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

eventSchema.pre("save", function preSave(next) {
  const fallbackSeats =
    Number.isFinite(Number(this.maxParticipants)) && Number(this.maxParticipants) > 0
      ? Number(this.maxParticipants)
      : 100;
  const inferredIsFreeEvent =
    typeof this.isFreeEvent === "boolean"
      ? this.isFreeEvent
      : inferIsFreeEventFromTickets(this.tickets, false);

  if (!Array.isArray(this.tickets) || this.tickets.length === 0) {
    this.tickets = buildDefaultTickets(fallbackSeats, inferredIsFreeEvent);
  }

  this.tickets = this.tickets.map((ticket, index) =>
    normalizeTicketEntry(ticket, fallbackSeats, {
      isFreeEvent: inferredIsFreeEvent,
      index,
    })
  );
  this.isFreeEvent = inferredIsFreeEvent;

  this.totalSeats = this.tickets.reduce((sum, ticket) => sum + Number(ticket.totalSeats || 0), 0);

  if (!this.shortDescription && this.description) {
    this.shortDescription = this.description.trim().slice(0, 160);
  }

  if (!this.bannerImage && this.image) {
    this.bannerImage = this.image;
  }

  if (!this.image && this.bannerImage) {
    this.image = this.bannerImage;
  }

  if (["approved", "published", "upcoming", "active"].includes(String(this.status).toLowerCase())) {
    this.isPublished = true;
  }

  if (["rejected", "cancelled", "pending", "draft"].includes(String(this.status).toLowerCase())) {
    this.isPublished = false;
  }

  if (this.bookedSeats > this.totalSeats) {
    this.bookedSeats = this.totalSeats;
  }

  next();
});

eventSchema.index({ date: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ organizerEmail: 1 });
eventSchema.index({ isPublished: 1 });

module.exports = mongoose.models.Event || mongoose.model("Event", eventSchema);
