import {
  type ActionFunction,
  json,
  type LoaderFunction,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import Document from "~/components/Document";
import { getDocumentById, updateDocument } from "~/models/document.server";
import { createBlock, updateBlock } from "~/models/block.server";

export const action: ActionFunction = async ({ request, params }) => {
  const form = await request.formData();
  const intent = form.get("intent") as string;
  const name = form.get("name") as string;
  const blockId = form.get("blockId") as string;
  const documentId = params.id as string;
  const blockOrder = form.get("blockOrder") as string;
  const content = form.get("content") as string;

  if (intent === "saveDocumentName") {
    await updateDocument({
      id: documentId,
      name,
      blockOrder: JSON.parse(blockOrder),
    });
  }

  // if (intent === "createBlock") {
  //   await createBlock({
  //     content: form.get("content") as string,
  //     documentId,
  //     userId: form.get("userId") as string,
  //   });
  // }

  if (intent === "createBlock") {
    await createBlock({
      content,
      userId: "652f43da7c5fcc56eda84685",
      documentId,
    });
  }

  if (intent === "updateBlock") {
    await updateBlock({
      id: blockId,
      content: form.get("content") as string,
      documentId,
    });
  }

  return null;
};

export const loader: LoaderFunction = async ({ params }) => {
  const document = await getDocumentById(params.id as string);
  return json({ document });
};

// export const loader: LoaderFunction = async ({ request, params }) => {
//   const document = await getDocumentById(params.id as string);

//   const mapOfBlocks = document?.blocks.reduce((acc, cur) => {
//     if (!acc[cur.id]) {
//       acc[cur.id] = cur;
//     }

//     return acc;
//   }, {});

//   const listOfBlocks = document?.blockOrder.map(
//     (blockId) => (mapOfBlocks as any)[blockId]
//   );

//   return json({
//     listOfBlocks,
//   });
// };

export default function DocumentDetailRoute() {
  const { document } = useLoaderData();

  return <Document document={document} />;
}
