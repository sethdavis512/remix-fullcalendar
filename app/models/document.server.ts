import type { Document } from "@prisma/client";
import { prisma } from "~/utils/db.server";

// Create a new document
export function createDocument({ name }: Pick<Document, "name">) {
  return prisma.document.create({
    data: {
      name,
    },
  });
}

export function createTodaysDocument({ name }: Pick<Document, "name">) {
  const today = new Date();

  return prisma.document.create({
    data: {
      name: "my cool name" || [
        {
          type: "heading-one",
          children: [{ text: today.toDateString() as string }],
        },
      ],
    },
  });
}

// Retrieve a document by ID
export function getDocumentById(id: string) {
  return prisma.document.findUnique({
    where: { id },
    select: {
      tags: true,
      categories: true,
      author: true,
      blocks: true,
      blockOrder: true,
    },
  });
}

export function getDocumentsByUserId(userId: string) {
  return prisma.document.findMany({
    where: { authorId: userId },
    include: {
      tags: true,
      categories: true,
      author: true,
      blocks: true,
    },
  });
}

// Retrieve multiple documents
export function getAllDocuments() {
  return prisma.document.findMany({
    include: {
      tags: true,
      categories: true,
      author: true,
      blocks: true,
    },
  });
}

// Update a document by ID
export function updateDocument({
  id,
  name,
  blockOrder,
}: {
  id: string;
  name: string;
  blockOrder: string[];
}) {
  return prisma.document.update({
    where: { id },
    data: {
      name,
      blockOrder,
    },
  });
}

export function upsertDocument({ id, name }: { id: string; name: string }) {
  return prisma.document.upsert({
    where: { id },
    update: {},
    create: {
      id,
      name,
    },
  });
}

// Delete a document by ID
export function deleteDocument(id: string) {
  return prisma.document.delete({ where: { id } });
}
