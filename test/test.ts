require('source-map-support').install();

import * as fs from 'fs';
import * as path from 'path';
import { TextDecoder, TextEncoder } from 'util';
import * as test from 'tape';
import { Container, read, write } from '../';

const SAMPLE_ETC1S = fs.readFileSync(path.join(__dirname, 'data', 'test_etc1s.ktx2'));
const SAMPLE_UASTC = fs.readFileSync(path.join(__dirname, 'data', 'test_uastc.ktx2'));

test('read::invalid', t => {
	t.throws(() => read(new Uint8Array(10)), /Missing KTX 2\.0 identifier/, 'rejects invalid header');
	t.end();
});

test('read::etc1s', t => {
	const container = read(SAMPLE_ETC1S);

	t.ok(container instanceof Container, 'creates container');
	t.equals(container.vkFormat, 0, 'vkFormat');
	t.equals(container.typeSize, 1, 'typeSize');
	t.equals(container.pixelWidth, 256, 'pixelWidth');
	t.equals(container.pixelHeight, 256, 'pixelHeight');
	t.equals(container.pixelDepth, 0, 'pixelDepth');
	t.equals(container.layerCount, 0, 'layerCount');
	t.equals(container.faceCount, 1, 'faceCount');
	t.equals(container.levels.length, 9, 'levels.length');
	t.equals(container.supercompressionScheme, 1, 'supercompressionScheme');
	t.deepEquals(container.keyValue, {
		'KTXorientation': 'rd',
		'KTXwriter': 'toktx v4.0.0-beta4~2 / libktx v4.0.0-beta4~2',
		'KTXwriterScParams': '--bcmp'
	}, 'keyValue');
	t.end();
});

test('read::uastc', t => {
	const container = read(SAMPLE_UASTC);

	t.ok(container instanceof Container, 'creates container');
	t.equals(container.vkFormat, 0, 'vkFormat');
	t.equals(container.typeSize, 1, 'typeSize');
	t.equals(container.pixelWidth, 256, 'pixelWidth');
	t.equals(container.pixelHeight, 256, 'pixelHeight');
	t.equals(container.pixelDepth, 0, 'pixelDepth');
	t.equals(container.layerCount, 0, 'layerCount');
	t.equals(container.faceCount, 1, 'faceCount');
	t.equals(container.levels.length, 9, 'levels.length');
	t.equals(container.supercompressionScheme, 0, 'supercompressionScheme');
	t.deepEquals(container.keyValue, {
		'KTXorientation': 'rd',
		'KTXwriter': 'toktx v4.0.0-beta4~2 / libktx v4.0.0-beta4~2',
		'KTXwriterScParams': '--uastc 2'
	}, 'keyValue');
	t.end();
});

test('write::etc1s', t => {
	const a = read(SAMPLE_ETC1S);
	const b = read(write(a));

	// Compare mip levels.
	t.equals(b.levels.length, a.levels.length, 'container.levels.length');
	for (let i = 0; i < a.levels.length; i++) {
		const aByteLength = a.levels[i].uncompressedByteLength;
		const bByteLength = b.levels[i].uncompressedByteLength;
		t.equals(bByteLength, aByteLength, `container.levels[${i}].uncompressedByteLength`);
		t.equals(bByteLength, aByteLength, `container.levels[${i}].data.byteLength`);
		t.ok(typedArrayEquals(b.levels[i].data, a.levels[i].data), `container.levels[${i}].data`);
	}

	// Compare supercompression global data.
	// t.deepEquals(b.globalData, a.globalData, 'container.globalData');

	// Remove KTXWriter (intentionally changed) and data too large for deepEquals().
	a.keyValue['KTXwriter'] = b.keyValue['KTXwriter'] = 'TEST';
	a.levels = b.levels = [];
	a.globalData = b.globalData = null;

	t.deepEquals(b, a, 'container.*');
	t.end();
});

test('write::uastc', t => {
	const a = read(SAMPLE_UASTC);
	const b = read(write(a));

	// Compare mip levels.
	t.equals(b.levels.length, a.levels.length, 'container.levels.length');
	for (let i = 0; i < a.levels.length; i++) {
		const aByteLength = a.levels[i].uncompressedByteLength;
		const bByteLength = b.levels[i].uncompressedByteLength;
		t.equals(bByteLength, aByteLength, `container.levels[${i}].uncompressedByteLength`);
		t.equals(bByteLength, aByteLength, `container.levels[${i}].data.byteLength`);
		t.ok(typedArrayEquals(b.levels[i].data, a.levels[i].data), `container.levels[${i}].data`);
	}

	// Compare supercompression global data.
	// t.deepEquals(b.globalData, a.globalData, 'container.globalData');

	// Remove KTXWriter (intentionally changed) and data too large for deepEquals().
	a.keyValue['KTXwriter'] = b.keyValue['KTXwriter'] = 'TEST';
	a.levels = b.levels = [];
	a.globalData = b.globalData = null;

	t.deepEquals(b, a, 'container.*');
	t.end();
});

test('web', t => {
	// Emulate browser API.
	global.TextEncoder = TextEncoder as any;
	global.TextDecoder = TextDecoder as any;
	const _from = Buffer.from;
	Buffer.from = (() => { throw new Error('Should not be called.'); }) as any;

	try {
		const result = write(read(SAMPLE_UASTC));
		t.ok(result instanceof Uint8Array, 'success');
		t.end();
	} finally {
		Buffer.from = _from;
	}
});

function typedArrayEquals (a: Uint8Array, b: Uint8Array): boolean {
	if (a.byteLength !== b.byteLength) return false;
	for (let i = 0; i < a.byteLength; i++) { if (a[i] !== b[i]) return false; }
	return true;
}