import { BufferReader } from './buffer-reader.js';
import { KTX2_ID } from './constants-internal.js';
import { KHR_DF_SAMPLE_DATATYPE_SIGNED, type Supercompression, type VKFormat } from './constants.js';
import type { KTX2BasicFormatSample, KTX2Container, KTX2DataFormatDescriptorBasicFormat } from './container.js';
import { createDefaultContainer } from './create-default-container.js';
import { decodeText } from './util.js';

/**
 * Parses a KTX 2.0 file, returning an unpacked {@link KTX2Container} instance with all associated
 * data. The container's mip levels and other binary data are pointers into the original file, not
 * copies, so the original file should not be overwritten after reading.
 *
 * @param data Bytes of KTX 2.0 file, as Uint8Array or Buffer.
 */
export function read(data: Uint8Array): KTX2Container {
	///////////////////////////////////////////////////
	// KTX 2.0 Identifier.
	///////////////////////////////////////////////////

	const id = new Uint8Array(data.buffer, data.byteOffset, KTX2_ID.length);
	if (
		id[0] !== KTX2_ID[0] || // '´'
		id[1] !== KTX2_ID[1] || // 'K'
		id[2] !== KTX2_ID[2] || // 'T'
		id[3] !== KTX2_ID[3] || // 'X'
		id[4] !== KTX2_ID[4] || // ' '
		id[5] !== KTX2_ID[5] || // '2'
		id[6] !== KTX2_ID[6] || // '0'
		id[7] !== KTX2_ID[7] || // 'ª'
		id[8] !== KTX2_ID[8] || // '\r'
		id[9] !== KTX2_ID[9] || // '\n'
		id[10] !== KTX2_ID[10] || // '\x1A'
		id[11] !== KTX2_ID[11] // '\n'
	) {
		throw new Error('Missing KTX 2.0 identifier.');
	}

	const container = createDefaultContainer();

	///////////////////////////////////////////////////
	// Header.
	///////////////////////////////////////////////////

	const headerByteLength = 17 * Uint32Array.BYTES_PER_ELEMENT;
	const headerReader = new BufferReader(data, KTX2_ID.length, headerByteLength, true);

	container.vkFormat = headerReader._nextUint32() as VKFormat;
	container.typeSize = headerReader._nextUint32();
	container.pixelWidth = headerReader._nextUint32();
	container.pixelHeight = headerReader._nextUint32();
	container.pixelDepth = headerReader._nextUint32();
	container.layerCount = headerReader._nextUint32();
	container.faceCount = headerReader._nextUint32();

	const levelCount = headerReader._nextUint32();

	container.supercompressionScheme = headerReader._nextUint32() as Supercompression;

	const dfdByteOffset = headerReader._nextUint32();
	const dfdByteLength = headerReader._nextUint32();
	const kvdByteOffset = headerReader._nextUint32();
	const kvdByteLength = headerReader._nextUint32();
	const sgdByteOffset = headerReader._nextUint64();
	const sgdByteLength = headerReader._nextUint64();

	///////////////////////////////////////////////////
	// Level Index.
	///////////////////////////////////////////////////

	const levelByteLength = levelCount * 3 * 8;
	const levelReader = new BufferReader(data, KTX2_ID.length + headerByteLength, levelByteLength, true);

	for (let i = 0; i < levelCount; i++) {
		container.levels.push({
			levelData: new Uint8Array(data.buffer, data.byteOffset + levelReader._nextUint64(), levelReader._nextUint64()),
			uncompressedByteLength: levelReader._nextUint64(),
		});
	}

	///////////////////////////////////////////////////
	// Data Format Descriptor (DFD).
	///////////////////////////////////////////////////

	const dfdReader = new BufferReader(data, dfdByteOffset, dfdByteLength, true);

	dfdReader._skip(4); // totalSize
	const vendorId = dfdReader._nextUint16();
	const descriptorType = dfdReader._nextUint16();
	const versionNumber = dfdReader._nextUint16();
	const descriptorBlockSize = dfdReader._nextUint16();
	const colorModel = dfdReader._nextUint8();
	const colorPrimaries = dfdReader._nextUint8();
	const transferFunction = dfdReader._nextUint8();
	const flags = dfdReader._nextUint8();

	const texelBlockDimension = [
		dfdReader._nextUint8(),
		dfdReader._nextUint8(),
		dfdReader._nextUint8(),
		dfdReader._nextUint8(),
	] as KTX2DataFormatDescriptorBasicFormat['texelBlockDimension'];

	const bytesPlane = [
		dfdReader._nextUint8(),
		dfdReader._nextUint8(),
		dfdReader._nextUint8(),
		dfdReader._nextUint8(),
		dfdReader._nextUint8(),
		dfdReader._nextUint8(),
		dfdReader._nextUint8(),
		dfdReader._nextUint8(),
	] as KTX2DataFormatDescriptorBasicFormat['bytesPlane'];

	const samples = [] as KTX2BasicFormatSample[];

	const dfd: KTX2DataFormatDescriptorBasicFormat = {
		vendorId,
		descriptorType,
		versionNumber,
		colorModel,
		colorPrimaries,
		transferFunction,
		flags,
		texelBlockDimension,
		bytesPlane,
		samples,
	};

	const sampleStart = 6;
	const sampleWords = 4;
	const numSamples = (descriptorBlockSize / 4 - sampleStart) / sampleWords;

	for (let i = 0; i < numSamples; i++) {
		const sample = {
			bitOffset: dfdReader._nextUint16(),
			bitLength: dfdReader._nextUint8(),
			channelType: dfdReader._nextUint8(),
			samplePosition: [dfdReader._nextUint8(), dfdReader._nextUint8(), dfdReader._nextUint8(), dfdReader._nextUint8()],
			sampleLower: Number.NEGATIVE_INFINITY,
			sampleUpper: Number.POSITIVE_INFINITY,
		};

		if (sample.channelType & KHR_DF_SAMPLE_DATATYPE_SIGNED) {
			sample.sampleLower = dfdReader._nextInt32();
			sample.sampleUpper = dfdReader._nextInt32();
		} else {
			sample.sampleLower = dfdReader._nextUint32();
			sample.sampleUpper = dfdReader._nextUint32();
		}

		dfd.samples[i] = sample;
	}

	container.dataFormatDescriptor.length = 0;
	container.dataFormatDescriptor.push(dfd);

	///////////////////////////////////////////////////
	// Key/Value Data (KVD).
	///////////////////////////////////////////////////

	const kvdReader = new BufferReader(data, kvdByteOffset, kvdByteLength, true);

	while (kvdReader._offset < kvdByteLength) {
		const keyValueByteLength = kvdReader._nextUint32();
		const keyData = kvdReader._scan(keyValueByteLength);
		const key = decodeText(keyData);

		container.keyValue[key] = kvdReader._nextUint8Array(keyValueByteLength - keyData.byteLength - 1);

		if (key.match(/^ktx/i)) {
			const text = decodeText(container.keyValue[key] as Uint8Array);
			container.keyValue[key] = text.substring(0, text.lastIndexOf('\x00'));
		}

		const kvPadding = keyValueByteLength % 4 ? 4 - (keyValueByteLength % 4) : 0; // align(4)
		// 4-byte alignment.
		kvdReader._skip(kvPadding);
	}

	///////////////////////////////////////////////////
	// Supercompression Global Data (SGD).
	///////////////////////////////////////////////////

	if (sgdByteLength <= 0) return container;

	const sgdReader = new BufferReader(data, sgdByteOffset, sgdByteLength, true);

	const endpointCount = sgdReader._nextUint16();
	const selectorCount = sgdReader._nextUint16();
	const endpointsByteLength = sgdReader._nextUint32();
	const selectorsByteLength = sgdReader._nextUint32();
	const tablesByteLength = sgdReader._nextUint32();
	const extendedByteLength = sgdReader._nextUint32();

	const imageDescs = [];
	for (let i = 0; i < levelCount; i++) {
		imageDescs.push({
			imageFlags: sgdReader._nextUint32(),
			rgbSliceByteOffset: sgdReader._nextUint32(),
			rgbSliceByteLength: sgdReader._nextUint32(),
			alphaSliceByteOffset: sgdReader._nextUint32(),
			alphaSliceByteLength: sgdReader._nextUint32(),
		});
	}

	const endpointsByteOffset = sgdByteOffset + sgdReader._offset;
	const selectorsByteOffset = endpointsByteOffset + endpointsByteLength;
	const tablesByteOffset = selectorsByteOffset + selectorsByteLength;
	const extendedByteOffset = tablesByteOffset + tablesByteLength;

	const endpointsData = new Uint8Array(data.buffer, data.byteOffset + endpointsByteOffset, endpointsByteLength);
	const selectorsData = new Uint8Array(data.buffer, data.byteOffset + selectorsByteOffset, selectorsByteLength);
	const tablesData = new Uint8Array(data.buffer, data.byteOffset + tablesByteOffset, tablesByteLength);
	const extendedData = new Uint8Array(data.buffer, data.byteOffset + extendedByteOffset, extendedByteLength);

	container.globalData = {
		endpointCount,
		selectorCount,
		imageDescs,
		endpointsData,
		selectorsData,
		tablesData,
		extendedData,
	};

	return container;
}
