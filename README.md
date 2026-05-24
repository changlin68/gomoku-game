# 五子棋 (Gomoku)

一个基于 HTML/CSS/JavaScript 的纯前端五子棋对战游戏。

## 在线体验

直接打开 `index.html` 即可开始游戏，或使用内置服务器启动。

## 快速开始

### 方式一：直接打开

使用浏览器直接打开 `index.html` 文件。

### 方式二：本地服务器（推荐）

```bash
# 使用内置 Node.js 服务器
node server.js

# 或使用 start.bat（Windows）
start.bat
```

服务器启动后自动在浏览器打开 `http://localhost:8088`。

## 功能特性

- **标准棋盘**：15 × 15 标准五子棋棋盘，含星位点标记
- **双人对战**：黑棋先行，轮流落子
- **胜负判定**：实时检测横、竖、斜四个方向五子连珠
- **悔棋功能**：支持撤销上一步落子
- **计时器**：从第一次落子开始计时，精确到秒
- **最后一步标记**：高亮显示最近一次落子位置
- **重新开始**：一键重置棋盘，开启新对局

## 技术栈

| 技术 | 用途 |
|------|------|
| HTML5 | 页面结构 |
| CSS3 | 棋盘与棋子样式 |
| JavaScript (ES6 Modules) | 游戏逻辑与交互 |
| Node.js | 本地静态服务器 |

## 项目结构

```
gomoku-game/
├── index.html      # 游戏主页面
├── game.js         # 核心游戏逻辑（棋盘、落子、胜负判定）
├── main.js         # 页面交互与渲染
├── styles.css      # 样式文件
├── server.js       # Node.js 本地服务器
└── start.bat       # Windows 快捷启动脚本
```

## 游戏截图

棋盘采用经典的木质色调设计，黑棋与白棋在交叉点落子，界面简洁直观。

## 浏览器兼容

- Chrome / Edge / Firefox / Safari 等现代浏览器
- 需支持 ES6 Modules

## 开源协议

[MIT](LICENSE)
