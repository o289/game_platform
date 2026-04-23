// scripts/dev.ts

import { spawn } from 'child_process';
import fs from 'fs';

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
};

const processes: any[] = [];

function run(cmd: string, args: string[], label: string, options: any = {}) {
  let color = COLORS.reset;
  if (label === 'ngrok' || label === 'tunnel') color = COLORS.green;

  const p = spawn(cmd, args, {
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: true,
    detached: true,
    ...options,
  });

  p.stdout.on('data', (d) => {
    process.stdout.write(`${color}[${label}] ${d}${COLORS.reset}`);
  });

  p.stderr.on('data', (d) => {
    process.stderr.write(`${color}[${label} ERROR] ${d}${COLORS.reset}`);
  });

  processes.push(p);
  return p;
}

function cleanup() {
  console.log('\n終了処理中...');

  processes.forEach((p) => {
    try {
      process.kill(-p.pid, 'SIGINT');
    } catch {}
  });

  process.exit();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function updateEnvFile(path: string, key: string, value: string) {
  let content = '';

  if (fs.existsSync(path)) {
    content = fs.readFileSync(path, 'utf-8');
  }

  const regex = new RegExp(`${key}=.*`, 'g');
  content = content.replace(regex, '');

  content += `\n${key}=${value}\n`;

  fs.writeFileSync(path, content);
}

async function main() {
  // ------------------------
  // ① assets生成
  // ------------------------
  console.log('assets生成 実行中...');

  await new Promise((resolve, reject) => {
    const p = spawn('npm', ['run', 'generate:assets'], {
      stdio: 'inherit',
    });
    p.on('close', (code) => {
      if (code === 0) resolve(null);
      else reject(new Error('assets生成 失敗'));
    });
  });

  console.log('assets生成 完了');

  // ------------------------
  // ② client build
  // ------------------------
  console.log('client build 実行中...');

  await new Promise((resolve, reject) => {
    const p = spawn('npm', ['run', 'build:client'], {
      stdio: 'inherit',
    });
    p.on('close', (code) => {
      if (code === 0) resolve(null);
      else reject(new Error('client build 失敗'));
    });
  });

  console.log('client build 完了');

  // ------------------------
  // ② Cloudflare Tunnel
  // ------------------------
  console.log('cloudflared起動中...');

  const tunnelProcess = run(
    'cloudflared',
    ['tunnel', '--url', 'http://localhost:3000'],
    'tunnel',
  );

  let url: string | undefined;

  function handleTunnelOutput(data: Buffer) {
    const text = data.toString();

    const match = text.match(/https:\/\/[-a-z0-9]+\.trycloudflare\.com/);
    if (!url && match) {
      url = match[0];
      console.log('URL:', url);
    }
  }

  tunnelProcess.stdout.on('data', handleTunnelOutput);
  tunnelProcess.stderr.on('data', handleTunnelOutput);

  // URLが取得できるまで待機
  for (let i = 0; i < 15; i++) {
    if (url) break;
    await wait(1000);
  }

  if (!url) {
    console.error('Tunnel URL取得失敗');
    process.exit(1);
  }

  // ------------------------
  // ③ env更新
  // ------------------------

  updateEnvFile('./app/.env.local', 'VITE_SERVER_URL', url);

  updateEnvFile('./app/.env', 'PUBLIC_URL', url);

  console.log('env 更新完了');

  // ------------------------
  // ④ server起動
  // ------------------------
  run('npm', ['run', 'dev:server'], 'server');

  await wait(1000);

  // ------------------------
  // ⑤ client起動
  // ------------------------
  run('npm', ['run', 'dev:client'], 'client');
}

main();
