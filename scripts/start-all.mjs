import { spawn } from 'child_process';

const processes = [];

function startProcess(name, command, args, options = {}) {
  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: true,
    ...options,
  });

  child.on('exit', (code, signal) => {
    if (code === 0) {
      return;
    }

    console.error(`\n[${name}] exited with code ${code ?? 'null'}${signal ? ` signal ${signal}` : ''}`);
    for (const process of processes) {
      if (process !== child && !process.killed) {
        process.kill();
      }
    }
    process.exit(code ?? 1);
  });

  processes.push(child);
  return child;
}

startProcess('backend', 'npm', ['--prefix', 'backend', 'run', 'dev']);
startProcess('frontend', 'npm', ['--prefix', 'frontend', 'run', 'dev']);

const tunnelToken = process.env.CLOUDFLARED_TUNNEL_TOKEN;
const tunnelConfig = process.env.CLOUDFLARED_TUNNEL_CONFIG;

if (tunnelConfig) {
  startProcess('tunnel', 'cloudflared', ['tunnel', '--config', tunnelConfig, 'run']);
} else if (tunnelToken) {
  startProcess('tunnel', 'cloudflared', ['tunnel', 'run', '--token', tunnelToken]);
} else {
  startProcess('tunnel', 'cloudflared', ['tunnel', '--url', 'http://localhost:5173', '--no-autoupdate']);
}

process.on('SIGINT', () => {
  for (const child of processes) {
    if (!child.killed) {
      child.kill();
    }
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  for (const child of processes) {
    if (!child.killed) {
      child.kill();
    }
  }
  process.exit(0);
});