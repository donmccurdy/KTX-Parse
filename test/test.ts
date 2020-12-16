require('source-map-support').install();

import * as fs from 'fs';
import * as path from 'path';
import * as test from 'tape';
import { Container, read, write } from '../';

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
	t.deepEquals(container.keyValue, [
		{key: 'KTXorientation', value: 'rd'},
		{key: 'KTXwriter', value: 'toktx v4.0.0-beta4~2 / libktx v4.0.0-beta4~2'},
		{key: 'KTXwriterScParams', value: '--bcmp'},
	], 'keyValue');
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
	t.deepEquals(container.keyValue, [
		{key: 'KTXorientation', value: 'rd'},
		{key: 'KTXwriter', value: 'toktx v4.0.0-beta4~2 / libktx v4.0.0-beta4~2'},
		{key: 'KTXwriterScParams', value: '--uastc 2'},
	], 'keyValue');
	t.end();
});

test.skip('write::etc1s', t => {
	const inContainer = read(fs.readFileSync(path.join(__dirname, 'data', 'test_etc1s.ktx2')));
	const outContainer = read(write(inContainer));
	t.deepEquals(outContainer, inContainer, 'lossless i/o');
	t.end();
});

test.skip('write::uastc', t => {
	const inContainer = read(fs.readFileSync(path.join(__dirname, 'data', 'test_uastc.ktx2')));
	const outContainer = read(write(inContainer));
	t.deepEquals(outContainer, inContainer, 'lossless i/o');
	t.end();
});
