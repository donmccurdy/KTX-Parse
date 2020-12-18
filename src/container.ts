import { KHR_DF_BLOCKSIZE, KHR_DF_VENDORID_KHRONOS, KHR_DF_VERSION, KTX2DataFormatFlags, KTX2DataFormatModel, KTX2DataFormatPrimaries, KTX2DataFormatType, VK_FORMAT_UNDEFINED } from './constants';

export class KTX2Container {
	// Header.
	public vkFormat = VK_FORMAT_UNDEFINED;
	public typeSize: number = 1;
	public pixelWidth: number = 0;
	public pixelHeight: number = 0;
	public pixelDepth: number = 0;
	public layerCount: number = 0;
	public faceCount: number = 1;
	public supercompressionScheme = KTX2SupercompressionScheme.NONE;

	/** Mip Levels. */
	public levels: KTX2Level[] = [];

	/** Data Format Descriptor. */
	public dataFormatDescriptor: KTX2DataFormatDescriptorBasicFormat[] = [{
		vendorId: KHR_DF_VENDORID_KHRONOS,
		descriptorType: KTX2DataFormatType.BASICFORMAT,
		versionNumber: KHR_DF_VERSION,
		descriptorBlockSize: KHR_DF_BLOCKSIZE,
		colorModel: KTX2DataFormatModel.UNSPECIFIED,
		colorPrimaries: KTX2DataFormatPrimaries.SRGB,
		transferFunction: KTX2DataFormatPrimaries.SRGB,
		flags: KTX2DataFormatFlags.ALPHA_STRAIGHT,
		texelBlockDimension: {x: 4, y: 4, z: 1, w: 1},
		bytesPlane: [],
		samples: [],
	}];

	/** Key/Value Data. */
	public keyValue: {[key: string]: string | Uint8Array} = {};

	/** Supercompression Global Data. */
	public globalData: KTX2GlobalDataBasisLZ | null = null;
}


///////////////////////////////////////////////////
// Mip Levels.
///////////////////////////////////////////////////

export interface KTX2Level {
	levelData: Uint8Array;
	uncompressedByteLength: number;
}

export enum KTX2SupercompressionScheme {
	NONE = 0,
	BASISLZ = 1,
	ZSTD = 2,
	ZLIB = 3,
}


///////////////////////////////////////////////////
// Data Format Descriptor (DFD).
///////////////////////////////////////////////////

export interface KTX2DataFormatDescriptorBasicFormat {
	vendorId: number;
	descriptorType: number;
	versionNumber: number;
	descriptorBlockSize: number;
	colorModel: number;
	colorPrimaries: number;
	transferFunction: number;
	flags: number;
	texelBlockDimension: KTX2BasicFormatTexelBlockDimensions;
	bytesPlane: number[];
	samples: KTX2BasicFormatSample[],
}

export interface KTX2BasicFormatTexelBlockDimensions {
	x: number;
	y: number;
	z: number;
	w: number;
}

export interface KTX2BasicFormatSample {
	bitOffset: number;
	bitLength: number;
	channelID: number;
	samplePosition: number[];
	sampleLower: number;
	sampleUpper: number;
}


///////////////////////////////////////////////////
// Supercompression Global Data.
///////////////////////////////////////////////////

export interface KTX2GlobalDataBasisLZ {
	endpointCount: number;
	selectorCount: number;
	imageDescs: KTX2GlobalDataBasisLZImageDesc[];
	endpointsData: Uint8Array;
	selectorsData: Uint8Array;
	tablesData: Uint8Array;
	extendedData: Uint8Array;
}

interface KTX2GlobalDataBasisLZImageDesc {
	imageFlags: number;
	rgbSliceByteOffset: number;
	rgbSliceByteLength: number;
	alphaSliceByteOffset: number;
	alphaSliceByteLength: number;
}
