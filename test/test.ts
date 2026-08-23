import { deepStrictEqual, fail, ok, strictEqual, throws } from 'node:assert';
import { glob, readFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { test } from 'node:test';
import { URL } from 'node:url';
import { createDefaultContainer, read, VK_FORMAT_R8G8B8A8_SRGB, write } from 'ktx-parse';

const SAMPLE_RGBA8 = await readFile(new URL('./data/test_rgba8.ktx2', import.meta.url));
const SAMPLE_ETC1S = await readFile(new URL('./data/test_etc1s.ktx2', import.meta.url));
const SAMPLE_UASTC = await readFile(new URL('./data/test_uastc.ktx2', import.meta.url));

test('read::invalid', () => {
	throws(() => read(new Uint8Array(99)), { message: /Missing KTX 2\.0 identifier/ }, 'rejects invalid header');
});

test('read::etc1s', () => {
	const container = read(SAMPLE_ETC1S);

	ok(container, 'creates container');
	strictEqual(container.vkFormat, 0, 'vkFormat');
	strictEqual(container.typeSize, 1, 'typeSize');
	strictEqual(container.pixelWidth, 256, 'pixelWidth');
	strictEqual(container.pixelHeight, 256, 'pixelHeight');
	strictEqual(container.pixelDepth, 0, 'pixelDepth');
	strictEqual(container.layerCount, 0, 'layerCount');
	strictEqual(container.faceCount, 1, 'faceCount');
	strictEqual(container.levelCount, 9, 'levelCount');
	strictEqual(container.levels.length, 9, 'levels.length');
	strictEqual(container.supercompressionScheme, 1, 'supercompressionScheme');
	deepStrictEqual(
		container.keyValue,
		{
			KTXorientation: 'rd',
			KTXwriter: 'toktx v4.0.0-beta4~2 / libktx v4.0.0-beta4~2',
			KTXwriterScParams: '--bcmp',
		},
		'keyValue',
	);
});

test('read::uastc', () => {
	const container = read(SAMPLE_UASTC);

	ok(container, 'creates container');
	strictEqual(container.vkFormat, 0, 'vkFormat');
	strictEqual(container.typeSize, 1, 'typeSize');
	strictEqual(container.pixelWidth, 256, 'pixelWidth');
	strictEqual(container.pixelHeight, 256, 'pixelHeight');
	strictEqual(container.pixelDepth, 0, 'pixelDepth');
	strictEqual(container.layerCount, 0, 'layerCount');
	strictEqual(container.faceCount, 1, 'faceCount');
	strictEqual(container.levelCount, 9, 'levelCount');
	strictEqual(container.levels.length, 9, 'levels.length');
	strictEqual(container.supercompressionScheme, 0, 'supercompressionScheme');
	deepStrictEqual(
		container.keyValue,
		{
			KTXorientation: 'rd',
			KTXwriter: 'toktx v4.0.0-beta4~2 / libktx v4.0.0-beta4~2',
			KTXwriterScParams: '--uastc 2',
		},
		'keyValue',
	);
});

test('read::view-offset', () => {
	// Construct a sample such that underlying ArrayBuffer has additional data.
	const sampleBuffer = new ArrayBuffer(123 + SAMPLE_ETC1S.byteLength);
	const sampleOffset = new Uint8Array(sampleBuffer, 123);
	sampleOffset.set(SAMPLE_ETC1S, 0);

	// Roundtrip the original and the offset sample, checking that results match.
	const a = write(read(SAMPLE_ETC1S));
	const b = write(read(sampleOffset));

	ok(typedArrayEquals(b, a), 'identical result');
});

test('read::padding', async () => {
	// This example has a few extra cases to handle in the kvd padding, including
	// a NUL terminator on a value followed by 3 bytes of padding, for a total of
	// 4 contiguous NUL bytes.
	const sample = await readFile(new URL('./data/test_padding.ktx2', import.meta.url));
	const container = read(sample);
	strictEqual(container.keyValue.KTXorientation, 'rd', 'KTXorientation');
	strictEqual(
		container.keyValue.KTXwriter,
		'toktx v4.0.beta1.380.g0d851050 / libktx v4.0.beta1.350.g2c40ba4d.dirty',
		'KTXwriter',
	);
	deepStrictEqual(
		container.keyValue.KHRtoktxScParams,
		new Uint8Array([
			45, 45, 98, 99, 109, 112, 32, 45, 45, 99, 108, 101, 118, 101, 108, 32, 49, 32, 45, 45, 113, 108, 101, 118, 101,
			108, 32, 49, 57, 50,
		]),
		'KHRtoktxScParams',
	);
});

test('write::etc1s', () => {
	const a = read(SAMPLE_ETC1S);
	const b = read(write(a));

	// Compare mip levels.
	strictEqual(b.levels.length, a.levels.length, 'container.levels.length');
	for (let i = 0; i < 3; i++) {
		const aByteLength = a.levels[i].uncompressedByteLength;
		const bByteLength = b.levels[i].uncompressedByteLength;
		strictEqual(bByteLength, aByteLength, `container.levels[${i}].uncompressedByteLength`);
		strictEqual(bByteLength, aByteLength, `container.levels[${i}].levelData.byteLength`);
		ok(typedArrayEquals(b.levels[i].levelData, a.levels[i].levelData), `container.levels[${i}].levelData`);
	}

	// Compare supercompression global data.
	if (a.globalData && b.globalData) {
		strictEqual(b.globalData.endpointCount, a.globalData.endpointCount, 'container.globalData.endpointCount');
		strictEqual(b.globalData.selectorCount, a.globalData.selectorCount, 'container.globalData.selectorCount');

		strictEqual(
			b.globalData.endpointsData.byteLength,
			a.globalData.endpointsData.byteLength,
			'container.globalData.endpointsData.byteLength',
		);
		strictEqual(
			b.globalData.selectorsData.byteLength,
			a.globalData.selectorsData.byteLength,
			'container.globalData.selectorsData.byteLength',
		);
		strictEqual(
			b.globalData.tablesData.byteLength,
			a.globalData.tablesData.byteLength,
			'container.globalData.tablesData.byteLength',
		);
		strictEqual(
			b.globalData.extendedData.byteLength,
			a.globalData.extendedData.byteLength,
			'container.globalData.extendedData.byteLength',
		);

		ok(typedArrayEquals(b.globalData.endpointsData, a.globalData.endpointsData), 'container.globalData.endpointsData');
		ok(typedArrayEquals(b.globalData.selectorsData, a.globalData.selectorsData), 'container.globalData.selectorsData');
		ok(typedArrayEquals(b.globalData.tablesData, a.globalData.tablesData), 'container.globalData.tablesData');
		ok(typedArrayEquals(b.globalData.extendedData, a.globalData.extendedData), 'container.globalData.extendedData');
	} else {
		fail('container.globalData missing');
	}

	// Remove KTXWriter (intentionally changed) and data too large for deepEquals().
	a.keyValue.KTXwriter = b.keyValue.KTXwriter = 'TEST';
	a.levels = b.levels = [];
	a.globalData = b.globalData = null;

	deepStrictEqual(b, a, 'container.*');
});

test('write::uastc', () => {
	const a = read(SAMPLE_UASTC);
	const b = read(write(a));

	// Compare mip levels.
	strictEqual(b.levels.length, a.levels.length, 'container.levels.length');
	for (let i = 0; i < 3; i++) {
		const aByteLength = a.levels[i].uncompressedByteLength;
		const bByteLength = b.levels[i].uncompressedByteLength;
		strictEqual(bByteLength, aByteLength, `container.levels[${i}].uncompressedByteLength`);
		strictEqual(bByteLength, aByteLength, `container.levels[${i}].levelData.byteLength`);
		ok(typedArrayEquals(b.levels[i].levelData, a.levels[i].levelData), `container.levels[${i}].levelData`);
	}

	// UASTC does not have supercompression.
	strictEqual(a.globalData, null, 'container.globalData = null (1/2)');
	strictEqual(b.globalData, null, 'container.globalData = null (2/2)');

	// Remove KTXWriter (intentionally changed) and data too large for deepEquals().
	a.keyValue.KTXwriter = b.keyValue.KTXwriter = 'TEST';
	a.levels = b.levels = [];
	a.globalData = b.globalData = null;

	deepStrictEqual(b, a, 'container.*');
});

test('data format descriptors', () => {
	const sample1 = {
		bitOffset: 0,
		bitLength: 10,
		channelType: 0,
		samplePosition: [1, 2, 3, 4],
		sampleLower: 0,
		sampleUpper: 1,
	};
	const sample2 = { ...sample1, bitLength: 15 };

	const a = read(SAMPLE_UASTC);
	a.dataFormatDescriptor[0].samples = [sample1, sample2];
	const b = read(write(a));

	const dfdA = a.dataFormatDescriptor[0];
	const dfdB = b.dataFormatDescriptor[0];

	strictEqual(dfdA.samples.length, 2, 'a.dfd.samples.length === 2');
	strictEqual(dfdB.samples.length, 2, 'b.dfd.samples.length === 2');
	deepStrictEqual(dfdA.samples[0], dfdB.samples[0], 'a.dfd.samples[0] === b.dfd.samples[0]');
	deepStrictEqual(dfdA.samples[0], dfdB.samples[0], 'a.dfd.samples[0] === b.dfd.samples[0]');
});

test('lossless round trip', async () => {
	for await (const path of glob(join('test', 'data', 'reference', '*.ktx2'))) {
		const srcView = await readFile(path);
		const srcContainer = read(srcView);
		const dstView = write(srcContainer, { keepWriter: true });
		const dstContainer = read(dstView);
		// TODO(feat): Try to replicate KTX-Software output byte for byte.
		// t.ok(typedArrayEquals(srcView, dstView), basename(path));
		deepStrictEqual(srcContainer, dstContainer, basename(path));
	}
});

test('read kv', () => {
	const a = read(SAMPLE_ETC1S);
	a.keyValue.TestUint8Array = new Uint8Array([0, 0, 0, 16]);
	const b = write(a);
	const c = read(b);
	ok(
		typedArrayEquals(c.keyValue.TestUint8Array as Uint8Array, new Uint8Array([0, 0, 0, 16])),
		'container.keyValue[TestUint8Array]',
	);
});

test('sort kv', () => {
	const a = read(SAMPLE_ETC1S);
	a.keyValue = {
		b: '123',
		a: '456',
		c: '789',
		ab: '012',
	};
	const b = read(write(a));

	deepStrictEqual(Object.keys(b.keyValue), ['KTXwriter', 'a', 'ab', 'b', 'c'], 'sorted keys');
});

test('createDefaultContainer', () => {
	const container = createDefaultContainer();

	strictEqual(container.vkFormat, 0, 'vkFormat');
	strictEqual(container.typeSize, 1, 'typeSize');
	strictEqual(container.pixelWidth, 0, 'pixelWidth');
	strictEqual(container.pixelHeight, 0, 'pixelHeight');
	strictEqual(container.pixelDepth, 0, 'pixelDepth');
	strictEqual(container.layerCount, 0, 'layerCount');
	strictEqual(container.faceCount, 1, 'faceCount');
	strictEqual(container.levelCount, 0, 'levels.length');
	strictEqual(container.levels.length, 0, 'levels.length');
	strictEqual(container.supercompressionScheme, 0, 'supercompressionScheme');
});

test('levelCount', () => {
	// 0 = runtime mipmaps, 1 = base level only.

	const a = read(SAMPLE_RGBA8);
	strictEqual(a.vkFormat, VK_FORMAT_R8G8B8A8_SRGB, 'a.vkFormat');
	strictEqual(a.levelCount, 0, 'a.levelCount');

	const b = read(write(a));
	strictEqual(b.vkFormat, VK_FORMAT_R8G8B8A8_SRGB, 'b.vkFormat');
	strictEqual(b.levelCount, 0, 'b.levelCount');

	a.levelCount = 1;

	const c = read(write(a));
	strictEqual(c.vkFormat, VK_FORMAT_R8G8B8A8_SRGB, 'c.vkFormat');
	strictEqual(c.levelCount, 1, 'c.levelCount');
});

function typedArrayEquals(a: Uint8Array, b: Uint8Array): boolean {
	if (a.byteLength !== b.byteLength) return false;
	for (let i = 0; i < a.byteLength; i++) {
		if (a[i] !== b[i]) return false;
	}
	return true;
}
