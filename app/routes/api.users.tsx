import { json } from "@remix-run/node";
import { prisma } from "~/utils/prismaClient";
import { loadUsers } from "~/models/users.server";

export const loader = async () => {
  const users = await loadUsers();
  return json({ users });
};

export const loader = async ({ request }: { request: Request }) => {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (id) {
    // Fetch a single user by ID
    const user = await prisma.user.findUnique({
      where: { id },
    });
    return json(user);
  } else {
    // Fetch all users
    const users = await prisma.user.findMany();
    return json(users);
  }
};

export const action = async ({ request }: { request: Request }) => {
  const method = request.method;
  let result;

  switch (method) {
    case "POST":
      // Create a new user
      const newUser = await request.json();
      result = await prisma.user.create({
        data: newUser,
      });
      break;
    case "PUT":
      // Update an existing user
      const updatedUser = await request.json();
      result = await prisma.user.update({
        where: { id: updatedUser.id },
        data: updatedUser,
      });
      break;
    case "DELETE":
      // Delete a user
      const { id } = await request.json();
      result = await prisma.user.delete({
        where: { id },
      });
      break;
    default:
      throw new Error(`Unsupported method: ${method}`);
  }

  return json(result);
};
