import * as vscode from "vscode";
import * as fs from "fs";
import * as xml from "xml2js";
import * as path from "path";

export function activate(context: vscode.ExtensionContext) {
  // ==================== 工具/配置 ====================
  // 刷新界面
  function refresh() {
    vscode.window.createTreeView("snippetManager-loaded", {
      treeDataProvider: {
        getChildren: () => treeData,
        getTreeItem: (item: vscode.TreeItem) => item,
      },
    });
  }
  const treeData: vscode.TreeItem[] = [];
  const treeStr: string[] = [];
  refresh();

  // ==================== 命令 ====================
  // 添加配置
  const addFile = vscode.commands.registerCommand(
    "snippetManager.addFile",
    async () => {
      const file = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: true,
        filters: {
          配置文件: ["xml"],
        },
        title: "选择配置文件",
      });
      if (file && file.length > 0) {
        if (!treeStr.includes(file[0].fsPath)) {
          const result = await xml.parseStringPromise(
            fs.readFileSync(file[0].fsPath, { encoding: "utf-8" }),
          );

          if (result.main.name) {
            const treeItem = new vscode.TreeItem(result.main.name[0]);
            treeItem.command = {
              command: "vscode.open",
              title: "打开文件",
              arguments: [vscode.Uri.file(file[0].fsPath)],
            };
            treeItem.description = file[0].fsPath;
            treeItem.contextValue = "configFile";
            treeData.push(treeItem);
            treeStr.push(file[0].fsPath);
            refresh();
          } else {
            vscode.window.showErrorMessage(
              `${file[0].fsPath} 配置文件需要有 name 属性`,
            );
          }
        }
      }
    },
  );
  context.subscriptions.push(addFile);

  // 移除配置
  const delConfig = vscode.commands.registerCommand(
    "snippetManager.delConfig",
    (item: vscode.TreeItem) => {
      const path = item.description as string;
      const name = item.label as string;
      vscode.window
        .showWarningMessage(
          `确认从列表移除 ${name} ${path} 吗？`,
          { modal: true },
          "确定",
        )
        .then((choose) => {
          if (choose === "确定") {
            const index = treeData.indexOf(item);
            if (index > -1) {
              treeData.splice(index, 1);
              treeStr.splice(index, 1);
              refresh();
            }
          }
        });
    },
  );
  context.subscriptions.push(delConfig);

  // 重新打开一个配置
  const reOpenConfig = vscode.commands.registerCommand(
    "snippetManager.reOpenConfig",
    async (item: vscode.TreeItem) => {
      // 删除
      const index = treeData.indexOf(item);
      if (index > -1) {
        treeData.splice(index, 1);
        treeStr.splice(index, 1);
        refresh();
      }
      // 添加
      const file = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: true,
        filters: {
          配置文件: ["xml"],
        },
        title: "选择配置文件",
      });
      if (file && file.length > 0) {
        if (!treeStr.includes(file[0].fsPath)) {
          const result = await xml.parseStringPromise(
            fs.readFileSync(file[0].fsPath, { encoding: "utf-8" }),
          );

          if (result.main.name) {
            const treeItem = new vscode.TreeItem(result.main.name[0]);
            treeItem.command = {
              command: "vscode.open",
              title: "打开文件",
              arguments: [vscode.Uri.file(file[0].fsPath)],
            };
            treeItem.contextValue = "configFile";
            treeItem.description = file[0].fsPath;
            treeData.push(treeItem);
            treeStr.push(file[0].fsPath);
            refresh();
          } else {
            vscode.window.showErrorMessage(
              `${file[0].fsPath} 配置文件需要有 name 属性`,
            );
          }
        }
      }
    },
  );
  context.subscriptions.push(reOpenConfig);

  // ==================== 其他/主要功能 ====================
  // 使用配置进行代码补全
  const provider = vscode.languages.registerCompletionItemProvider(
    "*",
    {
      async provideCompletionItems(document, position, token, context) {
        const allSnippet: vscode.CompletionItem[] = [];
        const extFilename = path.extname(document.fileName).slice(1);
        for (let configPath of treeStr) {
          if (fs.existsSync(configPath)) {
            try {
              const content = fs.readFileSync(configPath, {
                encoding: "utf-8",
              });
              const result = await xml.parseStringPromise(content);
              if (!result.main?.snippet) {
                vscode.window.showErrorMessage(
                  `文件 ${configPath} 格式错误，可能需要main或snippet属性`,
                );
                continue;
              }

              const snippets = Array.isArray(result.main.snippet)
                ? result.main.snippet
                : [result.main.snippet];

              for (let snippet of snippets) {
                const scope = snippet.scope[0].split(" ");
                if (scope.includes(extFilename) || snippet.scope[0] === "*") {
                  const newSnippet = new vscode.CompletionItem(
                    snippet.key[0],
                    snippet.type
                      ? parseInt(snippet.type[0])
                      : vscode.CompletionItemKind.Snippet,
                  );

                  // 对主要代码部分进行含参处理
                  var main: string = snippet.main[0];
                  const res = main.match(/{\d+(:[^}]*)?}/g);
                  for (let item of res ? res : []) {
                    const itemData = item.slice(1, -1).split(":");
                    main = main.replace(
                      item,
                      `\${${parseInt(itemData[0]) + 1}${itemData[1] ? ":" + itemData[1] : ""}}`,
                    );
                  }

                  newSnippet.insertText = new vscode.SnippetString(main);
                  newSnippet.detail = snippet.tip[0];
                  allSnippet.push(newSnippet);
                }
              }
            } catch (err) {
              vscode.window.showErrorMessage(
                `文件 ${configPath} 配置有误:\n${err}`,
              );
              continue;
            }
          }
        }
        return allSnippet;
      },
    },
    "",
  );
  context.subscriptions.push(provider);
}

export function deactivate() {}
