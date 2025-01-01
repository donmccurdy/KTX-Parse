import { glob, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { basename, join, sep } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'ava';
import { read, write } from 'ktx-parse';

const tmpDir = await mkdtemp(`${tmpdir()}${sep}`);

for await (const srcPath of glob(join('test', 'data', 'reference', '*.ktx2'))) {
	test(srcPath, async (t) => {
		const srcView = await readFile(srcPath);
		const srcContainer = read(srcView);
		const dstPath = join(tmpDir, basename(srcPath));
		const dstView = write(srcContainer, { keepWriter: true });
		await writeFile(dstPath, dstView);

		try {
			await spawnAsync('ktx', ['validate', '--warnings-as-errors', dstPath]);
		} catch (e) {
			const { stdout } = e as SpawnResult;
			t.fail(stdout);
		}

		t.pass('ok');
	});
}

///////////////////////////////////////////////////////////////////////////////
// UTILITIES

type SpawnResult = { code: number; stdout: string; stderr: string };

function spawnAsync(command: string, args: string[]): Promise<SpawnResult> {
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
