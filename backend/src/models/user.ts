import mongoose from "mongoose";
import bcrypt from "bcrypt";

// Definición del esquema de User

const loginSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    apellido: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
});

// Índice explícito para email (asegura unicidad a nivel BD)
loginSchema.index({ email: 1 }, { unique: true });

// Campo virtual para la contraseña en texto plano (no se guarda directamente)
loginSchema.virtual('password')
  .set(function(this: any, password: string) {
    this._password = password;
  })
  .get(function(this: any) {
    return this._password;
  });

// Middleware para hashear la contraseña antes de guardar
loginSchema.pre('save', async function (next) {
  // Si se ha establecido la contraseña (campo virtual) o el documento es nuevo
  try {
    const doc: any = this;
    if (doc._password) {
      const saltRounds = 10;
      doc.passwordHash = await bcrypt.hash(doc._password, saltRounds);
    }
    next();
  } catch (err) {
    next(err as any);
  }
});

// Método para comparar contraseñas
loginSchema.methods.comparePassword = async function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

const User = mongoose.model("User", loginSchema);

export default User;
