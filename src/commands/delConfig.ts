import * as vscode from "vscode";
import * as refreshViews from "../tools/refreshViews";

export function main(
  loadedView: vscode.TreeItem[],
  refresh: refreshViews.Main,
  context: vscode.ExtensionContext,
) {
  const main = vscode.commands.registerCommand(
    "snippetManager.delConfig",
    async (item: vscode.TreeItem) => {
      await vscode.window
        .showWarningMessage(
          `确定移除 ${item.label} 吗?`,
          { modal: true },
          "确定",
        )
        .then((ask) => {
          if (ask === "确定") {
            const index = loadedView.indexOf(item);
            loadedView.splice(index, 1);
          }
        });
      refresh.loaded();
    },
  );
  context.subscriptions.push(main);
}
