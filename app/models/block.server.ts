import type { Block, User } from "@prisma/client";
import { prisma } from "~/utils/db.server";
import { updateDocument } from "./document.server";

export async function createBlock({
  content, 
  userId,
  documentId  
}) {

  const block = await prisma.block.create({
    data: {
      content,
      authorId: userId,
      documentId
    }
  });

  await updateDocument({
    id: documentId, 
    blockOrder: {
      push: block.id
    }
  });

  return block;

}

export function upsertBlock({
  id,
  content,
  userId,
  documentId,
}: {
  id: string;
  content: string;
  userId: string;
  documentId: string;
}) {
  return prisma.block.upsert({
    where: { id },
    create: {
      documentId,
      content,
      authorId: userId,
    },
    update: {
      content,
    },
  });
}

export function getBlockById(id: string) {
  return prisma.block.findUnique({
    where: { id },
    include: {
      tags: true,
      author: true,
      Document: true,
    },
  });
}

export function getBlocks({ userId }: { userId: User["id"] }) {
  return prisma.block.findMany({
    where: { authorId: userId },
    select: { id: true, content: true },
  });
}

export function updateBlock({ id, content }: { id: string; content: string }) {
  return prisma.block.update({
    where: { id },
    data: { content },
  });
}

export function deleteBlock(id: string) {
  return prisma.block.delete({
    where: { id },
  });
}
