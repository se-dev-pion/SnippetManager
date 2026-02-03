# SnippetManager - Code Snippet Manager

A lightweight, flexible VS Code extension that allows you to easily manage and use custom code snippets.

## Features

- **Flexible Snippet Management**: Dynamically loads snippets from multiple XML configuration files
- **Intelligent Code Completion**: Automatically filters and suggests relevant snippets based on the current file type
- **Visual Configuration Management**: Manage all configuration files intuitively through a TreeView interface
- **Custom Syntax Support**: Create parameterized snippets using a concise `{order:default}` syntax

## Basic Usage
1. Click the "Snippet Manager" icon in the Activity Bar
2. Click the `Add File` button at the top to add your XML snippet configuration file
3. In supported file types, type the trigger character to see snippet suggestions

## Configuration File Format

### XML File Structure
```xml
<main>
  <name>Name</name>
  <snippet>
    <scope>Scope (file extension filter)</scope>
    <key>Trigger keyword</key>
    <tip>Description</tip>
    <type>Icon</type>
    <main>Main code</main>
  </snippet>
  ...
</main>
```

### Field Descriptions
- **name**: Display name of the configuration file
- **snippet**: A single code snippet
- **scope**: Applicable file extensions (space-separated). Use `*` for all files
- **key**: Keyword that triggers code completion
- **tip**: Snippet description (displayed in completion hints)
- **type**: Completion item icon type (optional, corresponds to VS Code's CompletionItemKind)
- **main**: Snippet content, supports custom placeholder syntax

## Custom Syntax

SnippetManager uses a concise custom syntax to create parameterized snippets:

### Basic Syntax
- `{0}` → First placeholder (converts to `$1`)
- `{1:default}` → Placeholder with default value (converts to `${2:default}`)
- `{0:div}` → First placeholder with default value (converts to `${1:div}`)

### Usage Example
```xml
<main><![CDATA[
function {0:functionName}({1:args}) {
    {2}
}
]]></main>
```

When inserting this snippet, the cursor will sequentially jump to `functionName` → `args` → function body position.

# Highlight Display

## Settings
In the snippetManager settings, there is an option named "highlight". Click the link to open settings.json file, and you will be redirected to the settings.json configuration file.

When configuring highlight, use the format `extension: color` to define highlight colors.

## Example
```json
{
  "html": "#ebbc24",
  "xml": "#ce2c03",
  "py": "#1e7be6"
  // ...
}
```

## Effect
After configuration, open a snippet configuration file. In the scope attribute, you will see the corresponding text displayed in the specified color.

![Failed to load](https://github.com/se-dev-pion/SnippetManager/blob/main/image/highlight.png)

## Development Guide

### Requirements
- Node.js ≥ 16.x
- VS Code ≥ 1.80.0

### Local Development
```bash
# Clone repository
git clone https://github.com/se-dev-pion/SnippetManager.git

# Install dependencies
cd SnippetManager
npm install

# Compile and run
npm run compile
# Press F5 to launch and debug the extension
```

### Project Structure
```
SnippetManager/
├── src/
│   └── extension.ts      # Extension main file
├── res/                  # Resource files
├── package.json          # Extension configuration
└── snippets/             # Example snippet files
```

### Build & Publish
```bash
# Install vsce
npm install -g @vscode/vsce

# Package extension
vsce package
```

## 📄 License

This project is licensed under the MIT License. See the [LICENSE]([LICENSE](https://github.com/se-dev-pion/SnippetManager/blob/main/LICENSE)) file for details.

## 🤝 Contributing

Issues and Pull Requests are welcome! Please ensure:
1. Code follows the existing style
2. Run `npm run lint` before submitting
3. Update relevant documentation

## Support

Having issues? Please:
1. Check [Issues](https://github.com/se-dev-pion/SnippetManager/issues) for similar problems
2. Create a new Issue with detailed information

---

**Tip**: This extension is particularly useful for developers who frequently use custom code snippets. By organizing commonly used snippets into XML files, you can easily share and synchronize your development toolkit across different projects and teams.

## Changelog

### v0.0.1
- Initial version released
- Support dynamic loading of XML configuration files
- Implement custom syntax parser
- Add TreeView configuration management interface
- Support code completion and parameterized snippets

---

*SnippetManager - Making code snippet management simple and efficient*