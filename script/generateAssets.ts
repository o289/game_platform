import fs from 'fs';
import path from 'path';

const copyDir = (src: string, dest: string) => {
  if (!fs.existsSync(src)) return;

  fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
};

const walk = (dir: string, baseDir: string): string[] => {
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir);
  let results: string[] = [];

  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      results = results.concat(walk(fullPath, baseDir));
    } else {
      const relative = fullPath.replace(baseDir, '').replace(/\\/g, '/');
      results.push(relative);
    }
  });

  return results;
};

const generateAssets = (
  baseDir: string,
  outputPath: string,
  urlPrefix = '',
) => {
  if (!fs.existsSync(baseDir)) return;

  const allFiles = walk(baseDir, baseDir);

  const images = allFiles
    .filter((f) => /\.(png|jpg|jpeg|webp)$/.test(f))
    .map((f) => `${urlPrefix}${f}`);

  const audios = allFiles
    .filter((f) => /\.(mp3|wav|ogg)$/.test(f))
    .map((f) => `${urlPrefix}${f}`);

  const output = {
    images,
    audios,
  };

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`assets.json generated: ${outputPath}`);
};

// ===== app =====
const appPublicDir = path.resolve('app/public');

// ===== games =====
const gamesRoot = path.resolve('games');

if (fs.existsSync(gamesRoot)) {
  const gameNames = fs.readdirSync(gamesRoot);

  gameNames.forEach((gameName) => {
    const gameAssetsDir = path.join(gamesRoot, gameName, 'assets');
    const destDir = path.join(appPublicDir, 'games', gameName);

    if (!fs.existsSync(gameAssetsDir)) return;

    // ① copy assets to app/public
    copyDir(gameAssetsDir, destDir);

    // ② generate assets.json with URL prefix
    const outputPath = path.join(destDir, 'assets.json');

    generateAssets(gameAssetsDir, outputPath, `/games/${gameName}`);
  });
}
