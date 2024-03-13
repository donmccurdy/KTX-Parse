import { readFile, writeFile } from 'fs/promises';
import { basename, join } from 'path';
import test from 'ava';
import { glob } from 'glob';
import { read, write } from 'ktx-parse';
import tmp from 'tmp';
import $, { SpawnResult } from '@expo/spawn-async';

tmp.setGracefulCleanup();

const dstDir = tmp.dirSync();

for (const srcPath of await glob(join('test', 'data', 'reference', '*.ktx2'))) {
	test(srcPath, async (t) => {
		const srcView = await readFile(srcPath);
		const srcContainer = read(srcView);
		const dstPath = join(dstDir.name, basename(srcPath));
		const dstView = write(srcContainer, { keepWriter: true });
		await writeFile(dstPath, dstView);

		try {
			const { stdout } = await $('ktx', ['validate', '--warnings-as-errors', dstPath]);
			t.log(stdout);
		} catch (e) {
			const { stdout } = e as SpawnResult;
			t.fail(stdout);
		}

		t.pass('ok');
	});
}
