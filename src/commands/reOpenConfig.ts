import * as vscode from "vscode";
import * as fs from "fs";
import * as xml from "xml2js";
import * as refreshViews from "../tools/refreshViews";

export function main(
  loadedView: vscode.TreeItem[],
  refresh: refreshViews.main,
  context: vscode.ExtensionContext,
) {
  const main = vscode.commands.registerCommand(
    "snippetManager.reOpenConfig",
    async (item: vscode.TreeItem) => {
      const file = await vscode.window.showOpenDialog({
        title: "选择配置文件(.xml)",
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        filters: {
          配置文件: ["xml"],
          所有文件: ["*"],
        },
      });
      if (!(file && file.length > 0)) {
        return;
      }
      for (let item of loadedView) {
        if (item.description === file[0].fsPath) {
          vscode.window.showWarningMessage("此文件已经存在!");
          return;
        }
      }

      const fileContent = await fs.readFileSync(file[0].fsPath, {
        encoding: "utf-8",
      });
      const result = await xml.parseStringPromise(fileContent);
      if (
        !(
          result &&
          result.root &&
          result.root.name &&
          result.root.item
        )
      ) {
        vscode.window.showWarningMessage(
          "配置文件必须包含:root & root/name & root/snippetManagerConfig & root/item属性!",
        );
        return;
      }
      const newItem = new vscode.TreeItem(result.root.name[0]);
      newItem.description = file[0].fsPath;
      newItem.contextValue = "configItem";
      const index = loadedView.indexOf(item);
      loadedView[index] = newItem;
      refresh.loaded();
    },
  );
  context.subscriptions.push(main);
}
