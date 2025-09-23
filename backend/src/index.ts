import express from "express";
import cors from "cors";
import morgan from "morgan";
import { PORT } from "@/utils/config";

import "@/mongo";

const app = express();
app.disable("x-powered-by");

app.use(cors());
app.use(morgan("tiny"));
app.use(express.json());

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
