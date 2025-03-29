import { Extension } from "@tiptap/core";

export default Extension.create({
  name: "lineSpacing",

  addOptions() {
    return {
      defaultSpacing: "1.5",
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: ["paragraph"],
        attributes: {
          lineSpacing: {
            default: null,
            parseHTML: (element) => element.style.lineHeight || null,
            renderHTML: (attributes) => {
              if (!attributes.lineSpacing) {
                return {};
              }

              return {
                style: `line-height: ${attributes.lineSpacing}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setLineSpacing:
        (spacing) =>
        ({ commands, chain }) => {
          return chain().setNode("paragraph", { lineSpacing: spacing }).run();
        },
    };
  },
});
