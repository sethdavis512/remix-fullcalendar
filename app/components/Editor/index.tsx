import { useMemo, useCallback } from "react";

import type { BaseEditor, Descendant } from "slate";
import {
  createEditor,
  Editor as SlateEditor,
  Element,
  Transforms,
} from "slate";
import { Slate, Editable, withReact, type ReactEditor } from "slate-react";
import { withHistory } from "slate-history";
import isHotkey from "is-hotkey";
import debounce from "lodash/debounce";

import Box from "../Box";
import HeadingOne from "../slate/HeadingOne";
import HeadingTwo from "../slate/HeadingTwo";
import HeadingThree from "../slate/HeadingThree";
import DefaultElement from "../slate/DefaultElement";
import Leaf from "../slate/Leaf";
import NumberedList from "../slate/NumberedList";
import BulletedList from "../slate/BulletedList";
import ListItem from "../slate/ListItem";
import { useFetcher } from "@remix-run/react";

type ParagraphElement = { type: "paragraph"; children: Descendant[] };
type HeadingOneElement = { type: "heading-one"; children: Descendant[] };
type HeadingTwoElement = { type: "heading-two"; children: Descendant[] };
type HeadingThreeElement = { type: "heading-three"; children: Descendant[] };
type ListItemElement = { type: "list-item"; children: Descendant[] };
type BulletedListElement = { type: "bulleted-list"; children: Descendant[] };
type NumberedListElement = { type: "numbered-list"; children: Descendant[] };

type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
};

type Marks = "bold" | "italic" | "underline";
type Blocks =
  | "heading-one"
  | "heading-two"
  | "heading-three"
  | "numbered-list"
  | "bulleted-list"
  | "list-item";

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element:
      | ParagraphElement
      | HeadingOneElement
      | HeadingTwoElement
      | HeadingThreeElement
      | ListItemElement
      | BulletedListElement
      | NumberedListElement;
    Text: CustomText;
  }
}

const HOTKEYS = {
  "mod+b": { type: "mark", modifier: "bold" },
  "mod+i": { type: "mark", modifier: "italic" },
  "mod+u": { type: "mark", modifier: "underline" },
  "mod+opt+0": { type: "block", modifier: "paragraph" },
  "mod+opt+1": { type: "block", modifier: "heading-one" },
  "mod+opt+2": { type: "block", modifier: "heading-two" },
  "mod+opt+3": { type: "block", modifier: "heading-three" },
  "mod+shift+7": { type: "block", modifier: "numbered-list" },
  "mod+shift+8": { type: "block", modifier: "bulleted-list" },
  "mod+return": { type: "action", modifier: "new-block" },
};

const LIST_TYPES = ["numbered-list", "bulleted-list"];

const isMarkActive = (editor: SlateEditor, format: Marks) => {
  const marks = SlateEditor.marks(editor);
  return marks && marks[format];
};

const isBlockActive = (editor: SlateEditor, format: Blocks) => {
  const { selection } = editor;
  if (!selection) {
    return false;
  }

  const [match] = SlateEditor.nodes(editor, {
    at: SlateEditor.unhangRange(editor, selection),
    match: (n) =>
      !SlateEditor.isEditor(n) && Element.isElement(n) && n.type === format,
  });

  return !!match;
};

const toggleBlock = (editor: SlateEditor, format: Blocks) => {
  const isActive = isBlockActive(editor, format);
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !SlateEditor.isEditor(n) &&
      Element.isElement(n) &&
      LIST_TYPES.includes(n.type),
    split: true,
  });
  const newProperties: Partial<Element> = {
    type: isActive ? "paragraph" : isList ? "list-item" : format,
  };
  Transforms.setNodes(editor, newProperties);

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

const toggleMark = (editor: SlateEditor, format: Marks) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    SlateEditor.removeMark(editor, format);
  } else {
    SlateEditor.addMark(editor, format, true);
  }
};

const StyledEditable = Box.withComponent(Editable);

interface EditorProps {
  editorValue: Descendant[];
  blockId: string;
  documentId: string;
}

const Editor = ({
  editorValue,
  blockId,
  documentId,
}: EditorProps): JSX.Element => {
  const editorFetcher = useFetcher();

  const editor = useMemo(() => withReact(withHistory(createEditor())), []);
  const renderLeaf = useCallback((props: any) => <Leaf {...props} />, []);

  const renderElement = useCallback((props: any) => {
    switch (props.element.type) {
      case "heading-one":
        return <HeadingOne {...props} />;
      case "heading-two":
        return <HeadingTwo {...props} />;
      case "heading-three":
        return <HeadingThree {...props} />;
      case "numbered-list":
        return <NumberedList {...props} />;
      case "bulleted-list":
        return <BulletedList {...props} />;
      case "list-item":
        return <ListItem {...props} />;
      default:
        return <DefaultElement {...props} />;
    }
  }, []);

  const handleSlateOnChange = debounce((value: Descendant[]) => {
    editorFetcher.submit(
      {
        content: JSON.stringify(value),
        blockId: blockId ?? "",
        intent: "updateBlock",
        documentId,
      },
      { method: "post" }
    );
  }, 500);

  return (
    <Slate
      editor={editor}
      initialValue={editorValue}
      onChange={handleSlateOnChange}
    >
      <StyledEditable
        onKeyDown={(event) => {
          Object.keys(HOTKEYS).forEach((hotkey) => {
            if (isHotkey(hotkey, event)) {
              event.preventDefault();

              // I am not really sure what needs to be changed here, it's just typescript being mad.
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              if (HOTKEYS[hotkey] && HOTKEYS[hotkey].type === "mark") {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                const mark = HOTKEYS[hotkey];
                toggleMark(editor, mark.modifier);
              }

              // I am not really sure what needs to be changed here, it's just typescript being mad.
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              if (HOTKEYS[hotkey] && HOTKEYS[hotkey].type === "block") {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                const mark = HOTKEYS[hotkey];
                toggleBlock(editor, mark.modifier);
              }

              // @ts-ignore
              if (HOTKEYS[hotkey] && HOTKEYS[hotkey].type === "action") {
                // @ts-ignore
                console.log(HOTKEYS[hotkey], HOTKEYS[hotkey].type === "action");

                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                editorFetcher.submit(
                  {
                    content: JSON.stringify([
                      {
                        type: "paragraph",
                        children: [{ text: "New" }],
                      },
                    ]),
                    intent: "createBlock",
                    documentId,
                  },
                  { method: "post" }
                );
              }
            }
          });
        }}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        spellCheck
        sx={{
          maxWidth: "650px",
          width: "100%",
          minHeight: "100px",
          p: 8,
        }}
      />
    </Slate>
  );
};

export default Editor;
