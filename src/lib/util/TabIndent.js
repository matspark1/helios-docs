import { Extension } from "@tiptap/core";

export default Extension.create({
  name: "tabIndent",

  addKeyboardShortcuts() {
    return {
      Tab: () => {
        const indent = "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0";
        return this.editor.commands.insertContent(indent);
      },
    };
  },
});
