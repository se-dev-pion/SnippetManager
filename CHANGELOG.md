# Change Log

## Now
- 侧边栏
  - 添加(addConfig)
  - 编译配置文件(compiler)
  - 项
    - 菜单
      - 移除(delConfig)
      - 重新打开(reOpenConfig)
    - 点击打开
- 配置文件
  - 格式
    ```xml
    <root>
      <snippetManagerConfig />
      <name>${1:名称}</name>
      <item>
        <scope>${2:作用域(后缀判断)}</scope>
        <key>${3:关键字符}</key>
        <tip>${4:描述}</tip>${5:
        <type>类型</type>}
        <main>${0:主要代码}</main>
      </item>
    </root>
    ```
  - 补全
    - 类型(按下"#"即可触发)，前面的"#"不用删除
  - 报错
    - 加载文件
      - 根目录判断(root & root/name & root/snippetManagerConfig & root/item)
      - item标签判断(scope & key & tip & main)
    - 加载成功
      - 用户更改，导致错误；使用时提醒用户是否打开查看