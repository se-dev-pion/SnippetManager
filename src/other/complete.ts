import * as vscode from "vscode";
import * as fs from "fs";
import * as xml from "xml2js";

export async function main(
  loadedView: vscode.TreeItem[],
  context: vscode.ExtensionContext,
) {
  const provider = vscode.languages.registerCompletionItemProvider(
    "*",
    {
      async provideCompletionItems(document, position, token, context) {
        var allSnippet = [];
        for (let item of loadedView) {
          const configPath = item.description as string;
          const fileContent = await fs.readFileSync(configPath, {
            encoding: "utf-8",
          });
          const result = await xml
            .parseStringPromise(fileContent)
            .catch((reason) => {
              vscode.window
                .showErrorMessage(
                  `${configPath} 文件读取错误!\n是否前往查看?`,
                  { modal: true },
                  "确定",
                )
                .then((ask) => {
                  if (ask !== "确定") {
                    return;
                  }
                  vscode.commands.executeCommand(
                    "vscode.open",
                    vscode.Uri.file(configPath),
                  );
                });
            });
          if (
            !(result && result.root && result.root.name && result.root.item)
          ) {
            vscode.window.showWarningMessage(
              "配置文件必须包含:root & root/name & root/snippetManagerConfig & root/item属性!",
            );
            continue;
          }
          for (let snippet of result.root.item) {
            if (
              document.languageId !== snippet.scope[0] &&
              snippet.scope[0] !== "*"
            ) {
              continue;
            }
            if (
              !(
                snippet &&
                snippet.scope &&
                snippet.key &&
                snippet.tip &&
                snippet.main
              )
            ) {
              vscode.window.showWarningMessage(
                `文件 ${result.root.name[0]} 中的item项需包含scope & key & tip & main属性`,
              );
              continue;
            }

            const mapping = {
              text: vscode.CompletionItemKind.Text,
              method: vscode.CompletionItemKind.Method,
              function: vscode.CompletionItemKind.Function,
              constructor: vscode.CompletionItemKind.Constructor,
              field: vscode.CompletionItemKind.Field,
              variable: vscode.CompletionItemKind.Variable,
              class: vscode.CompletionItemKind.Class,
              interface: vscode.CompletionItemKind.Interface,
              module: vscode.CompletionItemKind.Module,
              property: vscode.CompletionItemKind.Property,
              unit: vscode.CompletionItemKind.Unit,
              value: vscode.CompletionItemKind.Value,
              enum: vscode.CompletionItemKind.Enum,
              keyword: vscode.CompletionItemKind.Keyword,
              snippet: vscode.CompletionItemKind.Snippet,
              color: vscode.CompletionItemKind.Color,
              reference: vscode.CompletionItemKind.Reference,
              file: vscode.CompletionItemKind.File,
              folder: vscode.CompletionItemKind.Folder,
              enumMerber: vscode.CompletionItemKind.EnumMember,
              constant: vscode.CompletionItemKind.Constant,
              struct: vscode.CompletionItemKind.Struct,
              event: vscode.CompletionItemKind.Event,
              operator: vscode.CompletionItemKind.Operator,
              typeParameter: vscode.CompletionItemKind.TypeParameter,
              user: vscode.CompletionItemKind.User,
              issue: vscode.CompletionItemKind.Issue,
            };
            const newProvider = new vscode.CompletionItem(
              snippet.key[0],
              snippet.type
                ? mapping[snippet.type[0].slice(1) as keyof typeof mapping] ||
                    vscode.CompletionItemKind.Snippet
                : vscode.CompletionItemKind.Snippet,
            );
            newProvider.insertText = new vscode.SnippetString(snippet.main[0]);
            newProvider.detail = snippet.tip[0];
            allSnippet.push(newProvider);
          }
        }
        return allSnippet;
      },
    },
    ">",
  );
  context.subscriptions.push(provider);
}
