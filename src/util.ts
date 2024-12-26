import type { vec3 } from './constants-internal.js';
import {
	type VKFormat,
	VK_FORMAT_ASTC_4x4_SRGB_BLOCK,
	VK_FORMAT_ASTC_4x4_UNORM_BLOCK,
	VK_FORMAT_ASTC_5x4_SRGB_BLOCK,
	VK_FORMAT_ASTC_5x4_UNORM_BLOCK,
	VK_FORMAT_ASTC_5x5_SRGB_BLOCK,
	VK_FORMAT_ASTC_5x5_UNORM_BLOCK,
	VK_FORMAT_ASTC_6x5_SRGB_BLOCK,
	VK_FORMAT_ASTC_6x5_UNORM_BLOCK,
	VK_FORMAT_ASTC_6x6_SRGB_BLOCK,
	VK_FORMAT_ASTC_6x6_UNORM_BLOCK,
	VK_FORMAT_ASTC_8x5_SRGB_BLOCK,
	VK_FORMAT_ASTC_8x5_UNORM_BLOCK,
	VK_FORMAT_ASTC_8x6_SRGB_BLOCK,
	VK_FORMAT_ASTC_8x6_UNORM_BLOCK,
	VK_FORMAT_ASTC_8x8_SRGB_BLOCK,
	VK_FORMAT_ASTC_8x8_UNORM_BLOCK,
	VK_FORMAT_ASTC_10x5_SRGB_BLOCK,
	VK_FORMAT_ASTC_10x5_UNORM_BLOCK,
	VK_FORMAT_ASTC_10x6_SRGB_BLOCK,
	VK_FORMAT_ASTC_10x6_UNORM_BLOCK,
	VK_FORMAT_ASTC_10x8_SRGB_BLOCK,
	VK_FORMAT_ASTC_10x8_UNORM_BLOCK,
	VK_FORMAT_ASTC_10x10_SRGB_BLOCK,
	VK_FORMAT_ASTC_10x10_UNORM_BLOCK,
	VK_FORMAT_ASTC_12x10_SRGB_BLOCK,
	VK_FORMAT_ASTC_12x10_UNORM_BLOCK,
	VK_FORMAT_ASTC_12x12_SRGB_BLOCK,
	VK_FORMAT_ASTC_12x12_UNORM_BLOCK,
	VK_FORMAT_BC1_RGB_UNORM_BLOCK,
	VK_FORMAT_BC7_SRGB_BLOCK,
	VK_FORMAT_EAC_R11G11_SNORM_BLOCK,
	VK_FORMAT_ETC2_R8G8B8_UNORM_BLOCK,
	VK_FORMAT_PVRTC1_2BPP_SRGB_BLOCK_IMG,
	VK_FORMAT_PVRTC1_2BPP_UNORM_BLOCK_IMG,
	VK_FORMAT_PVRTC1_4BPP_SRGB_BLOCK_IMG,
	VK_FORMAT_PVRTC1_4BPP_UNORM_BLOCK_IMG,
	VK_FORMAT_PVRTC2_2BPP_SRGB_BLOCK_IMG,
	VK_FORMAT_PVRTC2_2BPP_UNORM_BLOCK_IMG,
	VK_FORMAT_PVRTC2_4BPP_SRGB_BLOCK_IMG,
	VK_FORMAT_PVRTC2_4BPP_UNORM_BLOCK_IMG,
	VK_FORMAT_UNDEFINED,
} from './constants.js';
import type { KTX2Container } from './container.js';

/** Encodes text to an ArrayBuffer. */
export function encodeText(text: string): Uint8Array {
	return new TextEncoder().encode(text);
}

/** Decodes an ArrayBuffer to text. */
export function decodeText(buffer: Uint8Array): string {
	return new TextDecoder().decode(buffer);
}

/** Concatenates N ArrayBuffers. */
export function concat(buffers: (ArrayBuffer | Uint8Array)[]): Uint8Array {
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

	return result;
}

/** Returns the least common multiple (LCM) for two positive integers. */
export function leastCommonMultiple(a: number, b: number): number {
	const max = Math.max(a, b);
	const min = Math.min(a, b);
	let lcm = max;

	while (lcm % min !== 0) {
		lcm += max;
	}

	return lcm;
}

/**
 * Returns amount of padding, in bytes, required to pad a value V to N-byte
 * boundaries. Both V and N must be positive integers.
 */
export function getPadding(v: number, n = 4): number {
	return Math.ceil(v / n) * n - v;
}

/** Returns byte length per texel block. */
export function getBlockByteLength(container: KTX2Container): number {
	return container.levels[0].levelData.byteLength / getBlockCount(container, 0);
}

/**
 * Returns total number of blocks for given level. For VK_FORMAT_UNDEFINED, DFD is required.
 *
 * References:
 * - https://github.khronos.org/KTX-Specification/ktxspec.v2.html#levelImages
 */
export function getBlockCount(container: KTX2Container, levelIndex: number): number {
	let blockCount = 1;

	const pixelDimensions = [container.pixelWidth, container.pixelHeight, container.pixelDepth];
	const blockDimensions = getBlockDimensions(container);

	for (let i = 0; i < 3; i++) {
		if (pixelDimensions[i] > 0) {
			const dimBlockCount = Math.ceil(Math.floor(pixelDimensions[i] * 2 ** -levelIndex) / blockDimensions[i]);
			blockCount *= Math.max(1, dimBlockCount);
		}
	}

	if (container.layerCount > 0) {
		blockCount *= container.layerCount;
	}

	if (container.faceCount > 0) {
		blockCount *= container.faceCount;
	}

	return blockCount;
}

/**
 * Given a KTX2 container, returns block dimensions as [width, height, depth]. Requires valid DFD.
 */
export function getBlockDimensions(container: KTX2Container): vec3 {
	const [x, y, z] = container.dataFormatDescriptor[0].texelBlockDimension;
	return [x + 1, y + 1, z + 1];
}

/**
 * Given `vkFormat`, returns block dimensions as [width, height, depth]. Does not support
 * VK_FORMAT_UNDEFINED.
 *
 * References:
 * - https://github.khronos.org/KTX-Specification/ktxspec.v2.html#_mippadding
 * - https://registry.khronos.org/vulkan/specs/1.2-extensions/html/vkspec.html#formats-compatibility
 */
export function getBlockDimensionsByVKFormat(vkFormat: VKFormat): vec3 {
	if (vkFormat === VK_FORMAT_UNDEFINED) {
		throw new Error('Unknown block dimensions for VK_FORMAT_UNDEFINED.');
	}
	if (vkFormat >= VK_FORMAT_BC1_RGB_UNORM_BLOCK && vkFormat <= VK_FORMAT_BC7_SRGB_BLOCK) {
		return [4, 4, 1];
	}
	if (vkFormat >= VK_FORMAT_ETC2_R8G8B8_UNORM_BLOCK && vkFormat <= VK_FORMAT_EAC_R11G11_SNORM_BLOCK) {
		return [4, 4, 1];
	}
	if (vkFormat === VK_FORMAT_ASTC_4x4_UNORM_BLOCK || vkFormat === VK_FORMAT_ASTC_4x4_SRGB_BLOCK) {
		return [4, 4, 1];
	}
	if (vkFormat === VK_FORMAT_ASTC_5x4_UNORM_BLOCK || vkFormat === VK_FORMAT_ASTC_5x4_SRGB_BLOCK) {
		return [5, 4, 1];
	}
	if (vkFormat === VK_FORMAT_ASTC_5x5_UNORM_BLOCK || vkFormat === VK_FORMAT_ASTC_5x5_SRGB_BLOCK) {
		return [5, 5, 1];
	}
	if (vkFormat === VK_FORMAT_ASTC_6x5_UNORM_BLOCK || vkFormat === VK_FORMAT_ASTC_6x5_SRGB_BLOCK) {
		return [6, 5, 1];
	}
	if (vkFormat === VK_FORMAT_ASTC_6x6_UNORM_BLOCK || vkFormat === VK_FORMAT_ASTC_6x6_SRGB_BLOCK) {
		return [6, 6, 1];
	}
	if (vkFormat === VK_FORMAT_ASTC_8x5_UNORM_BLOCK || vkFormat === VK_FORMAT_ASTC_8x5_SRGB_BLOCK) {
		return [8, 5, 1];
	}
	if (vkFormat === VK_FORMAT_ASTC_8x6_UNORM_BLOCK || vkFormat === VK_FORMAT_ASTC_8x6_SRGB_BLOCK) {
		return [8, 6, 1];
	}
	if (vkFormat === VK_FORMAT_ASTC_8x8_UNORM_BLOCK || vkFormat === VK_FORMAT_ASTC_8x8_SRGB_BLOCK) {
		return [8, 8, 1];
	}
	if (vkFormat === VK_FORMAT_ASTC_10x5_UNORM_BLOCK || vkFormat === VK_FORMAT_ASTC_10x5_SRGB_BLOCK) {
		return [10, 5, 1];
	}
	if (vkFormat === VK_FORMAT_ASTC_10x6_UNORM_BLOCK || vkFormat === VK_FORMAT_ASTC_10x6_SRGB_BLOCK) {
		return [10, 6, 1];
	}
	if (vkFormat === VK_FORMAT_ASTC_10x8_UNORM_BLOCK || vkFormat === VK_FORMAT_ASTC_10x8_SRGB_BLOCK) {
		return [10, 8, 1];
	}
	if (vkFormat === VK_FORMAT_ASTC_10x10_UNORM_BLOCK || vkFormat === VK_FORMAT_ASTC_10x10_SRGB_BLOCK) {
		return [10, 10, 1];
	}
	if (vkFormat === VK_FORMAT_ASTC_12x10_UNORM_BLOCK || vkFormat === VK_FORMAT_ASTC_12x10_SRGB_BLOCK) {
		return [12, 10, 1];
	}
	if (vkFormat === VK_FORMAT_ASTC_12x12_UNORM_BLOCK || vkFormat === VK_FORMAT_ASTC_12x12_SRGB_BLOCK) {
		return [12, 12, 1];
	}
	if (
		vkFormat === VK_FORMAT_PVRTC1_2BPP_UNORM_BLOCK_IMG ||
		vkFormat === VK_FORMAT_PVRTC1_2BPP_SRGB_BLOCK_IMG ||
		vkFormat === VK_FORMAT_PVRTC2_2BPP_UNORM_BLOCK_IMG ||
		vkFormat === VK_FORMAT_PVRTC2_2BPP_SRGB_BLOCK_IMG
	) {
		return [8, 4, 1];
	}
	if (
		vkFormat === VK_FORMAT_PVRTC1_4BPP_UNORM_BLOCK_IMG ||
		vkFormat === VK_FORMAT_PVRTC1_4BPP_SRGB_BLOCK_IMG ||
		vkFormat === VK_FORMAT_PVRTC2_4BPP_UNORM_BLOCK_IMG ||
		vkFormat === VK_FORMAT_PVRTC2_4BPP_SRGB_BLOCK_IMG
	) {
		return [4, 4, 1];
	}
	return [1, 1, 1];
}
