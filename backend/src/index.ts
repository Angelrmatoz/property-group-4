import express from "express";
import * as config from "@/utils/config";
import morgan from "morgan";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(morgan("tiny"));
app.use(cors());

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

if (require.main === module) {
  const PORT = config.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}
