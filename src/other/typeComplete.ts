import * as vscode from "vscode";

export function main(context: vscode.ExtensionContext) {
  const main = vscode.languages.registerCompletionItemProvider(
    "xml",
    {
      provideCompletionItems(document, position, token, context) {
        const lineText = document.lineAt(position.line).text;
        if (lineText[position.character - 1] !== "#") {
          return;
        }
        const mapping = {
          "Text(文本)": "text",
          "Method(方法)": "method",
          "Function(函数)": "function",
          "Constructor(构造函数)": "constructor",
          "Field(字段)": "field",
          "Variable(变量)": "variable",
          "Class(类)": "class",
          "Interface(接口)": "interface",
          "Module(模块)": "module",
          "Property(属性)": "property",
          "Unit(单元)": "unit",
          "Value(值)": "value",
          "Enum(枚举)": "enum",
          "Keyword(关键词)": "keyword",
          "Snippet(代码片段)": "snippet",
          "Color(颜色)": "color",
          "Reference(引用)": "reference",
          "File(文件)": "file",
          "Folder(文件夹)": "folder",
          "EnumMember(枚举成员)": "enumMerber",
          "Constant(常量)": "constant",
          "Struct(结构体)": "struct",
          "Event(事件)": "event",
          "Operator(运算符)": "operator",
          "TypeParameter(类型参数)": "typeParameter",
          "User(用户)": "user",
          "Issue(问题)": "issue",
        };
        const mapping2 = {
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
        var allType = [];
        for (let type in mapping) {
          const newComplete = new vscode.CompletionItem(
            type,
            mapping2[
              mapping[type as keyof typeof mapping] as keyof typeof mapping2
            ],
          );
          newComplete.insertText = mapping[type as keyof typeof mapping];
          allType.push(newComplete);
        }

        return allType;
      },
    },
    "#",
  );
  context.subscriptions.push(main);
}
