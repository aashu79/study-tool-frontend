export const toRenderableMarkdown = (input?: string | null): string => {
  if (!input) {
    return "";
  }

  let output = input.replace(/\r\n/g, "\n").trim();

  output = output.replace(/([^\n])\s*(#{1,6}\s+)/g, "$1\n\n$2");
  output = output.replace(/([^\n])\s*(\d+\.\s+)/g, "$1\n$2");
  output = output.replace(/([^\n])\s*(-\s+)/g, "$1\n$2");
  output = output.replace(/\n{3,}/g, "\n\n");

  return output;
};

