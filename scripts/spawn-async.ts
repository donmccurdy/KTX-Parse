import { spawn } from 'node:child_process';

export type SpawnResult = { code: number; stdout: string; stderr: string };

export function spawnAsync(command: string, args: string[]): Promise<SpawnResult> {
	return new Promise((resolve) => {
		const p = spawn(command, args);

		let stdout = '';
		let stderr = '';

		p.stdout.on('data', (x) => {
			stdout += x.toString();
		});

		p.stderr.on('data', (x) => {
			stderr += x.toString();
		});

		p.on('exit', (code) => {
			resolve({ code: code ?? 0, stdout, stderr });
		});
	});
}
