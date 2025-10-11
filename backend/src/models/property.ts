import mongoose from "mongoose";

// noinspection JSNonASCIINames
const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  currency: {
    type: String,
    required: true,
    enum: ["USD", "DOP"],
    default: "USD",
  },
  province: { type: String, required: true },
  city: { type: String, required: true },
  neighborhood: { type: String, required: true },
  type: { type: String, required: true, enum: ["sale", "rent"] },
  category: {
    type: String,
    required: true,
    enum: ["apartment", "house", "land", "commercial"],
  },
  bedrooms: { type: Number, required: true },
  bathrooms: { type: Number, required: true },
  halfBathrooms: { type: Number, required: true },
  parkingSpaces: { type: Number, required: true },
  builtArea: { type: Number, required: true },
  images: [{ type: String }],
  furnished: { type: String, enum: ["yes", "no"], default: "no" },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

const Property = mongoose.model("Property", propertySchema);

export default Property;
