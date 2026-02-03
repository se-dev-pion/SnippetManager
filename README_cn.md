# SnippetManager - 代码片段管理器

一个轻量、灵活的 VS Code 扩展，让你可以轻松管理和使用自定义的代码片段。

## 特性

- **灵活的代码片段管理**：支持从多个 XML 配置文件动态加载代码片段
- **智能代码补全**：根据当前文件类型自动过滤和提示相关片段
- **可视化配置管理**：通过 TreeView 界面直观管理所有配置文件
- **自定义语法支持**：使用简洁的 `{顺序:默认值}` 语法创建带参数的代码片段

## 基本使用
1. 点击活动栏中的 "片段管理器" 图标
2. 点击顶部的`添加文件`按钮添加你的 XML 片段配置文件
3. 在支持的文件类型中，输入触发字符即可看到代码片段建议

## 配置文件格式

### XML 文件结构
```xml
<main>
  <name>名称</name>
  <snippet>
    <scope>作用域(后缀判断)</scope>
    <key>关键字符</key>
    <tip>描述</tip>
    <type>图标</type>
    <main>主要代码</main>
  </snippet>
  ...
</main>
```

### 字段说明
- **name**：配置文件的显示名称
- **snippet**：一个代码片段
- **scope**：适用文件扩展名（空格分隔），使用 `*` 表示所有文件
- **key**：触发代码补全的关键词
- **tip**：片段描述（显示在补全提示中）
- **type**：补全项图标类型（可选，对应 VS Code 的 CompletionItemKind）
- **main**：代码片段内容，支持自定义占位符语法

## 自定义语法

SnippetManager 使用简洁的自定义语法创建带参数的代码片段：

### 基础语法
- `{0}` → 第一个占位符（转换为 `$1`）
- `{1:default}` → 带默认值的占位符（转换为 `${2:default}`）
- `{0:div}` → 带默认值的第一个占位符（转换为 `${1:div}`）

### 使用示例
```xml
<main><![CDATA[
function {0:functionName}({1:args}) {
    {2}
}
]]></main>
```

当插入此片段时，光标会依次跳转到 `functionName` → `args` → 函数体位置。

### 高亮显示

#### 设置
在snippetManager设置中有一个名为“highlight”的设置项，点击在settings.json文件打开链接，即可跳转至settings.json配置文件
编写highlight时，使用`scope: color`(`后缀名: 颜色`)来定义高亮颜色
#### 示例
```json
{
  "html": "#ebbc24",
  "xml": "#ce2c03",
  "py": "#1e7be6"
  // ...
}
```
#### 效果
设置完成后，打开一个片段配置文件，在scope这个属性中你可以看到对应文本被更改为对应颜色
![加载失败](https://github.com/se-dev-pion/SnippetManager/tree/main/image/highlight.png)


## 开发指南

### 环境要求
- Node.js ≥ 16.x
- VS Code ≥ 1.80.0

### 本地开发
```bash
# 克隆仓库
git clone https://github.com/se-dev-pion/SnippetManager.git

# 安装依赖
cd SnippetManager
npm install

# 编译和运行
npm run compile
# 按 F5 启动调试扩展
```

### 项目结构
```
SnippetManager/
├── src/
│   └── extension.ts      # 扩展主文件
├── res/                  # 资源文件
├── package.json          # 扩展配置
└── snippets/             # 示例片段文件
```

### 构建发布
```bash
# 安装 vsce
npm install -g @vscode/vsce

# 打包扩展
vsce package
```

## 📄 许可证

本项目采用 MIT 许可证。详见 [LICENSE](https://github.com/se-dev-pion/SnippetManager/blob/main/LICENSE) 文件。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！请确保：
1. 代码符合现有代码风格
2. 提交前运行 `npm run lint` 检查
3. 更新相关文档

## 支持

遇到问题？请：
1. 查看 [Issues](https://github.com/se-dev-pion/SnippetManager/issues) 是否有类似问题
2. 创建新的 Issue 描述详细情况

---

**提示**：这个插件特别适合需要频繁使用自定义代码片段的开发者。通过将常用代码片段组织到 XML 文件中，你可以在不同项目和团队间轻松共享和同步你的开发工具集。

## 更新日志

### v0.0.1
- 初始版本发布
- 支持 XML 配置文件动态加载
- 实现自定义语法解析器
- 添加 TreeView 配置管理界面
- 支持代码补全和参数化片段

---

*SnippetManager - 让代码片段管理变得简单高效*