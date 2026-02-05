import path from "path";
import * as vscode from "vscode";

function addStyle(color: string) {
  let newStyle = vscode.window.createTextEditorDecorationType({
    color: color,
    border: `1px soild ${color}22`,
    borderRadius: "5px",
  });
  styles.push(newStyle);
  return newStyle;
}
function clearHighlight() {
  const editor = vscode.window.activeTextEditor;
  for (let style of styles) {
    editor?.setDecorations(style, []);
    style.dispose();
  }
}
var styles: vscode.TextEditorDecorationType[] = [];
export function scope() {
  const editor = vscode.window.activeTextEditor?.document;
  if (!editor) {
    return;
  }
  if (path.extname(editor.fileName) !== ".xml") {
    return;
  }
  const fileContent = editor.getText();
  const tags = new RegExp("<scope>([^ <>]*)</scope>", "g");
  let match;
  while ((match = tags.exec(fileContent)) !== null) {
    const content = match[1];
    const index = match.index;

    const startPos = editor.positionAt(index + 7);
    const endPos = editor.positionAt(index + 7 + content.length);
    const range = new vscode.Range(startPos, endPos);
    const defaultValue = { xml: "#2196F3" };
    const config = vscode.workspace.getConfiguration("snippetManager");
    const highlight = config.get("highlight", defaultValue) as Record<
      string,
      string
    >;
    let style;
    if (highlight[content]) {
      style = addStyle(highlight[content]);
    } else {
      style = vscode.window.createTextEditorDecorationType({ color: "" });
      styles.push(style);
    }
    vscode.window.activeTextEditor?.setDecorations(
      style as vscode.TextEditorDecorationType,
      [range],
    );
  }
}
export function args() {
  const editor = vscode.window.activeTextEditor?.document;
  if (!editor) {
    return;
  }
  if (path.extname(editor.fileName) !== ".xml") {
    return;
  }
  function addRange(
    start: number,
    end: number,
    color: string,
    editor: vscode.TextDocument,
  ) {
    const range = new vscode.Range(
      editor.positionAt(start),
      editor.positionAt(end),
    );
    let style = addStyle(color);
    vscode.window.activeTextEditor?.setDecorations(
      style as vscode.TextEditorDecorationType,
      [range],
    );
  }
  const fileContent = editor.getText();
  const tags1 = new RegExp(`\\$\\{(\\d+)(:[^}]*)?\\}`, "g");
  let match1;
  while ((match1 = tags1.exec(fileContent)) !== null) {
    const index = match1.index;
    addRange(index, index + 1, "#75b4e7", editor);
    addRange(index + 1, index + 2, "#e9cd51", editor);
    const length2 = match1[1].length;
    addRange(index + 2, index + 2 + length2, "#ffd587", editor);
    addRange(index + 2 + length2, index + 2 + length2 + 1, "#ffffff", editor);
    const length4 = match1[2].length;
    addRange(
      index + 2 + length2 + 1,
      index + 2 + length2 + length4,
      "#c5fa4a",
      editor,
    );
    addRange(
      index + 2 + length2 + 2,
      index + 2 + length2 + 1 + length4,
      "#e9cd51",
      editor,
    );
  }
  const tags2 = new RegExp(`\\$(\\d+)`, "g");
  let match2;
  while ((match2 = tags2.exec(fileContent)) !== null) {
    const index = match2.index;
    addRange(index, index + 1, "#75b4e7", editor);
    const length1 = match2[1].length;
    addRange(index + 1, index + 1 + length1, "#ffd587", editor);
  }
}
var timeout: NodeJS.Timeout;
vscode.window.onDidChangeTextEditorSelection((event) => {
  if (timeout) {
    clearTimeout(timeout);
  }
  timeout = setTimeout(() => {
    clearHighlight();
    scope();
    args();
  }, 1000);
});