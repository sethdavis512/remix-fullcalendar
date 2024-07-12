import { prisma } from "~/utils/prismaClient";

export async function loadUsers() {
  return prisma.user.findMany(); 
}