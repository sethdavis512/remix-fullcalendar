import { PrismaClient } from "@prisma/client";
import autoCrud from "@moreillon/prisma-auto-crud";

const prisma = new PrismaClient();

export const userCrud = autoCrud(prisma, "user");
