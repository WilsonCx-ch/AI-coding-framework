# AI-coding-framework
本项目是适用于AI Coding落地的参考项目，支持主流的AI coding方法。

架构组成	说明
SDD	
MCP	
Rules	
Skills

使用说明
脚手架功能

项目结构
项目根/
├── .agents/                    # 唯一维护的规范与技能目录
│   ├── rules/                  # 规则
│   └── skills/                 # 技能
│
├── .cursor/                    # Cursor：内部 rules、skills 软链到 .agents
├── .claude/                    # Claude：同上
├── .opencode/                  # OpenCode：同上
└── .trae/                      # Trae：同上
