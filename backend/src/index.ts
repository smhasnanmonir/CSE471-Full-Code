import templatesRouter from "./modules/template/templates";
import templateStylesRouter from "./modules/templateStyle/templateStyles";
import cors from "cors";
import express, { Request, Response } from "express";
import prisma from "./Prisma/prisma";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/templates", templatesRouter);
app.use("/api/template-styles", templateStylesRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

app.get("/", (req: Request, res: Response) => {
  res.send("Hello from CSE471");
});
