import * as vscode from "vscode";

var styles: vscode.TextEditorDecorationType[] = [];
function addStyle(color: string, styles: vscode.TextEditorDecorationType[]) {
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
export function main() {
  const editor = vscode.window.activeTextEditor?.document;
  if (!editor) {
    return;
  }
  const fileContent = editor.getText();
  const tags = new RegExp("<scope>([^ <>]*)</scope>", "g");
  let match;
  clearHighlight();
  while ((match = tags.exec(fileContent)) !== null) {
    const content = match[1];
    const index = match.index;

    const startPos = editor.positionAt(index + 7);
    const endPos = editor.positionAt(index + 7 + content.length);
    const range = new vscode.Range(startPos, endPos);
    const defaultValue = {
      html: "#4CAF50",
      xml: "#2196F3",
      js: "#FF9800",
      css: "#9C27B0",
      json: "#00BCD4",
      python: "#3F51B5",
      sql: "#795548",
    };
    const config = vscode.workspace.getConfiguration("snippetManager");
    const hightlight = config.get("highlight", defaultValue) as Record<string, string>;
    let style;
    if (hightlight[content]) {
      style = addStyle(hightlight[content], styles);
    } else {
      style = vscode.window.createTextEditorDecorationType({
        color: "",
      });
      styles.push(style);
    }
    vscode.window.activeTextEditor?.setDecorations(
      style as vscode.TextEditorDecorationType,
      [range],
    );
  }
}
vscode.window.onDidChangeTextEditorSelection((event) => {
  main();
});
