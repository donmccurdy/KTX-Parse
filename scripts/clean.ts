import fs from 'node:fs/promises';
import path from 'node:path';

const dist = 'dist';
for (const file of await fs.readdir(dist)) {
	await fs.unlink(path.join(dist, file));
}
