import { Router } from "express";
import { compileQuery } from "../controllers/compiler.controller";

const router = Router();

router.post("/compile", compileQuery);

export default router;