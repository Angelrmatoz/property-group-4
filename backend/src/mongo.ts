import mongoose from "mongoose";

// Reduce deprecation warnings and control index creation behavior.
// By default, disable automatic index building in production to avoid
// long startup times and index-related warnings (e.g. duplicates on unique fields).
const isTest = process.env.NODE_ENV === "test";
const isProd = process.env.NODE_ENV === "production";
const autoIndex = !isProd; // enable autoIndex in development/test, disable in production

// Mongoose settings applied before connecting
mongoose.set("strictQuery", false);
mongoose.set("autoIndex", autoIndex);

if (!isTest) {
  const mongoUrl = process.env.MONGODB_URI;

  if (!mongoUrl) {
    throw new Error(
      "La variable MONGODB_URI no está definida en el archivo .env"
    );
  }

  // Ensure we pass an explicit database name to mongoose to avoid using the default 'test' database
  const connectOptions = {
    dbName: process.env.MONGODB_DB_NAME || "property-group",
  };

  // Environment-specific behavior
  if (isProd) {
    // Production: minimal logging and autoIndex disabled
    mongoose
      .connect(mongoUrl, connectOptions)
      .then(() => console.log("Conectado a MongoDB"))
      .catch((err) => console.error("Error al conectar a MongoDB:", err));
  } else {
    // Development / staging: enable mongoose debug to see queries in console
    mongoose.set("debug", true);
    mongoose
      .connect(mongoUrl, connectOptions)
      .then(() => console.log("Conectado a MongoDB (development)"))
      .catch((err) => console.error("Error al conectar a MongoDB:", err));
  }
}

mongoose.connection.on("connected", () => {
  console.log("Mongoose conectado");
});

mongoose.connection.on("error", (err) => {
  console.error("Mongoose error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose desconectado");
});

export default mongoose;
