import * as vscode from "vscode";

export class Main {
  loadedView: vscode.TreeItem[] = [];
  loaded() {
    vscode.window.createTreeView("snippetManager.loadedView", {
      treeDataProvider: {
        getChildren: () => this.loadedView,
        getTreeItem: (item: vscode.TreeItem) => item,
      },
    });
    return this.loadedView;
  }
}
