import { Router, Request, Response } from "express";
import prisma from "../../Prisma/prisma";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  const templates = await prisma.template.findMany();
  res.json(templates);
});

router.post("/", async (req: Request, res: Response) => {
  const { name, description, image, color, premium } = req.body;
  const created = await prisma.template.create({
    data: { name, description, image, color, premium },
  });
  res.status(201).json(created);
});

router.put("/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { name, description, image, color, premium } = req.body;
  const updated = await prisma.template.update({
    where: { id },
    data: { name, description, image, color, premium },
  });
  res.json(updated);
});

router.delete("/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  await prisma.template.delete({ where: { id } });
  res.status(200).json({
    message: "Deleted Successfully",
  });
});

export default router;
