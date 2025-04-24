<script>
  import { onMount } from "svelte";
  import { getDocument } from "$lib/services/documentService";
  import { getContext } from "svelte";

  export let documentId;

  let editor;
  let documentTitle = "Untitled Document";

  async function loadDocumentTitle() {
    if (!documentId) return;

    try {
      const doc = await getDocument(documentId);
      if (doc && doc.title) {
        documentTitle = doc.title;
      }
    } catch (error) {
      console.error("Error loading document title:", error);
    }
  }

  function getEditorContent() {
    let htmlContent = "";

    if (editor && typeof editor.getHTML === "function") {
      htmlContent = editor.getHTML();
      return htmlContent;
    }

    try {
      const editorElement = document.querySelector(".element");
      if (editorElement) {
        if (
          editorElement.__editor &&
          typeof editorElement.__editor.getHTML === "function"
        ) {
          htmlContent = editorElement.__editor.getHTML();
          return htmlContent;
        } else {
          htmlContent = editorElement.innerHTML;
          return htmlContent;
        }
      }
    } catch (e) {
      console.error("Could not get editor from DOM:", e);
    }

    try {
      const contentElement = document.querySelector(
        ".docseditor-container .element"
      );
      if (contentElement) {
        htmlContent = contentElement.innerHTML;
        return htmlContent;
      }
    } catch (e) {
      console.error("Could not get content from editor element:", e);
    }

    return null;
  }

  function downloadAsPDF() {
    try {
      const htmlContent = getEditorContent();

      if (!htmlContent) {
        console.error("Could not get editor content");
        alert("Unable to access document content. Please try again.");
        return;
      }

      const iframe = document.createElement("iframe");
      iframe.style.position = "absolute";
      iframe.style.top = "-9999px";
      iframe.style.left = "-9999px";
      document.body.appendChild(iframe);

      iframe.contentDocument.write(`
<!DOCTYPE html>
<html>
<head>
  <title>${documentTitle}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Readex+Pro:wght@160..700&display=swap"
    rel="stylesheet"
  />
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Inter&family=Roboto&family=Merriweather&family=Open+Sans&family=Playfair+Display&family=Work+Sans&display=swap"
  />
  <style>
    @page {
      size: letter;
      margin: 20px 56px;
    }
    
    :root {
      --primary: #da1c39;
      --white: #f1f1f1;
      --black: #2c2a2a;
      --light-black: #d6d6d6;
      --light-black2: #e8e8e8;
      --grey: #808080;
      --dark-grey: #606060;
      --startpage-btn: #cb1a35;
      --primary-btn: #da1c39;
      --btn-white: #f1f1f1;
      --btn-black: #2c2a2a;
      --btn-white-white: #f1f1f1;
      --start-page-bg: #f1f1f1;
      --red-font: #c61a34;
      --icon-color: #1b1b1b;
      --black-rgb: 44, 42, 42;
      --black-rgb2: 0, 0, 0;
      --bg-color: #ebebeb;
      --hover: #d6d6d6;
      --green: #27af4b;
      --green2: #27af4b;
      --editor-bg: #f9fbfd;
      --editor-black: #141414;
      --blue: #2d6de3;
      --editor-white: #fff;
      --editor-grey: #b0b0b0;
      --editor-grey2: #d8d8d8;
      --light-grey: #dbdbdb;
      --light-grey2: #989898;
    }
    
    body {
      font-family: 'Readex Pro', Arial, sans-serif;
      font-size: 12pt;
      line-height: 1.5;
      color: var(--black);
      margin: 0;
      padding: 0;
      background-color: #fff;
      font-weight: 300; /* Added lighter font weight */
    }
    
    /* Fix for first heading */
    h1:first-of-type {
      margin-top: 0 !important;
    }
    
    /* Your exact TipTap styles with improved font weight */
    .tiptap > *:first-child {
      margin-top: 0;
    }
    
    .tiptap, 
    .tiptap p, 
    p {
      font-weight: 300; /* Lighter font weight for normal text */
    }
    
    .tiptap ul,
    .tiptap ol,
    ul, ol {
      padding: 0 1rem;
      margin: 1.25rem 1rem 1.25rem 0.4rem;
      font-weight: 300; /* Lighter font weight for lists */
    }
    
    .tiptap ul li p,
    .tiptap ol li p,
    ul li p,
    ol li p {
      margin-top: 0.25em;
      margin-bottom: 0.25em;
      font-weight: 300; /* Lighter font weight for list items */
    }
    
    .tiptap ul li,
    ul li {
      list-style-type: disc;
      font-weight: 300; /* Lighter font weight for list items */
    }
    
    .tiptap ul li p,
    ul li p {
      margin-top: 0.25em;
      margin-bottom: 0.25em;
    }
    
    .tiptap ol li,
    ol li {
      list-style-type: decimal;
      font-weight: 300; /* Lighter font weight for ordered list items */
    }
    
    .tiptap ol li p,
    ol li p {
      margin-top: 0.25em;
      margin-bottom: 0.25em;
    }
    
    /* Task list specific styles */
    .tiptap ul[data-type="taskList"],
    ul[data-type="taskList"] {
      list-style: none;
      margin-left: 0;
      padding: 0;
    }
    
    .tiptap ul[data-type="taskList"] li,
    ul[data-type="taskList"] li {
      align-items: flex-start;
      display: flex;
      margin-top: 4px;
      font-weight: 300; /* Lighter font weight for task list items */
    }
    
    .tiptap ul[data-type="taskList"] li > label,
    ul[data-type="taskList"] li > label {
      flex: 0 0 auto;
      margin-right: 0.5rem;
      user-select: none;
    }
    
    .tiptap ul[data-type="taskList"] li > div,
    ul[data-type="taskList"] li > div {
      flex: 1 1 auto;
      margin-top: -4px;
    }
    
    .tiptap ul[data-type="taskList"] input[type="checkbox"],
    ul[data-type="taskList"] input[type="checkbox"] {
      cursor: pointer;
    }
    
    .tiptap ul[data-type="taskList"] ul[data-type="taskList"],
    ul[data-type="taskList"] ul[data-type="taskList"] {
      margin: 0;
    }
    
    /* Heading styles */
    .tiptap h1, .tiptap h2, .tiptap h3, .tiptap h4, .tiptap h5, .tiptap h6,
    h1, h2, h3, h4, h5, h6 {
      line-height: 1.1;
      margin-top: 2.5rem;
      text-wrap: pretty;
      font-weight: 400; /* Slightly heavier weight for headings */
    }
    
    .tiptap h1, .tiptap h2,
    h1, h2 {
      margin-top: 3.5rem;
      margin-bottom: 1.5rem;
    }
    
    .tiptap h1,
    h1 {
      font-size: 1.4rem;
      text-align: start;
    }
    
    .tiptap h2,
    h2 {
      font-size: 1.2rem;
    }
    
    .tiptap h3,
    h3 {
      font-size: 1.1rem;
    }
    
    .tiptap h4, .tiptap h5, .tiptap h6,
    h4, h5, h6 {
      font-size: 1rem;
    }
    
    /* Table-specific styling */
    .tiptap table,
    table {
      border-collapse: collapse;
      margin: 0;
      overflow: hidden;
      table-layout: fixed;
      width: 100%;
      border-radius: 4px;
    }
    
    .tiptap table td, .tiptap table th,
    table td, table th {
      border: 1px solid var(--black);
      box-sizing: border-box;
      min-width: 1em;
      padding: 0px;
      position: relative;
      vertical-align: top;
      font-weight: 300; /* Lighter font weight for table cells */
    }
    
    .tiptap table td > *, .tiptap table th > *,
    table td > *, table th > * {
      margin-bottom: 0;
    }
    
    .tiptap table td p, .tiptap table th p,
    table td p, table th p {
      color: var(--black);
      font-weight: 300; /* Lighter font weight for table text */
    }
    
    .tiptap table th,
    table th {
      background-color: var(--editor-grey2);
      font-weight: 400; /* Slightly heavier font weight for table headers */
      text-align: left;
    }
    
    .tiptap .tableWrapper,
    .tableWrapper {
      margin: 1.5rem 0;
      overflow-x: auto;
    }
    
    /* TipTap Image Styling */
    .tiptap img,
    img {
      display: block;
      height: auto;
      margin: 1.5rem 0;
      max-width: 100%;
    }
    
    /* CODE BLOCK */
    .tiptap pre,
    pre {
      background: var(--black);
      border-radius: 0.5rem;
      color: var(--white);
      font-family: "JetBrainsMono", monospace;
      margin: 1.5rem 0;
      padding: 0.75rem 1rem;
      font-weight: 300; /* Lighter font weight for pre blocks */
    }
    
    .tiptap pre code,
    pre code {
      background: none;
      color: inherit;
      font-size: 0.8rem;
      padding: 0;
      font-weight: 300; /* Lighter font weight for code */
    }
    
    .tiptap blockquote,
    blockquote {
      border-left: 3px solid var(--grey);
      margin: 1.5rem 0;
      padding-left: 1rem;
      font-weight: 300; /* Lighter font weight for blockquotes */
    }
    
    .tiptap blockquote p,
    blockquote p {
      margin: 0;
      font-weight: 300; /* Lighter font weight for blockquote text */
    }
    
    /* Code and preformatted text styles */
    .tiptap code,
    code {
      background-color: var(--editor-grey2);
      border-radius: 0.4rem;
      color: var(--black);
      font-size: 0.85rem;
      padding: 0.25em 0.3em;
      font-weight: 300; /* Lighter font weight for inline code */
    }
    
    /* Print-specific styles */
    @media print {
      body {
        padding: 0;
        margin: 0;
        font-weight: 300; /* Ensure lighter font weight in print */
      }
      
      /* Fix for first heading in printed document */
      h1:first-of-type {
        margin-top: 0 !important;
      }
      
      table th {
        background-color: var(--editor-grey2) !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        text-align: left !important;
        font-weight: 400 !important; /* Maintain slightly heavier weight for headers */
      }
      
      /* Force font weights in print mode */
      p, li, td, div, blockquote {
        font-weight: 300 !important; /* Force lighter weight for normal text */
      }
      
      h1, h2, h3, h4, h5, h6, th {
        font-weight: 400 !important; /* Force slightly heavier weight for headings */
      }
      
      /* Make sure we print background colors */
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
  </style>
</head>
<body>
  <div class="tiptap">
    ${htmlContent}
  </div>
</body>
</html>
      `);

      iframe.contentDocument.close();

      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();

        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 800);
    } catch (error) {
      console.error("Error downloading document:", error);
      alert("Error downloading document. Please try again.");
    }
  }

  onMount(() => {
    loadDocumentTitle();

    try {
      editor = getContext("editor");
    } catch (e) {
      console.error("Could not get editor from context in onMount:", e);
    }

    if (!editor) {
      setTimeout(() => {
        try {
          const editorElement = document.querySelector(".element");
          if (editorElement && editorElement.__editor) {
            editor = editorElement.__editor;
          }
        } catch (e) {
          console.error("Could not get editor from DOM in onMount:", e);
        }
      }, 500);
    }
  });
</script>

<button
  class="file-btn-dwnld fileBtn"
  on:click={downloadAsPDF}
  aria-label="Print Document"
>
  <i class="fi fi-rr-print"></i>
</button>
