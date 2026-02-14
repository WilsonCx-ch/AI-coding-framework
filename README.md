# AI Coding Project

本项目是 AI Coding 落地架构的参考项目，支持所有主流支持 Skills 的 Agent/AI Coding IDE。

## 项目架构

| 架构组成 | 说明                                                                                |
| -------- | ----------------------------------------------------------------------------------- |
| SDD      | 开发流程控制，保证需求不遗漏，开发不脱节，可进行需求分析/开发规划/验收测试/复盘归档 |
| MCP      | 对接外部能力，如设计稿读取、浏览器访问页面查看实际效果、接口文档                    |
| Rules    | 约定「做什么、不做什么」，如保证 AI 遵循项目结构，规范约束，代码风格                |
| Skills   | 约定「怎么做」，渐进披露按需指导 AI 怎么做，如怎么写UI，怎么验收UI                  |

## 使用说明

Skills、Rules 可复制到你的项目中使用，OpenSpec、MCP 只在 Cursor 下作为参考，集成到你自己的项目请根据官方文档自行集成

## 项目结构

```text
项目根/
├── .agents/                    # 唯一维护的规范与技能目录
│   ├── rules/                  # 规则
│   └── skills/                 # 技能
│
├── .cursor/                    # Cursor：内部 rules、skills 软链到 .agents
├── .claude/                    # Claude：同上
├── .opencode/                  # OpenCode：同上
└── .trae/                      # Trae：同上
```

## 脚手架安装

本项目可作为 npm 脚手架使用，在目标目录中按需选择编辑器和 AI 助手能力后再复制配置：

```bash
npx create-ai-coding-framework [目标目录]
# 或
npm init ai-coding-framework
```

交互会引导选择：编辑器（Cursor / Claude / OpenCode / Trae）、是否安装 OpenSpec 工作流、是否安装 MCP 配置模板、以及 `.agents` 内容级别（完整 / 仅 rules / 精简）。
