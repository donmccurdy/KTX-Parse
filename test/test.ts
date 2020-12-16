require('source-map-support').install();

import * as fs from 'fs';
import * as path from 'path';
import * as test from 'tape';
import { Container, read } from '../';

test('read::invalid', t => {
	t.throws(() => read(new Uint8Array(10)), /Missing KTX 2\.0 identifier/, 'rejects invalid header');
	t.end();
});

test('read::etc1s', t => {
	const container = read(fs.readFileSync(path.join(__dirname, 'data', 'test_etc1s.ktx2')));

	t.ok(container instanceof Container, 'creates container');
	t.equals(container.vkFormat, 0, 'vkFormat');
	t.equals(container.typeSize, 1, 'typeSize');
	t.equals(container.pixelWidth, 256, 'pixelWidth');
	t.equals(container.pixelHeight, 256, 'pixelHeight');
	t.equals(container.pixelDepth, 0, 'pixelDepth');
	t.equals(container.layerCount, 0, 'layerCount');
	t.equals(container.faceCount, 1, 'faceCount');
	t.equals(container.levelCount, 9, 'levelCount');
	t.equals(container.supercompressionScheme, 1, 'supercompressionScheme');
	t.end();
});

test('read::uastc', t => {
	const container = read(fs.readFileSync(path.join(__dirname, 'data', 'test_uastc.ktx2')));

	t.ok(container instanceof Container, 'creates container');
	t.equals(container.vkFormat, 0, 'vkFormat');
	t.equals(container.typeSize, 1, 'typeSize');
	t.equals(container.pixelWidth, 256, 'pixelWidth');
	t.equals(container.pixelHeight, 256, 'pixelHeight');
	t.equals(container.pixelDepth, 0, 'pixelDepth');
	t.equals(container.layerCount, 0, 'layerCount');
	t.equals(container.faceCount, 1, 'faceCount');
	t.equals(container.levelCount, 9, 'levelCount');
	t.equals(container.supercompressionScheme, 0, 'supercompressionScheme');
	t.end();
});
