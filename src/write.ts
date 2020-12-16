import { Container } from './container';
import { KTX2_ID } from './ktx2-schema';
import { concat } from './util';

export function write(container: Container): Uint8Array {
	///////////////////////////////////////////////////
	// Supercompression Global Data (SGD).
	///////////////////////////////////////////////////

	const sgdBuffer = new ArrayBuffer(64);


	///////////////////////////////////////////////////
	// Key/Value Data (KVD).
	///////////////////////////////////////////////////

	const kvdBuffer = new ArrayBuffer(0);
	if (container.keyValue.length) {
		// TODO(bug): Implement.
		console.warn('writing container.keyValue not implemented.');
	}

	// TODO(bug): Need to reset KTXwriter and KTXwriterScParams.


	///////////////////////////////////////////////////
	// Data Format Descriptor (DFD).
	///////////////////////////////////////////////////

	const dfdBuffer = new ArrayBuffer(64);


	///////////////////////////////////////////////////
	// Level Index.
	///////////////////////////////////////////////////

	const levelData = new ArrayBuffer(1024);
	const levelIndex = new ArrayBuffer(32);


	///////////////////////////////////////////////////
	// Header.
	///////////////////////////////////////////////////

	const headerByteLength = KTX2_ID.length + 17 * Uint32Array.BYTES_PER_ELEMENT;
	const headerBuffer = new Uint32Array([
		container.vkFormat,
		container.typeSize,
		container.pixelWidth,
		container.pixelHeight,
		container.pixelDepth,
		container.layerCount,
		container.faceCount,
		container.levelCount,
		container.supercompressionScheme,

		// DFD byteOffset and byteLength.
		headerByteLength + levelIndex.byteLength,
		dfdBuffer.byteLength,

		// KVD byteOffset and byteLength.
		headerByteLength + levelIndex.byteLength + dfdBuffer.byteLength,
		kvdBuffer.byteLength,

		// SGD byteOffset and byteLength.
		0, headerByteLength + levelIndex.byteLength + dfdBuffer.byteLength + kvdBuffer.byteLength,
		0, sgdBuffer.byteLength,
	]);

	///////////////////////////////////////////////////
	// Compose.
	///////////////////////////////////////////////////

	return new Uint8Array(concat([
		new Uint8Array(KTX2_ID).buffer,
		headerBuffer,
		levelIndex,
		dfdBuffer,
		kvdBuffer,
		// TODO: align(8)
		sgdBuffer,
		levelData,
	]));
}

