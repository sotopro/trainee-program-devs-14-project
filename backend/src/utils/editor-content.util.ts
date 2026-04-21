export function extractPlainText(editorContent: { blocks: Array<{ type: string; data: Record<string, unknown> }> }): string {
  return editorContent.blocks
    .map(block => {
      switch (block.type) {
        case 'header':
        case 'paragraph':
          return block.data.text as string;
        case 'list':
          return (block.data.items as string[]).join('\n');
        case 'code':
          return `Codigo: ${block.data.code as string}`;
        default:
          return '';
      }
    })
    .filter(Boolean)
    .join('\n\n');
}
