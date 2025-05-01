import { Extension } from "@tiptap/core";

export default Extension.create({
  name: "textWeight",

  addOptions() {
    return {
      types: ["textStyle"],
      defaultWeight: "400",
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontWeight: {
            default: this.options.defaultWeight,
            parseHTML: (element) => element.style.fontWeight || null,
            renderHTML: (attributes) => {
              if (!attributes.fontWeight) {
                return {};
              }

              return {
                style: `font-weight: ${attributes.fontWeight}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontWeight:
        (weight) =>
        ({ commands }) => {
          return commands.setMark("textStyle", { fontWeight: weight });
        },
      toggleBold:
        () =>
        ({ editor, commands }) => {
          const fontWeight = editor.getAttributes("textStyle").fontWeight;
          const newWeight = fontWeight === "700" ? "400" : "700";
          return commands.setMark("textStyle", { fontWeight: newWeight });
        },
    };
  },
});
