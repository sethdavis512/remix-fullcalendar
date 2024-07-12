import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const loader: LoaderFunction = async ({ params }) => {
  const user = await prisma.user.findUnique({
    where: { id: params.userId },
  });
  return json(user);
};

export const action: ActionFunction = async ({ request, params }) => {
  if (request.method === "PUT") {
    const formData = await request.formData();
    const user = await prisma.user.update({
      where: { id: params.userId },
      data: {
        firstName: formData.get("firstName") as string,
        lastName: formData.get("lastName") as string,
        // Update other fields as necessary
      },
    });
    return json(user);
  } else if (request.method === "DELETE") {
    await prisma.user.delete({
      where: { id: params.userId },
    });
    return json({ message: "User deleted" });
  }
};
