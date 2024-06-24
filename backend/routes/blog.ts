import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { createBlogInput, updateBlogInput } from "@shrutjain/medium-common";
import { Hono } from "hono";

type Bindings = {
  DATABASE_URL: string;
  JWT_SECRET: string;
};
type Variables = {
  userId: string;
};

export const blogRouter = new Hono<{
  Bindings: Bindings;
  Variables: Variables;
}>();

blogRouter.post("/create", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const userId = c.get("userId");
    const body = await c.req.json();
    const { success } = createBlogInput.safeParse(body);
    if (!success) return c.json({ error: "Invalid inputs" }, 411);

    const newPost = await prisma.post.create({
      data: {
        title: body.title,
        content: body.content,
        authorId: userId,
      },
    });
    return c.json({ newPost }, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

blogRouter.put("/update/:blogId", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const blogId = c.req.param("blogId");
    const userId = c.get("userId");
    const body = await c.req.json();
    const { success } = updateBlogInput.safeParse(body);
    if (!success) return c.json({ error: "Invalid inputs" }, 411);
    const updatedBlog = await prisma.post.update({
      where: {
        id: blogId,
        authorId: userId,
      },
      data: {
        title: body.title,
        content: body.content,
      },
    });

    return c.json({ updatedBlog }, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

blogRouter.get("/access/:blogId", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const blogId = c.req.param("blogId");
    const userId = c.get("userId");

    const blog = await prisma.post.findFirst({
      where: {
        id: blogId,
        authorId: userId,
      },
    });
    return c.json({ blog });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});
blogRouter.get("/bulk", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const blogs = await prisma.post.findMany({});
    return c.json({ blogs });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});
