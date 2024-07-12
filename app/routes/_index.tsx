import {
  type ActionFunction,
  json,
  type LoaderFunction,
  type V2_MetaFunction,
} from "@remix-run/node";
import format from "date-fns/format";
import { useLoaderData } from "@remix-run/react";
import { getDocumentsByUserId, updateDocument } from "~/models/document.server";
import Document from "~/components/Document";
import type { Document as DocumentType } from "@prisma/client";
import { createBlock, updateBlock } from "~/models/block.server";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};
const formatDateToYYYYMMDD = (date: Date) => format(date, "yyyy-MM-dd");

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const name = form.get("name") as string;
  const intent = form.get("intent") as string;
  const content = form.get("content") as string;
  const blockId = form.get("blockId") as string;
  const documentId = form.get("documentId") as string;
  const blockOrder = form.get("blockOrder") as string;

  if (intent === "saveDocumentName") {
    await updateDocument({
      id: documentId,
      name,
      blockOrder: JSON.parse(blockOrder),
    });
  }

  if (intent === "updateBlock") {
    await updateBlock({
      id: blockId,
      content,
    });
  }

  if (intent === "createBlock") {
    await createBlock({
      content,
      userId: "652f43da7c5fcc56eda84685",
      documentId,
    });
  }

  return null;
};

export const loader: LoaderFunction = async () => {
  const allDocuments = await getDocumentsByUserId("652f43da7c5fcc56eda84685");

  return json({ allDocuments });
};

export default function Index() {
  const { allDocuments } = useLoaderData();
  const today = new Date();
  // const todayFormatted = formatDateToYYYYMMDD(today);

  return (
    <>
      {allDocuments.map((document: DocumentType) => (
        <div key={document.id}>
          <h3>{document.id}</h3>
          <Document id={document.id} document={document} />
        </div>
      ))}
    </>
  );
}
