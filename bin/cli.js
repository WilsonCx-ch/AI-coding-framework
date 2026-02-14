#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');

const TEMPLATE_ROOT = path.join(__dirname, '..');

const EDITORS = [
  { name: 'Cursor', value: 'cursor' },
  { name: 'Claude', value: 'claude' },
  { name: 'OpenCode', value: 'opencode' },
  { name: 'Trae', value: 'trae' },
];

const AGENTS_LEVELS = [
  { name: '完整（rules + 全部 skills）', value: 'full' },
  { name: '仅 rules（不含 skills）', value: 'rules-only' },
  { name: '精简（rules + 自封装 skills）', value: 'minimal' },
];

const MINIMAL_SKILLS = [
  'create-api',
  'create-component',
  'create-route',
  'create-store',
  'theme-variables',
  'create-proposal',
  'design-analysis',
  'ui-verification',
];

function getSanitizedMcpJson() {
  return {
    mcpServers: {
      'ApiFox - 接口文档': {
        command: 'npx',
        args: ['-y', 'apifox-mcp-server@latest', '--project-id=你的项目ID'],
        env: { APIFOX_ACCESS_TOKEN: '你的 APIFOX 访问令牌' },
      },
      Figma: { url: 'https://mcp.figma.com/mcp', headers: {} },
      context7: { url: 'https://mcp.context7.com/mcp', headers: {} },
      Playwright: { command: 'npx @playwright/mcp@latest' },
      pencil: {
        name: 'pencil',
        transport: 'stdio',
        command: '安装 Pencil VS Code/Cursor 插件后，在扩展目录中查找 mcp-server 路径并填写于此',
        args: ['--app', 'cursor'],
        env: {},
      },
    },
  };
}

function getEditorReadme(editorName) {
  return `# ${editorName} 配置

本目录用于 ${editorName} 的规则与技能配置。

请将 \`rules\`、\`skills\` 指向项目根目录下的 \`.agents\` 目录（软链或按该 IDE 官方方式引用），以便与 \`.agents\` 唯一维护的规范与技能保持一致。
`;
}

function copyAgentsByLevel(templateRoot, targetDir, level) {
  const srcAgents = path.join(templateRoot, '.agents');
  const destAgents = path.join(targetDir, '.agents');
  if (!fs.existsSync(srcAgents)) return;

  fs.mkdirSync(destAgents, { recursive: true });

  const srcRules = path.join(srcAgents, 'rules');
  if (fs.existsSync(srcRules)) {
    fse.copySync(srcRules, path.join(destAgents, 'rules'));
  }

  const srcSkills = path.join(srcAgents, 'skills');
  const destSkills = path.join(destAgents, 'skills');
  if (!fs.existsSync(srcSkills)) return;

  if (level === 'rules-only') {
    if (fs.existsSync(path.join(srcSkills, 'README.md'))) {
      fs.mkdirSync(destSkills, { recursive: true });
      fs.copyFileSync(
        path.join(srcSkills, 'README.md'),
        path.join(destSkills, 'README.md')
      );
    }
    return;
  }

  if (level === 'minimal') {
    fs.mkdirSync(destSkills, { recursive: true });
    if (fs.existsSync(path.join(srcSkills, 'README.md'))) {
      fs.copyFileSync(
        path.join(srcSkills, 'README.md'),
        path.join(destSkills, 'README.md')
      );
    }
    for (const skill of MINIMAL_SKILLS) {
      const skillSrc = path.join(srcSkills, skill);
      if (fs.existsSync(skillSrc)) {
        fse.copySync(skillSrc, path.join(destSkills, skill));
      }
    }
    return;
  }

  fse.copySync(srcSkills, destSkills, {
    filter: (p) => {
      const rel = path.relative(srcSkills, p);
      if (rel === '') return true;
      const top = rel.split(path.sep)[0];
      return top !== 'node_modules' && !top.startsWith('.');
    },
  });
}

async function run() {
  const rawDir = process.argv[2];
  if (rawDir === '--help' || rawDir === '-h') {
    console.log(`
用法: npx create-ai-coding-framework [目标目录]

  目标目录 默认为当前目录。

示例:
  npx create-ai-coding-framework
  npx create-ai-coding-framework ./my-app
  npm init ai-coding-framework
`);
    process.exit(0);
  }

  const { default: inquirer } = await import('inquirer');
  const targetDir = path.resolve(process.cwd(), rawDir || '.');

  const answers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'editors',
      message: '选择要安装的编辑器（可多选）',
      choices: EDITORS,
    },
    {
      type: 'confirm',
      name: 'openSpec',
      message: '是否安装 OpenSpec 工作流（规格驱动开发）？',
      default: true,
    },
    {
      type: 'confirm',
      name: 'mcpTemplate',
      message: '是否安装 MCP 配置模板（Cursor 的 mcp.json 示例）？',
      default: true,
    },
    {
      type: 'list',
      name: 'agentsLevel',
      message: '.agents 内容级别（规范与技能）',
      choices: AGENTS_LEVELS,
      default: 'full',
    },
  ]);

  const { editors, openSpec, mcpTemplate, agentsLevel } = answers;

  fs.mkdirSync(targetDir, { recursive: true });

  if (fs.existsSync(path.join(TEMPLATE_ROOT, 'README.md'))) {
    fs.copyFileSync(
      path.join(TEMPLATE_ROOT, 'README.md'),
      path.join(targetDir, 'README.md')
    );
  }
  if (fs.existsSync(path.join(TEMPLATE_ROOT, '.gitignore'))) {
    fs.copyFileSync(
      path.join(TEMPLATE_ROOT, '.gitignore'),
      path.join(targetDir, '.gitignore')
    );
  }

  if (editors.includes('cursor')) {
    const srcCursor = path.join(TEMPLATE_ROOT, '.cursor');
    const destCursor = path.join(targetDir, '.cursor');
    if (fs.existsSync(srcCursor)) {
      fse.copySync(srcCursor, destCursor);
      const mcpPath = path.join(destCursor, 'mcp.json');
      if (mcpTemplate) {
        fse.writeJsonSync(mcpPath, getSanitizedMcpJson(), { spaces: 2 });
      } else if (fs.existsSync(mcpPath)) {
        fs.unlinkSync(mcpPath);
      }
    }
  }

  if (editors.includes('claude')) {
    const destClaude = path.join(targetDir, '.claude');
    fs.mkdirSync(destClaude, { recursive: true });
    fs.writeFileSync(
      path.join(destClaude, 'README.md'),
      getEditorReadme('Claude'),
      'utf8'
    );
  }
  if (editors.includes('opencode')) {
    const destOpenCode = path.join(targetDir, '.opencode');
    fs.mkdirSync(destOpenCode, { recursive: true });
    fs.writeFileSync(
      path.join(destOpenCode, 'README.md'),
      getEditorReadme('OpenCode'),
      'utf8'
    );
  }
  if (editors.includes('trae')) {
    const destTrae = path.join(targetDir, '.trae');
    fs.mkdirSync(destTrae, { recursive: true });
    fs.writeFileSync(
      path.join(destTrae, 'README.md'),
      getEditorReadme('Trae'),
      'utf8'
    );
  }

  if (openSpec && fs.existsSync(path.join(TEMPLATE_ROOT, 'openspec'))) {
    fse.copySync(
      path.join(TEMPLATE_ROOT, 'openspec'),
      path.join(targetDir, 'openspec')
    );
  }

  copyAgentsByLevel(TEMPLATE_ROOT, targetDir, agentsLevel);

  console.log('\n完成。已写入目录: ' + targetDir);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
