import { Container } from './container';
import { KTX2_ID } from './ktx2-schema';

export function write(container: Container): Uint8Array {
	const buffers: ArrayBuffer[] = [];

	///////////////////////////////////////////////////
	// KTX 2.0 Identifier.
	///////////////////////////////////////////////////

	buffers.push(new Uint8Array(KTX2_ID).buffer);


	///////////////////////////////////////////////////
	// Header.
	///////////////////////////////////////////////////

	buffers.push(new Uint32Array([
		container.vkFormat,
		container.typeSize,
		container.pixelWidth,
		container.pixelHeight,
		container.pixelDepth,
		container.layerCount,
		container.faceCount,
		container.levelCount,
		container.supercompressionScheme,
		-1, // dfdByteOffset
		-1, // dfdByteLength
		-1, // kvdByteOffset
		-1, // kvdByteLength
		-1, // sgdByteOffset
		-1, // sgdByteLength
	]).buffer);


	///////////////////////////////////////////////////
	// Level Index.
	///////////////////////////////////////////////////


	///////////////////////////////////////////////////
	// Data Format Descriptor (DFD).
	///////////////////////////////////////////////////


	///////////////////////////////////////////////////
	// Key/Value Data (KVD).
	///////////////////////////////////////////////////


	///////////////////////////////////////////////////
	// Supercompression Global Data (SGD).
	///////////////////////////////////////////////////


	return new Uint8Array(concat(buffers));
}

/** Concatenates N ArrayBuffers. */
function concat (buffers: ArrayBuffer[]): ArrayBuffer {
	let totalByteLength = 0;
	for (const buffer of buffers) {
		totalByteLength += buffer.byteLength;
	}

	const result = new Uint8Array(totalByteLength);
	let byteOffset = 0;

	for (const buffer of buffers) {
		result.set(new Uint8Array(buffer), byteOffset);
		byteOffset += buffer.byteLength;
	}

	return result.buffer;
}