#!/usr/bin/env node

/**
 * create-game CLI
 *
 * 使い方:
 * ----------------------------------------
 * node script/create-game.ts <gameName>
 *
 * 例:
 * node script/create-game.ts myGame
 *
 * 実行すると以下のディレクトリが生成される:
 *
 * games/
 *   myGame/
 *     server/
 *       actions/
 *     shared/
 *     client/
 *       components/
 *       hooks/
 *
 * ※ テンプレートファイルの生成は後で追加する
 */

const fs = require('fs');
const path = require('path');

// 引数からゲーム名を取得
const gameName = process.argv[2];

// 命名変換
const toKebabCase = (str) =>
  str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase();

const toPascalCase = (str) =>
  str
    .replace(/[-_ ]+(\w)/g, (_, c) => c.toUpperCase())
    .replace(/^(\w)/, (_, c) => c.toUpperCase());

if (!gameName) {
  console.error('❌ ゲーム名を指定してください');
  process.exit(1);
}

const dirName = toKebabCase(gameName);
const pascalName = toPascalCase(gameName);

// 生成先パス
const basePath = path.join(process.cwd(), 'games', dirName);

// 既存ゲームチェック
if (fs.existsSync(basePath)) {
  console.error(`❌ ゲーム "${gameName}" は既に存在します`);
  process.exit(1);
}

// 作成するディレクトリ一覧
const directories = [
  'assets',
  'assets/img',
  'assets/audio',
  'client',
  'client/components',
  'client/context',
  'client/hooks',
  'client/layouts',
  'client/utils',
  'server',
  'server/actions',
  'server/engine',
  'server/generation',
  'server/state',
  'server/utils',
  'shared',
  'shared/types',
];

// ディレクトリ作成
directories.forEach((dir) => {
  const fullPath = path.join(basePath, dir);
  fs.mkdirSync(fullPath, { recursive: true });
  console.log(`📁 created: ${fullPath}`);
});

// ファイル作成ヘルパー
const createFile = (relativePath, content = '') => {
  const fullPath = path.join(basePath, relativePath);
  fs.writeFileSync(fullPath, content);
  console.log(`📄 created: ${fullPath}`);
};

const TEMPLATE_ROOT = path.join(__dirname, 'templates/game');
// テンプレ読み込み
const readTemplate = (templatePath) => {
  const fullPath = path.join(TEMPLATE_ROOT, templatePath);
  return fs.readFileSync(fullPath, 'utf-8');
};

// テンプレ適用
const applyTemplate = (template) => {
  return template
    .replace(/__PASCAL_NAME__/g, pascalName)
    .replace(/__DIR_NAME__/g, dirName);
};

// ファイル生成（テンプレ適用）
createFile('index.ts', applyTemplate(readTemplate('index.ts.tpl')));

createFile('client/components/Modal.tsx', readTemplate('client/Modal.tsx.tpl'));

createFile(
  'client/context/GameContext.tsx',
  applyTemplate(readTemplate('client/GameContext.tsx.tpl')),
);

createFile(
  'client/context/GameConfigContext.tsx',
  readTemplate('client/GameConfigContext.tsx.tpl'),
);

createFile(
  'client/layouts/WaitingScreen.tsx',
  readTemplate('client/WaitingScreen.tsx.tpl'),
);

createFile(
  'client/layouts/GameScreen.tsx',
  readTemplate('client/GameScreen.tsx.tpl'),
);

createFile(
  `client/${pascalName}.tsx`,
  applyTemplate(readTemplate('client/Game.tsx.tpl')),
);

createFile(
  'server/state/createGameState.ts',
  readTemplate('server/createGameState.ts.tpl'),
);

createFile(
  `server/engine/${pascalName}Engine.ts`,
  applyTemplate(readTemplate('server/engine.ts.tpl')),
);

createFile(
  'server/utils/getCurrentUser.ts',
  applyTemplate(readTemplate('server/getCurrentUser.ts.tpl')),
);

createFile('shared/types/index.ts', readTemplate('shared/index.ts.tpl'));

createFile('shared/types/Actions.ts', readTemplate('shared/Actions.ts.tpl'));

createFile('shared/types/Error.ts', readTemplate('shared/Error.ts.tpl'));

createFile(
  'shared/types/ErrorCode.ts',
  readTemplate('shared/ErrorCode.ts.tpl'),
);

createFile(
  'shared/types/GameState.ts',
  applyTemplate(readTemplate('shared/GameState.ts.tpl')),
);

createFile(
  'shared/types/GameConfig.ts',
  applyTemplate(readTemplate('shared/GameConfig.ts.tpl')),
);

createFile('shared/types/Player.ts', readTemplate('shared/Player.ts.tpl'));

createFile(
  'tsconfig.json',
  JSON.stringify(
    {
      extends: '../../tsconfig.base.json',
      compilerOptions: {
        rootDir: '../..',
        outDir: `../../dist/games/${dirName}`,
        types: ['node'],
      },
      include: ['server/**/*', 'client/**/*', 'shared/**/*'],
    },
    null,
    2,
  ),
);

// GAMESリスト更新
const updateGamesList = () => {
  const gameFilePath = path.join(process.cwd(), 'core/shared/types/Game.ts');

  if (!fs.existsSync(gameFilePath)) {
    console.warn('⚠️ Game.ts not found, skip updating GAMES');
    return;
  }

  let content = fs.readFileSync(gameFilePath, 'utf-8');

  // 既に存在しているかチェック
  if (content.includes(`id: "${dirName}"`)) {
    console.log('⚠️ GAMES already contains this game');
    return;
  }

  const displayName = pascalName.replace(/([A-Z])/g, ' $1').trim();

  const newEntry = `\n  {\n    id: "${dirName}",\n    name: "${displayName}",\n    image: "/games/${dirName}/img/box.png"\n  },`;

  // GAMES配列の先頭に追加（export const GAMES = [ の直後）
  content = content.replace(
    /export const GAMES = \[\s*/,
    (match) => match + newEntry,
  );

  fs.writeFileSync(gameFilePath, content);
  console.log(`🧩 GAMES updated: ${dirName}`);
};

// GAMES更新を実行
updateGamesList();

console.log(`\n✅ ゲーム "${pascalName}" (${dirName}) を作成しました！`);
