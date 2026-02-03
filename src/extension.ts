import * as vscode from "vscode";
import * as fs from "fs";
import * as xml from "xml2js";
import * as path from "path";

export function activate(context: vscode.ExtensionContext) {
  // ==================== 工具/配置 ====================
  // 刷新界面
  function refreshViews() {
    vscode.window.createTreeView("snippetManager-loaded", {
      treeDataProvider: {
        getChildren: () => treeData,
        getTreeItem: (item: vscode.TreeItem) => item,
      },
    });
  }
  const treeData: vscode.TreeItem[] = [];
  const treeStr: string[] = [];
  refreshViews();

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
            refreshViews();
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
              refreshViews();
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
        refreshViews();
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
            refreshViews();
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

  // 刷新高亮
  const refreshHighlight = vscode.commands.registerCommand(
    "snippetManager.refreshHighlight",
    async () => {
      const config = vscode.workspace.getConfiguration("snippetManager");
      const file = vscode.window.activeTextEditor?.document;
      const highlight = config.get<Record<string, string>>("highlight", {});
      if (!(file?.fileName && path.extname(file.fileName) === ".xml")) {
        return;
      }
      const fileContent = await xml.parseStringPromise(file.getText());
      if (!fileContent.main.snippetManagerConfig) {
        return;
      }

      for (let key in highlight) {
        const fileContent = file.getText();
        const style = vscode.window.createTextEditorDecorationType({
          color: highlight[key],
        });
        const regexp = new RegExp(`(<scope>.*)${key}.*</scope>`, "g");
        let match;
        var index = -1;
        var allRange = [];
        while ((match = regexp.exec(fileContent)) !== null) {
          while ((index = fileContent.indexOf(match[0], index + 1)) !== -1) {
            allRange.push(
              new vscode.Range(
                file.positionAt(index + match[1].length),
                file.positionAt(index + key.length + match[1].length),
              ),
            );
          }
        }
        const editor = vscode.window.activeTextEditor;
        editor?.setDecorations(style, allRange);
      }
    },
  );
  context.subscriptions.push(refreshHighlight);

  // ==================== 其他/主要功能 ====================
  // 监听事件进行高亮
  vscode.window.onDidChangeActiveTextEditor((editor) => {
    vscode.commands.executeCommand("snippetManager.refreshHighlight");
  });
  vscode.workspace.onDidSaveTextDocument((editor) => {
    vscode.commands.executeCommand("snippetManager.refreshHighlight");
  });
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

  const typeProvider = vscode.languages.registerCompletionItemProvider(
    "xml",
    {
      async provideCompletionItems(document, position, token, context) {
        const fileContent = await xml.parseStringPromise(document.getText());
        if (!fileContent.main.snippetManagerConfig) {
          return;
        }
        const typeList = {
          "Text(文本)": "0",
          "Method(方法)": "1",
          "Function(函数)": "2",
          "Constructor(构造函数)": "3",
          "Field(字段)": "4",
          "Variable(变量)": "5",
          "Class(类)": "6",
          "Interface(接口)": "7",
          "Module(模型)": "8",
          "Property(属性)": "9",
          "Unit(单元)": "10",
          "Value(值)": "11",
          "Enum(枚举)": "12",
          "Keyword(关键词)": "13",
          "Snippet(片段)": "14",
          "Color(颜色)": "15",
          "Reference(参考)": "16",
          "File(文件)": "17",
          "Folder(文件夹)": "18",
          "EnumMember(枚举成员)": "19",
          "Constant(常量)": "20",
          "Struct(结构体)": "21",
          "Event(事件)": "22",
          "Operator(操作成员)": "23",
          "TypeParameter(类型参数)": "24",
          "User(用户)": "25",
          "Issue(议题)": "26",
        };
        var allProvider = [];
        for (let key in typeList) {
          const item = new vscode.CompletionItem(
            key,
            parseInt(typeList[key as keyof typeof typeList]),
          );
          item.insertText = typeList[key as keyof typeof typeList];
          allProvider.push(item);
        }
        return allProvider;
      },
    },
    "",
  );
}

export function deactivate() {}
