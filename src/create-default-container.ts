import {
	KHR_DF_FLAG_ALPHA_STRAIGHT,
	KHR_DF_KHR_DESCRIPTORTYPE_BASICFORMAT,
	KHR_DF_MODEL_UNSPECIFIED,
	KHR_DF_PRIMARIES_BT709,
	KHR_DF_TRANSFER_SRGB,
	KHR_DF_VENDORID_KHRONOS,
	KHR_DF_VERSION,
	KHR_SUPERCOMPRESSION_NONE,
	VK_FORMAT_UNDEFINED,
} from './constants.js';
import type { KTX2Container } from './container.js';

/**
 * Creates a 'default' {@link KTX2Container} object, initialized with common
 * configuration wfor BT709 primaries and sRGB transfer, without pixel data.
 * There's nothing particularly special about the 'default' container; creating
 * the KTX2Container object explicitly is also fine.
 */
export function createDefaultContainer(): KTX2Container {
	return {
		vkFormat: VK_FORMAT_UNDEFINED,
		typeSize: 1,
		pixelWidth: 0,
		pixelHeight: 0,
		pixelDepth: 0,
		layerCount: 0,
		faceCount: 1,
		levelCount: 0,
		supercompressionScheme: KHR_SUPERCOMPRESSION_NONE,
		levels: [],
		dataFormatDescriptor: [
			{
				vendorId: KHR_DF_VENDORID_KHRONOS,
				descriptorType: KHR_DF_KHR_DESCRIPTORTYPE_BASICFORMAT,
				versionNumber: KHR_DF_VERSION,
				colorModel: KHR_DF_MODEL_UNSPECIFIED,
				colorPrimaries: KHR_DF_PRIMARIES_BT709,
				transferFunction: KHR_DF_TRANSFER_SRGB,
				flags: KHR_DF_FLAG_ALPHA_STRAIGHT,
				texelBlockDimension: [0, 0, 0, 0],
				bytesPlane: [0, 0, 0, 0, 0, 0, 0, 0],
				samples: [],
			},
		],
		keyValue: {},
		globalData: null,
	};
}
