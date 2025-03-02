<script>
  import { onMount, onDestroy } from "svelte";
  import { Editor } from "@tiptap/core";
  import StarterKit from "@tiptap/starter-kit";
  import TaskItem from "@tiptap/extension-task-item";
  import TaskList from "@tiptap/extension-task-list";
  import Table from "@tiptap/extension-table";
  import TableCell from "@tiptap/extension-table-cell";
  import TableHeader from "@tiptap/extension-table-header";
  import TableRow from "@tiptap/extension-table-row";
  import Image from "@tiptap/extension-image";
  import CharacterCount from "@tiptap/extension-character-count";
  import ImageResize from "tiptap-extension-resize-image";

  let element;
  let editor;

  onMount(() => {
    editor = new Editor({
      element: element,
      editorProps: {
        attributes: {
          class: "element",
          style: "padding-left: 56px; padding-right: 56px;",
        },
      },
      extensions: [
        StarterKit,
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
        Image,
        ImageResize,
        CharacterCount.configure({
          wordCounter: (text) =>
            text.split(/\s+/).filter((word) => word !== "").length,
        }),
      ],
      content: `
        <table>
          <tbody>
            <tr>
              <th>Name</th>
              <th colspan="3">Description</th>
            </tr>
            <tr>
              <td>Cyndi Lauper</td>
              <td>Singer</td>
              <td>Songwriter</td>
              <td>Actress</td>
            </tr>
          </tbody>
        </table>

                <p>This is a basic example of implementing images. Drag to re-order.</p>
        <img src="https://placehold.co/800x400" />
        <img src="https://placehold.co/800x400/6A00F5/white" />

                <table>
          <tbody>
            <tr>
              <th>Name</th>
              <th colspan="3">Description</th>
            </tr>
            <tr>
              <td>Cyndi Lauper</td>
              <td>Singer</td>
              <td>Songwriter</td>
              <td>Actress</td>
            </tr>
          </tbody>
        </table>
      `,
      onTransaction: () => {
        // force re-render so `editor.isActive` works as expected
        editor = editor;
      },
    });
    console.log(editor.storage);
  });

  onDestroy(() => {
    if (editor) {
      editor.destroy();
    }
  });
</script>

<div class="editor-wrapper">
  <div class="editor-tools">
    {#if editor}
      <button
        on:click={() =>
          editor.chain().focus().toggleHeading({ level: 1 }).run()}
        class:active={editor.isActive("heading", { level: 1 })}
      >
        H1
      </button>
      <button
        on:click={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()}
        class:active={editor.isActive("heading", { level: 2 })}
      >
        H2
      </button>
      <button
        on:click={() => editor.chain().focus().setParagraph().run()}
        class:active={editor.isActive("paragraph")}
      >
        P
      </button>
    {/if}
  </div>

  <div class="docseditor-container">
    <div bind:this={element} class="editor">
      {#if editor?.storage?.characterCount}
        <!-- <div class="character-counter">
          <p>{editor.storage.characterCount.characters()} characters</p>
          <p>{editor.storage.characterCount.words()} words</p>
        </div> -->
      {/if}
    </div>
  </div>
</div>

<style>
  button.active {
    background: black;
    color: white;
  }
</style>
