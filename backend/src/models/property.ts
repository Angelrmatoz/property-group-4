import mongoose from "mongoose";

// noinspection JSNonASCIINames
const propertySchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descripcion: { type: String, required: true },
  precio: { type: Number, required: true },
  provincia: { type: String, required: true },
  municipio: { type: String, required: true },
  sector: { type: String, required: true },
  tipo: { type: String, required: true },
  habitaciones: { type: Number, required: true },
  banos: { type: Number, required: true },
  mediosBanos: { type: Number, required: true },
  parqueos: { type: Number, required: true },
  construccion: { type: Number, required: true },
  imagen: { type: String },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  fechaCreacion: { type: Date, default: Date.now },
});

const Property = mongoose.model("Property", propertySchema);

export default Property;
