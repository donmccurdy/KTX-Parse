import { URL } from 'url';
import { readFileSync } from 'fs';
import { readFile } from 'fs/promises';
import { basename, join } from 'path';
import { TextDecoder, TextEncoder } from 'util';
import test from 'ava';
import { promise as glob } from 'glob-promise';
import { KTX2Container, read, write } from 'ktx-parse';

const SAMPLE_ETC1S = readFileSync(new URL('./data/test_etc1s.ktx2', import.meta.url));
const SAMPLE_UASTC = readFileSync(new URL('./data/test_uastc.ktx2', import.meta.url));

test('read::invalid', (t) => {
	t.throws(() => read(new Uint8Array(99)), { message: /Missing KTX 2\.0 identifier/ }, 'rejects invalid header');
});

test('read::etc1s', (t) => {
	const container = read(SAMPLE_ETC1S);

	t.true(container instanceof KTX2Container, 'creates container');
	t.is(container.vkFormat, 0, 'vkFormat');
	t.is(container.typeSize, 1, 'typeSize');
	t.is(container.pixelWidth, 256, 'pixelWidth');
	t.is(container.pixelHeight, 256, 'pixelHeight');
	t.is(container.pixelDepth, 0, 'pixelDepth');
	t.is(container.layerCount, 0, 'layerCount');
	t.is(container.faceCount, 1, 'faceCount');
	t.is(container.levels.length, 9, 'levels.length');
	t.is(container.supercompressionScheme, 1, 'supercompressionScheme');
	t.deepEqual(
		container.keyValue,
		{
			KTXorientation: 'rd',
			KTXwriter: 'toktx v4.0.0-beta4~2 / libktx v4.0.0-beta4~2',
			KTXwriterScParams: '--bcmp',
		},
		'keyValue'
	);
});

test('read::uastc', (t) => {
	const container = read(SAMPLE_UASTC);

	t.true(container instanceof KTX2Container, 'creates container');
	t.is(container.vkFormat, 0, 'vkFormat');
	t.is(container.typeSize, 1, 'typeSize');
	t.is(container.pixelWidth, 256, 'pixelWidth');
	t.is(container.pixelHeight, 256, 'pixelHeight');
	t.is(container.pixelDepth, 0, 'pixelDepth');
	t.is(container.layerCount, 0, 'layerCount');
	t.is(container.faceCount, 1, 'faceCount');
	t.is(container.levels.length, 9, 'levels.length');
	t.is(container.supercompressionScheme, 0, 'supercompressionScheme');
	t.deepEqual(
		container.keyValue,
		{
			KTXorientation: 'rd',
			KTXwriter: 'toktx v4.0.0-beta4~2 / libktx v4.0.0-beta4~2',
			KTXwriterScParams: '--uastc 2',
		},
		'keyValue'
	);
});

test('read::view-offset', (t) => {
	// Construct a sample such that underlying ArrayBuffer has additional data.
	const sampleBuffer = new ArrayBuffer(123 + SAMPLE_ETC1S.byteLength);
	const sampleOffset = new Uint8Array(sampleBuffer, 123);
	sampleOffset.set(SAMPLE_ETC1S, 0);

	// Roundtrip the original and the offset sample, checking that results match.
	const a = write(read(SAMPLE_ETC1S));
	const b = write(read(sampleOffset));

	t.true(typedArrayEquals(b, a), 'identical result');
});

test('read::padding', async (t) => {
	// This example has a few extra cases to handle in the kvd padding, including
	// a NUL terminator on a value followed by 3 bytes of padding, for a total of
	// 4 contiguous NUL bytes.
	const sample = await readFile(new URL('./data/test_padding.ktx2', import.meta.url));
	const container = read(sample);
	t.is(container.keyValue['KTXorientation'], 'rd', 'KTXorientation');
	t.is(
		container.keyValue['KTXwriter'],
		'toktx v4.0.beta1.380.g0d851050 / libktx v4.0.beta1.350.g2c40ba4d.dirty',
		'KTXwriter'
	);
	t.deepEqual(
		container.keyValue['KHRtoktxScParams'],
		new Uint8Array([
			45, 45, 98, 99, 109, 112, 32, 45, 45, 99, 108, 101, 118, 101, 108, 32, 49, 32, 45, 45, 113, 108, 101, 118,
			101, 108, 32, 49, 57, 50,
		]),
		'KHRtoktxScParams'
	);
});

test('write::etc1s', (t) => {
	const a = read(SAMPLE_ETC1S);
	const b = read(write(a));

	// Compare mip levels.
	t.is(b.levels.length, a.levels.length, 'container.levels.length');
	for (let i = 0; i < 3; i++) {
		const aByteLength = a.levels[i].uncompressedByteLength;
		const bByteLength = b.levels[i].uncompressedByteLength;
		t.is(bByteLength, aByteLength, `container.levels[${i}].uncompressedByteLength`);
		t.is(bByteLength, aByteLength, `container.levels[${i}].levelData.byteLength`);
		t.true(typedArrayEquals(b.levels[i].levelData, a.levels[i].levelData), `container.levels[${i}].levelData`);
	}

	// Compare supercompression global data.
	if (a.globalData && b.globalData) {
		t.is(b.globalData.endpointCount, a.globalData.endpointCount, 'container.globalData.endpointCount');
		t.is(b.globalData.selectorCount, a.globalData.selectorCount, 'container.globalData.selectorCount');

		t.is(
			b.globalData.endpointsData.byteLength,
			a.globalData.endpointsData.byteLength,
			'container.globalData.endpointsData.byteLength'
		);
		t.is(
			b.globalData.selectorsData.byteLength,
			a.globalData.selectorsData.byteLength,
			'container.globalData.selectorsData.byteLength'
		);
		t.is(
			b.globalData.tablesData.byteLength,
			a.globalData.tablesData.byteLength,
			'container.globalData.tablesData.byteLength'
		);
		t.is(
			b.globalData.extendedData.byteLength,
			a.globalData.extendedData.byteLength,
			'container.globalData.extendedData.byteLength'
		);

		t.true(
			typedArrayEquals(b.globalData.endpointsData, a.globalData.endpointsData),
			'container.globalData.endpointsData'
		);
		t.true(
			typedArrayEquals(b.globalData.selectorsData, a.globalData.selectorsData),
			'container.globalData.selectorsData'
		);
		t.true(typedArrayEquals(b.globalData.tablesData, a.globalData.tablesData), 'container.globalData.tablesData');
		t.true(
			typedArrayEquals(b.globalData.extendedData, a.globalData.extendedData),
			'container.globalData.extendedData'
		);
	} else {
		t.fail('container.globalData missing');
	}

	// Remove KTXWriter (intentionally changed) and data too large for deepEquals().
	a.keyValue['KTXwriter'] = b.keyValue['KTXwriter'] = 'TEST';
	a.levels = b.levels = [];
	a.globalData = b.globalData = null;

	t.deepEqual(b, a, 'container.*');
});

test('write::uastc', (t) => {
	const a = read(SAMPLE_UASTC);
	const b = read(write(a));

	// Compare mip levels.
	t.is(b.levels.length, a.levels.length, 'container.levels.length');
	for (let i = 0; i < 3; i++) {
		const aByteLength = a.levels[i].uncompressedByteLength;
		const bByteLength = b.levels[i].uncompressedByteLength;
		t.is(bByteLength, aByteLength, `container.levels[${i}].uncompressedByteLength`);
		t.is(bByteLength, aByteLength, `container.levels[${i}].levelData.byteLength`);
		t.true(typedArrayEquals(b.levels[i].levelData, a.levels[i].levelData), `container.levels[${i}].levelData`);
	}

	// UASTC does not have supercompression.
	t.is(a.globalData, null, 'container.globalData = null (1/2)');
	t.is(b.globalData, null, 'container.globalData = null (2/2)');

	// Remove KTXWriter (intentionally changed) and data too large for deepEquals().
	a.keyValue['KTXwriter'] = b.keyValue['KTXwriter'] = 'TEST';
	a.levels = b.levels = [];
	a.globalData = b.globalData = null;

	t.deepEqual(b, a, 'container.*');
});

test('platform::web', (t) => {
	// Emulate browser API.
	global.TextEncoder = TextEncoder as any;
	global.TextDecoder = TextDecoder as any;
	const _from = Buffer.from;
	Buffer.from = (() => {
		throw new Error('Should not be called.');
	}) as any;

	try {
		const result = write(read(SAMPLE_UASTC));
		t.true(result instanceof Uint8Array, 'success');
	} finally {
		Buffer.from = _from;
	}
});

test('data format descriptors', (t) => {
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
	a.dataFormatDescriptor[0].descriptorBlockSize += 16;
	a.dataFormatDescriptor[0].samples = [sample1, sample2];
	const b = read(write(a));

	const dfdA = a.dataFormatDescriptor[0];
	const dfdB = b.dataFormatDescriptor[0];

	t.is(dfdA.samples.length, 2, 'a.dfd.samples.length === 2');
	t.is(dfdB.samples.length, 2, 'b.dfd.samples.length === 2');
	t.deepEqual(dfdA.samples[0], dfdB.samples[0], 'a.dfd.samples[0] === b.dfd.samples[0]');
	t.deepEqual(dfdA.samples[0], dfdB.samples[0], 'a.dfd.samples[0] === b.dfd.samples[0]');
});

test('lossless round trip', async (t) => {
	const paths = await glob(join('test', 'data', 'reference', '*.ktx2'));

	await Promise.all(
		paths.map(async (path) => {
			const srcView = await readFile(path);
			const srcContainer = read(srcView);
			const dstView = write(srcContainer, { keepWriter: true });
			const dstContainer = read(dstView);
			// TODO(feat): Try to replicate KTX-Software output byte for byte.
			// t.ok(typedArrayEquals(srcView, dstView), basename(path));
			t.deepEqual(srcContainer, dstContainer, basename(path));
		})
	);
});

test('read kv', (t) => {
	const a = read(SAMPLE_ETC1S);
	a.keyValue['TestUint8Array'] = new Uint8Array([0, 0, 0, 16]);
	const b = write(a);
	const c = read(b);
	t.true(
		typedArrayEquals(c.keyValue['TestUint8Array'] as Uint8Array, new Uint8Array([0, 0, 0, 16])),
		'container.keyValue[TestUint8Array]'
	);
});

function typedArrayEquals(a: Uint8Array, b: Uint8Array): boolean {
	if (a.byteLength !== b.byteLength) return false;
	for (let i = 0; i < a.byteLength; i++) {
		if (a[i] !== b[i]) return false;
	}
	return true;
}
