"use client";

import "katex/dist/katex.min.css";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Mathematics from "@tiptap/extension-mathematics";
import { createLowlight } from "lowlight";
import { common } from "lowlight";

const lowlight = createLowlight(common);

export function Editor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link,
      Image,
      CodeBlockLowlight.configure({ lowlight }),
      Mathematics,
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "min-h-[280px] rounded-xl border border-border bg-surface p-4 text-sm text-text focus:outline-none",
      },
    },
    onUpdate: ({ editor: instance }) => {
      onChange(instance.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  return <EditorContent editor={editor} />;
}
