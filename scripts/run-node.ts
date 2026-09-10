import { spawn } from 'node:child_process';

// Keep the CLI alive until the child has closed its output streams. Awaiting here also
// sends spawn failures through the caller's normal error handling.
export async function runNode(args: string[], env = process.env): Promise<number> {
  const child = spawn(process.execPath, args, { stdio: 'inherit', env });
  const interrupt = () => child.kill('SIGINT');
  const terminate = () => child.kill('SIGTERM');
  process.on('SIGINT', interrupt);
  process.on('SIGTERM', terminate);
  try {
    return await new Promise<number>((resolve, reject) => {
      child.once('error', reject);
      child.once('close', (code) => resolve(code ?? 1));
    });
  } finally {
    process.off('SIGINT', interrupt);
    process.off('SIGTERM', terminate);
  }
}
