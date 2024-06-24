import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import bcrypt from "bcryptjs";

import { Hono } from "hono";
import { sign, verify } from "hono/jwt";
import { userRouter } from "../routes/user";
import { blogRouter } from "../routes/blog";
// Create the main Hono app
type Bindings = {
  JWT_SECRET: string;
  DATABASE_URL: string;
};
type Variables = {
  userId: string;
};
const app = new Hono<{
  Bindings: Bindings;
  Variables: Variables;
}>();

app.use("/api/v1/blogs/*", async (c, next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer "))
    return c.json({ error: "Unauthorized access" });

  const token = authHeader.split(" ")[1];

  const payload = await verify(token, c.env.JWT_SECRET);
  if (!payload) {
    return c.json({ error: "Unauthorized" });
  }

  c.set("userId", String(payload.id));

  await next();
});

app.route("/api/v1/users", userRouter);
app.route("/api/v1/blogs", blogRouter);

export default app;
