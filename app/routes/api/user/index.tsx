import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const loader: LoaderFunction = async () => {
  const users = await prisma.user.findMany();
  return json(users);
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const user = await prisma.user.create({
    data: {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      // Add other fields as necessary
    },
  });
  return json(user);
};
