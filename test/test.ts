require('source-map-support').install();

import * as fs from 'fs';
import * as path from 'path';
import { TextDecoder, TextEncoder } from 'util';
import * as test from 'tape';
import { KTX2Container, read, write } from '../';

const SAMPLE_ETC1S = fs.readFileSync(path.join(__dirname, 'data', 'test_etc1s.ktx2'));
const SAMPLE_UASTC = fs.readFileSync(path.join(__dirname, 'data', 'test_uastc.ktx2'));

test('read::invalid', t => {
	t.throws(() => read(new Uint8Array(99)), /Missing KTX 2\.0 identifier/, 'rejects invalid header');
	t.end();
});

test('read::etc1s', t => {
	const container = read(SAMPLE_ETC1S);

	t.ok(container instanceof KTX2Container, 'creates container');
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

	t.ok(container instanceof KTX2Container, 'creates container');
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

test('read::view-offset', t => {
	// Construct a sample such that underlying ArrayBuffer has additional data.
	const sampleBuffer = new ArrayBuffer(123 + SAMPLE_ETC1S.byteLength);
	const sampleOffset = new Uint8Array(sampleBuffer, 123);
	sampleOffset.set(SAMPLE_ETC1S, 0);

	// Roundtrip the original and the offset sample, checking that results match.
	const a = write(read(SAMPLE_ETC1S));
	const b = write(read(sampleOffset));

	t.ok(typedArrayEquals(b, a), 'identical result');
	t.end();
});

test('read::padding', t => {
	// This example has a few extra cases to handle in the kvd padding, including
	// a NUL terminator on a value followed by 3 bytes of padding, for a total of
	// 4 contiguous NUL bytes.
	const sample = fs.readFileSync(path.join(__dirname, 'data', 'test_padding.ktx2'));
	const container = read(sample);
	t.equals(container.keyValue['KTXorientation'], 'rd', 'KTXorientation');
	t.equals(container.keyValue['KTXwriter'], 'toktx v4.0.beta1.380.g0d851050 / libktx v4.0.beta1.350.g2c40ba4d.dirty', 'KTXwriter');
	t.deepEquals(container.keyValue['KHRtoktxScParams'], new Uint8Array([
		45, 45, 98, 99, 109, 112, 32, 45,
		45, 99, 108, 101, 118, 101, 108, 32,
		49, 32, 45, 45, 113, 108, 101, 118,
		101, 108, 32, 49, 57, 50
	]), 'KHRtoktxScParams');
	t.end();
});

test('write::etc1s', t => {
	const a = read(SAMPLE_ETC1S);
	const b = read(write(a));

	// Compare mip levels.
	t.equals(b.levels.length, a.levels.length, 'container.levels.length');
	for (let i = 0; i < 3; i++) {
		const aByteLength = a.levels[i].uncompressedByteLength;
		const bByteLength = b.levels[i].uncompressedByteLength;
		t.equals(bByteLength, aByteLength, `container.levels[${i}].uncompressedByteLength`);
		t.equals(bByteLength, aByteLength, `container.levels[${i}].levelData.byteLength`);
		t.ok(typedArrayEquals(b.levels[i].levelData, a.levels[i].levelData), `container.levels[${i}].levelData`);
	}

	// Compare supercompression global data.
	if (a.globalData && b.globalData) {
		t.equals(b.globalData.endpointCount, a.globalData.endpointCount, 'container.globalData.endpointCount');
		t.equals(b.globalData.selectorCount, a.globalData.selectorCount, 'container.globalData.selectorCount');

		t.equals(b.globalData.endpointsData.byteLength, a.globalData.endpointsData.byteLength, 'container.globalData.endpointsData.byteLength');
		t.equals(b.globalData.selectorsData.byteLength, a.globalData.selectorsData.byteLength, 'container.globalData.selectorsData.byteLength');
		t.equals(b.globalData.tablesData.byteLength, a.globalData.tablesData.byteLength, 'container.globalData.tablesData.byteLength');
		t.equals(b.globalData.extendedData.byteLength, a.globalData.extendedData.byteLength, 'container.globalData.extendedData.byteLength');

		t.ok(typedArrayEquals(b.globalData.endpointsData, a.globalData.endpointsData), 'container.globalData.endpointsData');
		t.ok(typedArrayEquals(b.globalData.selectorsData, a.globalData.selectorsData), 'container.globalData.selectorsData');
		t.ok(typedArrayEquals(b.globalData.tablesData, a.globalData.tablesData), 'container.globalData.tablesData');
		t.ok(typedArrayEquals(b.globalData.extendedData, a.globalData.extendedData), 'container.globalData.extendedData');
	} else {
		t.fail('container.globalData missing');
	}

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
	for (let i = 0; i < 3; i++) {
		const aByteLength = a.levels[i].uncompressedByteLength;
		const bByteLength = b.levels[i].uncompressedByteLength;
		t.equals(bByteLength, aByteLength, `container.levels[${i}].uncompressedByteLength`);
		t.equals(bByteLength, aByteLength, `container.levels[${i}].levelData.byteLength`);
		t.ok(typedArrayEquals(b.levels[i].levelData, a.levels[i].levelData), `container.levels[${i}].levelData`);
	}

	// UASTC does not have supercompression.
	t.equals(a.globalData, null, 'container.globalData = null (1/2)');
	t.equals(b.globalData, null, 'container.globalData = null (2/2)');

	// Remove KTXWriter (intentionally changed) and data too large for deepEquals().
	a.keyValue['KTXwriter'] = b.keyValue['KTXwriter'] = 'TEST';
	a.levels = b.levels = [];
	a.globalData = b.globalData = null;

	t.deepEquals(b, a, 'container.*');
	t.end();
});

test('platform::web', t => {
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

test('data format descriptors', t => {
	const sample1 = {
		bitOffset: 0,
		bitLength: 10,
		channelType: 0,
		samplePosition: [1, 2, 3, 4],
		sampleLower: 0,
		sampleUpper: 1,
	};
	const sample2 = {...sample1, bitLength: 15};

	const a = read(SAMPLE_UASTC);
	a.dataFormatDescriptor[0].descriptorBlockSize += 16;
	a.dataFormatDescriptor[0].samples = [sample1, sample2];
	const b = read(write(a));

	const dfdA = a.dataFormatDescriptor[0];
	const dfdB = b.dataFormatDescriptor[0];

	t.equals(dfdA.samples.length, 2, 'a.dfd.samples.length === 2');
	t.equals(dfdB.samples.length, 2, 'b.dfd.samples.length === 2');
	t.deepEquals(dfdA.samples[0], dfdB.samples[0], 'a.dfd.samples[0] === b.dfd.samples[0]');
	t.deepEquals(dfdA.samples[0], dfdB.samples[0], 'a.dfd.samples[0] === b.dfd.samples[0]');
	t.end();
});

function typedArrayEquals (a: Uint8Array, b: Uint8Array): boolean {
	if (a.byteLength !== b.byteLength) return false;
	for (let i = 0; i < a.byteLength; i++) { if (a[i] !== b[i]) return false; }
	return true;
}