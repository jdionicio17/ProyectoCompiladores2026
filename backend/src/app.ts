import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import compilerRoutes from "./routes/compiler.routes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
    res.json({
        success: true,
        message: "Backend del compilador SQL funcionando correctamente."
    });
});

app.use("/api/compiler", compilerRoutes);

export default app;