<script>
  import { onMount, onDestroy, setContext } from "svelte";
  import {
    updateDocumentTitle,
    getDocument,
  } from "$lib/services/documentService";
  import { auth } from "$lib/FirebaseConfig";
  import { FirebaseProvider } from "$lib/collaboration/FirebaseProvider";
  import InsertTable from "$lib/components/InsertTable.svelte";
  import HighlightColorPicker from "$lib/components/HighlightColorPicker.svelte";
  import TextColorPicker from "$lib/components/TextColorPicker.svelte";
  import AlignMenu from "$lib/components/AlignMenu.svelte";
  import LineSpacingMenu from "$lib/components/LineSpacingMenu.svelte";
  import InsertLink from "$lib/components/InsertLink.svelte";
  import TabIndent from "$lib/util/TabIndent.js";
  import LineSpacing from "$lib/util/LineSpacing.js";
  import { Editor } from "@tiptap/core";
  import StarterKit from "@tiptap/starter-kit";
  import TaskItem from "@tiptap/extension-task-item";
  import TaskList from "@tiptap/extension-task-list";
  import Table from "@tiptap/extension-table";
  import Link from "@tiptap/extension-link";
  import TableCell from "@tiptap/extension-table-cell";
  import TableHeader from "@tiptap/extension-table-header";
  import TableRow from "@tiptap/extension-table-row";
  import Image from "@tiptap/extension-image";
  import CharacterCount from "@tiptap/extension-character-count";
  import ImageResize from "tiptap-extension-resize-image";
  import CodeBlock from "@tiptap/extension-code-block";
  import Blockquote from "@tiptap/extension-blockquote";
  import Bold from "@tiptap/extension-bold";
  import Code from "@tiptap/extension-code";
  import Highlight from "@tiptap/extension-highlight";
  import Subscript from "@tiptap/extension-subscript";
  import Superscript from "@tiptap/extension-superscript";
  import TextStyle from "@tiptap/extension-text-style";
  import { Color } from "@tiptap/extension-color";
  import Underline from "@tiptap/extension-underline";
  import TextAlign from "@tiptap/extension-text-align";
  import Typography from "@tiptap/extension-typography";
  import Collaboration from "@tiptap/extension-collaboration";
  import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
  import * as Y from "yjs";
  import { IndexeddbPersistence } from "y-indexeddb";
  import toast from "svelte-5-french-toast";
  import ActiveUsers from "$lib/components/ActiveUsers.svelte";
  import { extendFirebaseProvider } from "$lib/collaboration/FirebaseProviderExtension";

  export let documentId;
  let element;
  let editor;
  let documentTitle = "Untitled Document";
  let currentFontFamily = "";
  let currentFontSize = "16px";
  let ydoc;
  let firebaseProvider;
  let indexDbProvider;
  let isLoading = true;
  let cleanupInterval;
  let isEditable = true;
  let activeUsersProvider;

  const editorStore = {
    subscribe: (callback) => {
      callback(editor);
      return () => {};
    },
    getHTML: () => editor?.getHTML() || "",
  };

  setContext("editor", editorStore);

  $: displayFontSize = currentFontSize.replace("px", "");

  async function loadDocument() {
    try {
      const doc = await getDocument(documentId);
      if (doc) {
        documentTitle = doc.title || "Untitled Document";
      }
      isLoading = false;
    } catch (error) {
      console.error("Error loading document:", error);
      isLoading = false;
    }
  }

  function handleInsertTable(event) {
    const { rows, cols } = event.detail;
    editor
      .chain()
      .focus()
      .insertTable({ rows, cols, withHeaderRow: true })
      .run();
  }

  function updateSelectionFormat() {
    if (!editor) return;

    const marks = editor.getAttributes("textStyle");

    if (marks.fontFamily) {
      currentFontFamily = marks.fontFamily;
    }

    if (marks.fontSize) {
      currentFontSize = marks.fontSize;
    }
  }

  async function saveTitle() {
    try {
      await updateDocumentTitle(documentId, documentTitle);
    } catch (error) {
      console.error("Error saving title:", error);
      toast.error("Error saving document title.");
    }
  }

  function checkScreenWidth() {
    const isMobileWidth = window.innerWidth < 900;
    isEditable = !isMobileWidth;

    if (editor) {
      editor.setEditable(isEditable);
    }
  }

  onMount(async () => {
    await loadDocument();

    ydoc = new Y.Doc();

    indexDbProvider = new IndexeddbPersistence(
      `helios-docs-${documentId}`,
      ydoc
    );

    firebaseProvider = new FirebaseProvider(documentId, ydoc);

    const extendedProvider = extendFirebaseProvider(firebaseProvider);
    activeUsersProvider = extendedProvider;

    cleanupInterval = setInterval(
      () => {
        if (firebaseProvider) {
          firebaseProvider.cleanupOldUpdates();
        }
      },
      5 * 60 * 1000
    );

    const CustomTextStyle = TextStyle.extend({
      addAttributes() {
        return {
          ...this.parent?.(),
          fontFamily: {
            default: null,
            parseHTML: (element) => element.style.fontFamily || null,
            renderHTML: (attributes) => {
              if (!attributes.fontFamily) return {};
              return {
                style: `font-family: ${attributes.fontFamily}`,
              };
            },
          },
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {};
              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        };
      },

      addCommands() {
        return {
          ...this.parent?.(),
          setFontFamily:
            (fontFamily) =>
            ({ chain }) => {
              return chain().setMark("textStyle", { fontFamily }).run();
            },
          setFontSize:
            (fontSize) =>
            ({ chain }) => {
              return chain().setMark("textStyle", { fontSize }).run();
            },
        };
      },
    });

    editor = new Editor({
      element: element,
      editorProps: {
        attributes: {
          class: "element",
          style: "padding: 20px 56px",
        },
      },
      editable: isEditable,
      extensions: [
        StarterKit.configure({
          history: false,
        }),
        Subscript,
        Superscript,
        Typography,
        Color,
        TabIndent,
        LineSpacing,
        CustomTextStyle,
        TextAlign.configure({
          types: ["heading", "paragraph"],
        }),
        Highlight.configure({ multicolor: true }),
        TaskItem.configure({
          nested: true,
        }),
        TaskList,
        Table.configure({
          resizable: true,
        }),
        TableRow,
        TableHeader,
        TableCell,
        ImageResize,
        CharacterCount.configure({
          wordCounter: (text) =>
            text.split(/\s+/).filter((word) => word !== "").length,
        }),
        Underline,
        Link.configure({
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
          protocols: ["http", "https"],
          isAllowedUri: (url, ctx) => {
            try {
              const parsedUrl = url.includes(":")
                ? new URL(url)
                : new URL(`${ctx.defaultProtocol}://${url}`);

              if (!ctx.defaultValidate(parsedUrl.href)) {
                return false;
              }

              const disallowedProtocols = ["ftp", "file", "mailto"];
              const protocol = parsedUrl.protocol.replace(":", "");

              if (disallowedProtocols.includes(protocol)) {
                return false;
              }

              const allowedProtocols = ctx.protocols.map((p) =>
                typeof p === "string" ? p : p.scheme
              );

              if (!allowedProtocols.includes(protocol)) {
                return false;
              }

              const disallowedDomains = [
                "example-phishing.com",
                "malicious-site.net",
              ];
              const domain = parsedUrl.hostname;

              if (disallowedDomains.includes(domain)) {
                return false;
              }

              return true;
            } catch {
              return false;
            }
          },
          shouldAutoLink: (url) => {
            try {
              const parsedUrl = url.includes(":")
                ? new URL(url)
                : new URL(`https://${url}`);

              const disallowedDomains = [
                "example-no-autolink.com",
                "another-no-autolink.com",
              ];
              const domain = parsedUrl.hostname;

              return !disallowedDomains.includes(domain);
            } catch {
              return false;
            }
          },
        }),
        Collaboration.configure({
          document: ydoc,
        }),
        // CollaborationCursor.configure({
        //   provider: firebaseProvider,
        //   user: {
        //     name: auth.currentUser?.displayName || "Anonymous",
        //     color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
        //   },
        // }),
      ],
      onTransaction: () => {
        editor = editor;
        updateSelectionFormat();
      },
      onSelectionUpdate: () => {
        updateSelectionFormat();
      },
      onFocus: () => {
        updateSelectionFormat();
      },
    });

    Object.defineProperty(editorStore, "getHTML", {
      value: () => editor?.getHTML() || "",
    });

    if (element) {
      element.__editor = editor;
    }

    editor.commands.setFontSize("16px");
    editor.commands.setFontFamily("Readex Pro");
    currentFontFamily = "Readex Pro";

    checkScreenWidth();

    window.addEventListener("resize", checkScreenWidth);
  });

  onDestroy(() => {
    if (editor) {
      editor.destroy();
    }

    if (firebaseProvider) {
      firebaseProvider.destroy();
    }
    if (indexDbProvider) {
      indexDbProvider.destroy();
    }
    if (ydoc) {
      ydoc.destroy();
    }

    if (cleanupInterval) {
      clearInterval(cleanupInterval);
    }
  });

  function handleFontSizeInput(e) {
    let size = parseInt(e.target.value);
    if (isNaN(size) || size < 1) return;

    size = Math.max(size, 4);
    const sizeWithUnit = `${size}px`;

    currentFontSize = sizeWithUnit;

    if (editor) {
      editor.chain().focus().setFontSize(sizeWithUnit).run();
    }
  }

  function handleFontSizeAdjust(change) {
    if (!editor) return;

    let size = parseInt(currentFontSize);
    if (isNaN(size)) size = 16;

    size = Math.max(size + change, 4);
    const newSize = `${size}px`;

    currentFontSize = newSize;

    editor.chain().focus().setFontSize(newSize).run();
  }
  window.removeEventListener("resize", checkScreenWidth);
</script>

<div class="editor-wrapper">
  <div class="editor-tools-wrapper">
    <div class="editor-tools-info">
      <div class="tooltip-container4">
        <input
          type="text"
          class="document-title"
          placeholder="Untitled Document"
          bind:value={documentTitle}
          on:blur={saveTitle}
          on:keydown={(e) => e.key === "Enter" && saveTitle()}
        />
        <div class="tooltip2">Document Title</div>
      </div>
      <div class="active-users-wrapper">
        <ActiveUsers {documentId} provider={activeUsersProvider} />
      </div>
      {#if editor?.storage?.characterCount}
        <div class="character-counter">
          <p>{editor.storage.characterCount.characters()} characters</p>
          <p>{editor.storage.characterCount.words()} words</p>
        </div>
      {/if}
    </div>
    <div class="editor-tools">
      <div class="tools">
        {#if editor}
          <div class="tooltip-container">
            <button
              on:click={() => editor.chain().focus().undo().run()}
              aria-label="Undo"
              disabled={!editor?.can().undo()}
            >
              <i class="fa-solid fa-rotate-left"></i>
            </button>
            <div class="tooltip">Undo</div>
          </div>
          <div class="tooltip-container">
            <button
              on:click={() => editor.chain().focus().redo().run()}
              aria-label="Redo"
              disabled={!editor?.can().redo()}
            >
              <i class="fa-solid fa-rotate-right"></i>
            </button>
            <div class="tooltip">Redo</div>
          </div>
          <div class="tooltip-container3">
            <label for="font-select" class="sr-only">Font Family</label>
            <select
              id="font-select"
              aria-label="Font Family"
              on:change={(e) => {
                editor.chain().focus().setFontFamily(e.target.value).run();
                currentFontFamily = e.target.value;
              }}
              value={currentFontFamily}
            >
              <option value="Arial" style="font-family: Arial">Arial</option>
              <option value="Inter" style="font-family: Inter">Inter</option>
              <option value="Roboto" style="font-family: Roboto">Roboto</option>
              <option value="Open Sans" style="font-family: Open Sans"
                >Open Sans</option
              >
              <option
                value="Playfair Display"
                style="font-family: Playfair Display">Playfair Display</option
              >
              <option value="Work Sans" style="font-family: Work Sans"
                >Work Sans</option
              >
              <option value="Merriweather" style="font-family: Merriweather"
                >Merriweather</option
              >
              <option
                value="Times New Roman"
                style="font-family: Times New Roman">Times New Roman</option
              >
              <option value="Georgia" style="font-family: Georgia"
                >Georgia</option
              >
              <option value="Readex Pro" style="font-family: Readex Pro"
                >Readex Pro</option
              >
            </select>
            <div class="tooltip">Font</div>
          </div>

          <div class="tooltip-container" style="margin-right: -4px">
            <button
              aria-label="Decrease Font Size"
              on:click={() => handleFontSizeAdjust(-2)}
            >
              <i class="fi fi-br-minus-small"></i>
            </button>
            <div class="tooltip">Decrease Font Size</div>
          </div>

          <div class="tooltip-container3">
            <input
              type="text"
              id="font-size-input"
              aria-label="Font Size"
              value={displayFontSize}
              on:blur={handleFontSizeInput}
              on:keydown={(e) => e.key === "Enter" && handleFontSizeInput(e)}
            />
            <div class="tooltip">Font Size</div>
          </div>

          <div class="tooltip-container" style="margin-left: -6px;">
            <button
              aria-label="Increase Font Size"
              on:click={() => handleFontSizeAdjust(2)}
            >
              <i class="fi fi-br-plus-small"></i>
            </button>
            <div class="tooltip">Increase Font Size</div>
          </div>
          <div class="tooltip-container">
            <button
              on:click={() => editor.chain().focus().toggleBold().run()}
              class:active={editor.isActive("bold")}
              aria-label="Bold"
            >
              <i class="fi fi-rs-bold"></i>
            </button>
            <div class="tooltip">Bold</div>
          </div>
          <div class="tooltip-container">
            <button
              on:click={() => editor.chain().focus().toggleItalic().run()}
              class:active={editor.isActive("italic")}
              aria-label="Italic"
            >
              <i class="fi fi-bs-italic"></i>
            </button>
            <div class="tooltip">Italic</div>
          </div>
          <div class="tooltip-container">
            <button
              on:click={() => editor.chain().focus().toggleUnderline().run()}
              class:active={editor.isActive("underline")}
              aria-label="Underline"
            >
              <i class="fi fi-bs-underline"></i>
            </button>
            <div class="tooltip">Underline</div>
          </div>
          <div class="tooltip-container">
            <HighlightColorPicker {editor} />
          </div>
          <div class="tooltip-container">
            <TextColorPicker {editor} />
          </div>
          <div class="tooltip-container2">
            <AlignMenu {editor} />
          </div>
          <div class="tooltip-container2">
            <LineSpacingMenu {editor} />
          </div>
          <div class="tooltip-container">
            <InsertLink {editor} />
          </div>
          <div class="tooltip-container">
            <button
              on:click={() => editor.chain().focus().toggleBulletList().run()}
              class:active={editor.isActive("bulletList")}
              aria-label="Bullet List"
            >
              <i class="fa-solid fa-list-ul"></i>
            </button>
            <div class="tooltip">Bullet List</div>
          </div>
          <div class="tooltip-container">
            <button
              on:click={() => editor.chain().focus().toggleTaskList().run()}
              class:active={editor.isActive("taskList")}
              aria-label="Task List"
            >
              <i class="fa-solid fa-list-check"></i>
            </button>
            <div class="tooltip">Task List</div>
          </div>
          <div class="tooltip-container">
            <button
              on:click={() => editor.chain().focus().toggleOrderedList().run()}
              class:active={editor.isActive("orderedList")}
              aria-label="Numbered List"
            >
              <i class="fa-solid fa-list-ol"></i>
            </button>
            <div class="tooltip">Numbered List</div>
          </div>

          <div class="tooltip-container">
            <button
              on:click={() => editor.chain().focus().toggleBlockquote().run()}
              class:active={editor.isActive("blockquote")}
              aria-label="Blockquote"
            >
              <i class="fi fi-sr-block-quote"></i>
            </button>
            <div class="tooltip">Blockquote</div>
          </div>
          <div class="tooltip-container">
            <InsertTable
              on:insertTable={handleInsertTable}
              maxRows={10}
              maxCols={10}
            />
            <div class="tooltip">Insert Table</div>
          </div>
          <div class="tooltip-container">
            <button
              on:click={() => editor.chain().focus().toggleCode().run()}
              class:active={editor.isActive("code")}
              aria-label="Inline Code"
            >
              <i class="fa-solid fa-code"></i>
            </button>
            <div class="tooltip">Inline Code</div>
          </div>
          <div class="tooltip-container">
            <button
              on:click={() => editor.chain().focus().toggleCodeBlock().run()}
              class:active={editor.isActive("codeBlock")}
              aria-label="Code Block"
            >
              <i class="fi fi-rs-rectangle-code"></i>
            </button>
            <div class="tooltip">Code Block</div>
          </div>
          <div class="tooltip-container">
            <button
              on:click={() => editor.chain().focus().toggleSubscript().run()}
              class:active={editor.isActive("subscript")}
              aria-label="Subscript"
            >
              <i class="fi fi-bs-subscript" style="margin-top: 4px;"></i>
            </button>
            <div class="tooltip">Subscript</div>
          </div>
          <div class="tooltip-container">
            <button
              on:click={() => editor.chain().focus().toggleSuperscript().run()}
              class:active={editor.isActive("superscript")}
              aria-label="Superscript"
            >
              <i class="fi fi-bs-superscript" style="margin-bottom: 4px;"></i>
            </button>
            <div class="tooltip">Superscript</div>
          </div>
        {/if}
      </div>
    </div>
  </div>

  {#if isLoading}
    <div class="loading-indicator">
      <p>Loading document...</p>
    </div>
  {:else}
    <div class="scroll-wrapper">
      <div class="docseditor-container">
        <div bind:this={element} class="editor"></div>
      </div>
    </div>
  {/if}
</div>
