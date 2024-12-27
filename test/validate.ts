import { glob, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join, sep } from 'node:path';
import test from 'ava';
import { read, write } from 'ktx-parse';
import { type SpawnResult, spawnAsync } from '../scripts/spawn-async.ts';

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
