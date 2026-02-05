import * as vscode from "vscode";
import * as fs from "fs";
import * as xml from "xml2js";
import * as path from "path";

export function main(context: vscode.ExtensionContext) {
  const main = vscode.commands.registerCommand(
    "snippetManager.compiler",
    async () => {
      const file = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        filters: {
          片段文件: ["code-snippets", "xml"],
        },
        title: "打开要转移的文件(.xml/.code-snippets)",
      });
      if (!(file && file.length > 0)) {
        return;
      }
      const filePath = file[0].fsPath;
      const extname = path.extname(filePath);
      const fileContent = await fs.readFileSync(filePath, {
        encoding: "utf-8",
      });
      if (extname === ".code-snippets") {
        const result = JSON.parse(fileContent);
        var writeContent = `<root>\n  <name>${path.parse(filePath).name}</name>\n`;
        for (let id in result) {
          writeContent += `  <item id="${id}">\n`;
          writeContent += `    <scope>${result[id].scope.split(",")[0]}</scope>\n`;
          writeContent += `    <key>${result[id].prefix}</key>\n`;
          writeContent += `    <tip>${result[id].description}</tip>\n`;
          if (Array.isArray(result[id].body)) {
            writeContent += `    <main><![CDATA[${result[id].body[0]}\n`;
            for (let index = 1; index < result[id].body.length; index++) {
              writeContent += `${result[id].body[index]}${index + 1 !== result[id].body.length ? "\n" : ""}`;
            }
            writeContent += "]]></main>\n";
          } else {
            writeContent += `    <main><![CDATA[${result[id].body}]]></main>\n`;
          }
          writeContent += "  </item>\n";
        }
        writeContent += "</root>";
        const folderPath = path.dirname(filePath);
        await fs.writeFileSync(
          `${folderPath}/${path.parse(filePath).name}.xml`,
          writeContent,
        );
        vscode.window
          .showInformationMessage(
            `数据已保存到${folderPath}/${path.parse(filePath).name}.xml\n是否立即查看?`,
            { modal: true },
            "确定",
          )
          .then((ask) => {
            if (ask === "确定") {
              vscode.commands.executeCommand(
                "vscode.open",
                vscode.Uri.file(
                  `${folderPath}/${path.parse(filePath).name}.xml`,
                ),
              );
            }
          });
      } else if (extname === ".xml") {
        const result = await xml.parseStringPromise(fileContent);
        var writeContent = "";
        let index = 0;
        writeContent += "{\n";
        for (let item of result.root.item) {
          if (item.$ && item.$.id) {
            writeContent += `  "${item.$.id}": {\n`;
          } else {
            writeContent += `  "item-${index}": {\n`;
          }
          writeContent += `    "scope": "${item.scope[0]}",\n`;
          writeContent += `    "prefix": "${item.key[0]}",\n`;
          writeContent += `    "description": "${item.tip[0]}",\n`;
          if (item.main[0].includes("\n")) {
            writeContent += `    "body": [\n`;
            let index = 0;
            for (let line of item.main[0].split("\n")) {
              writeContent += `      "${index + 1 !== item.main[0].split("\n").length ? line.slice(0, -1) : line}"${index + 1 !== item.main[0].split("\n").length ? ",\n" : "\n"}`;
              index++;
            }
            writeContent += `    ]\n`;
          } else {
            writeContent += `    "body": "${item.main[0]}"\n`;
          }
          writeContent += `  }${index + 1 !== result.root.item.length ? ",\n" : "\n"}`;
          index++;
        }
        writeContent += "}";
        const folderPath = path.dirname(filePath);
        await fs.writeFileSync(
          `${folderPath}/${path.parse(filePath).name}.code-snippets`,
          writeContent,
        );
        vscode.window
          .showInformationMessage(
            `数据已保存到${folderPath}/${path.parse(filePath).name}.code-snippets\n是否立即查看?`,
            { modal: true },
            "确定",
          )
          .then((ask) => {
            if (ask === "确定") {
              vscode.commands.executeCommand(
                "vscode.open",
                vscode.Uri.file(
                  `${folderPath}/${path.parse(filePath).name}.code-snippets`,
                ),
              );
            }
          });
      }
    },
  );
  context.subscriptions.push(main);
}
