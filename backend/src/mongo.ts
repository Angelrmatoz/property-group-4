import mongoose from "mongoose";

if (process.env.NODE_ENV !== "test") {
  const mongoUrl = process.env.MONGODB_URI;

  if (!mongoUrl) {
    throw new Error(
      "La variable MONGODB_URI no está definida en el archivo .env"
    );
  }

  // Environment-specific behavior
  if (process.env.NODE_ENV === "production") {
    // Production: minimal logging
    mongoose
      .connect(mongoUrl)
      .then(() => console.log("Conectado a MongoDB"))
      .catch((err) => console.error("Error al conectar a MongoDB:", err));
  } else if (process.env.NODE_ENV === "development") {
    // Development: enable mongoose debug to see queries in console
    mongoose.set("debug", true);
    mongoose
      .connect(mongoUrl)
      .then(() => console.log("Conectado a MongoDB (development)"))
      .catch((err) => console.error("Error al conectar a MongoDB:", err));
  } else {
    // Fallback (staging, local, etc.) – behave like development but without debug
    mongoose
      .connect(mongoUrl)
      .then(() => console.log("Conectado a MongoDB"))
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
