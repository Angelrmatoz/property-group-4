import mongoose from "mongoose";
import bcrypt from "bcrypt";

// Definición del esquema de User

const loginSchema = new mongoose.Schema({
  admin: { type: Boolean, required: true, default: false },
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
});

// Campo virtual para la contraseña en texto plano (no se guarda directamente)
loginSchema
  .virtual("password")
  .set(function (this: any, password: string) {
    this._password = password;
  })
  .get(function (this: any) {
    return this._password;
  });

// Middleware para hashear la contraseña antes de validar (validation runs before save)
// Cambiamos a 'validate' para asegurar que passwordHash exista cuando Mongoose haga
// la validación de campos required.
loginSchema.pre("validate", async function (next) {
  try {
    if ((this as any)._password) {
      const saltRounds = 10;
      (this as any).passwordHash = await bcrypt.hash(
        (this as any)._password,
        saltRounds,
      );
    }
    next();
  } catch (err) {
    next(err as any);
  }
});

// Método para comparar contraseñas
loginSchema.methods.comparePassword = async function (
  candidatePassword: string,
) {
  // Si no hay passwordHash, devolver false en vez de lanzar
  if (!this.passwordHash) return false;
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Avoid re-registering the model if this file is loaded multiple times
const User =
  mongoose.models && (mongoose.models as any).User
    ? (mongoose.models as any).User
    : mongoose.model("User", loginSchema);

export default User;
