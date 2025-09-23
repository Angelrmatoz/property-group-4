import mongoose from "mongoose";

const loginSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    apellido: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true }
});

const Login = mongoose.model("Login", loginSchema);

export default Login;
