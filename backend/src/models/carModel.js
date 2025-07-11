const mongoose = require("mongoose");

const carSchema = new mongoose.Schema(
  {
    mainPhoto: {
      type: String,
      required: true,
      match: /^https?:\/\/.+/,
    },
    additionalPhotos: {
      type: [String],
      validate: [arrayLimit, "You can only have up to 4 additional images."],
    },
    licensePlate: {
      type: String,
      required: true,
      unique: true,
    },
    color: {
      type: String,
      required: true,
    },
    make: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },

    mileage: {
      type: Number,
      required: true,
      min: 0,
    },
    pricePerDay: {
      type: Number,
      required: true,
      min: 0,
    },
    carbonFootprint: {
      type: Number,
      min: 0,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "SUV",
        "Sedan",
        "Hatchback",
        "Coupe",
        "Cabriolet",
        "Van",
        "Truck",
        "Minibus",
        "Luxury",
        "Sports",
      ],
    },
    fuelType: {
      type: String,
      required: true,
      enum: ["Gasoline", "Diesel", "Electric", "Hybrid"],
    },
    transmissionType: {
      type: String,
      required: true,
      enum: ["Manual", "Automatic"],
    },
    description: {
      type: String,
    },
    availabilityStatus: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    location: {
      city: {
        type: String,
        required: true,
      },
      spots: {
        type: [String],
        validate: [
          arraySpotLimit,
          "You can only have up to 5 drop-off/pick-up spots.",
        ],
      },
    },

    disabled: {
      type: Boolean,
      required: true,
    },
    seats: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { timestamps: true }
);

carSchema.index({ make: 1 });
carSchema.index({ model: 1 });
carSchema.index({ type: 1 });
carSchema.index({ pricePerDay: 1 });

function arrayLimit(val) {
  return val.length <= 4;
}
function arraySpotLimit(val) {
  return val.length <= 5;
}

const Car = mongoose.model("Car", carSchema);

module.exports = Car;
