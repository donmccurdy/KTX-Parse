import { glob, readFile, writeFile, mkdtemp } from 'node:fs/promises';
import { basename, join, sep } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'ava';
import { read, write } from 'ktx-parse';
import $, { type SpawnResult } from '@expo/spawn-async';

const tmpDir = await mkdtemp(`${tmpdir()}${sep}`);

for await (const srcPath of glob(join('test', 'data', 'reference', '*.ktx2'))) {
	test(srcPath, async (t) => {
		const srcView = await readFile(srcPath);
		const srcContainer = read(srcView);
		const dstPath = join(tmpDir, basename(srcPath));
		const dstView = write(srcContainer, { keepWriter: true });
		await writeFile(dstPath, dstView);

		try {
			await $('ktx', ['validate', '--warnings-as-errors', dstPath]);
		} catch (e) {
			const { stdout } = e as SpawnResult;
			t.fail(stdout);
		}

		t.pass('ok');
	});
}
