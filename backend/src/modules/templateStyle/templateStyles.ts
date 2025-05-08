import { Router, Request, Response } from "express";
import prisma from "../../Prisma/prisma";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  const styles = await prisma.templateStyle.findMany();
  res.json(styles);
});

router.post("/", async (req: Request, res: Response) => {
  const { name, slug, description, image, color, premium, styles } = req.body;
  const created = await prisma.templateStyle.create({
    data: { name, slug, description, image, color, premium, styles },
  });
  res.status(201).json(created);
});

router.put("/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { name, slug, description, image, color, premium, styles } = req.body;
  const updated = await prisma.templateStyle.update({
    where: { id },
    data: { name, slug, description, image, color, premium, styles },
  });
  res.json(updated);
});

router.delete("/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  await prisma.templateStyle.delete({ where: { id } });
  res.status(200).json({
    message: "Deleted Successfully",
  });
});

export default router;
