import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import bcrypt from "bcryptjs";

import { Hono } from "hono";
import { sign, verify } from "hono/jwt";
import { signinInput, signupInput } from "@shrutjain/medium-common";
// Create the main Hono app
type Bindings = {
  JWT_SECRET: string;
  DATABASE_URL: string;
};
type Variables = {
  userId: string;
};
export const userRouter = new Hono<{
  Bindings: Bindings;
  Variables: Variables;
}>();

userRouter.post("/signup", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const jwtSecret = c.env.JWT_SECRET;

  try {
    const body = await c.req.json();
    const { success } = signupInput.safeParse(body);
    if (!success) return c.json({ error: "Invalid inputs" }, 411);

    const { email, name, password } = body;
    const user = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (user) return c.json({ error: "User already exists" }, 411);

    const salt = await bcrypt.genSaltSync(10);
    const hashedPassword = await bcrypt.hashSync(password, salt);

    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });
    const jwt = await sign({ id: newUser.id }, jwtSecret);

    return c.json({ jwt, newUser }, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

userRouter.post("/login", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const jwtSecret = c.env.JWT_SECRET;

  try {
    const body = await c.req.json();
    const { success } = signinInput.safeParse(body);
    if (!success) return c.json({ error: "Invalid inputs" }, 411);
    const { email, password } = body;

    const user = await prisma.user.findFirst({
      where: { email },
    });

    let isValidPassword;

    if (user) {
      isValidPassword = await bcrypt.compareSync(password, user.password);
    }

    if (!user || !isValidPassword)
      return c.json({ error: "Invalid email or password" }, 411);

    const jwt = await sign({ id: user.id }, jwtSecret);

    return c.json({ jwt, user }, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});
