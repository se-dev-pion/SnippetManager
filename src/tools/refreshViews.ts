import * as vscode from "vscode";

export class main {
  loadedShow: vscode.TreeItem[] = [];
  loaded() {
    vscode.window.createTreeView("snippetManager.loadedView", {
      treeDataProvider: {
        getChildren: () => this.loadedShow,
        getTreeItem: (item: vscode.TreeItem) => item,
      },
    });
    return this.loadedShow;
  }
}
