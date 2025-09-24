import dotenv from "dotenv";
dotenv.config();

export const MONGODB_URI = process.env.MONGODB_URI;

export const PORT = process.env.PORT || 4000;

export const JWT_SECRET = process.env.JWT_SECRET;
if(!JWT_SECRET){
  throw new Error("JWT_SECRET is not defined");
}