import type { Block, Document as DocumentType } from "@prisma/client";
import Box from "../Box";
import Editor from "../Editor";
import TextInput from "../TextInput";
import { useFetcher } from "@remix-run/react";

export default function Document({ document }: { document: DocumentType }) {
  const nameFetcher = useFetcher();
  const blockOrder = document.blockOrder;

  return (
    <>
      {JSON.stringify(blockOrder)}
      <nameFetcher.Form>
        <TextInput
          id="documentName"
          label="Document name"
          name="name"
          defaultValue={document.name}
          onBlur={(event) =>
            nameFetcher.submit(
              {
                documentId: document.id,
                intent: "saveDocumentName",
                name: event.currentTarget.value,
              },
              { method: "post" }
            )
          }
          // blockOrder={document.blockOrder}
        />
      </nameFetcher.Form>
      {/* @ts-ignore */}
      {document.blocks.map((block: Block) => (
        <Box
          key={block.id}
          sx={{
            border: `1px solid black`,
          }}
        >
          <Editor
            blockId={block.id}
            editorValue={
              block.content
                ? JSON.parse(block.content)
                : [
                    {
                      type: "heading-one",
                      children: [{ text: "todayFormatted" }],
                    },
                  ]
            }
            documentId={document.id}
          />
        </Box>
      ))}
    </>
  );
}
