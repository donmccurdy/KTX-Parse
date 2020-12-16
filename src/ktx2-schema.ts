export const KTX2_ID = [
	0xAB, // '´'
	0x4B, // 'K'
	0x54, // 'T'
	0x58, // 'X'
	0x20, // ' '
	0x32, // '2'
	0x30, // '0'
	0xBB, // 'ª'
	0x0D, // '\r'
	0x0A, // '\n'
	0x1A, // '\x1A'
	0x0A // '\n'
];

///////////////////////////////////////////////////
// Mip Levels.
///////////////////////////////////////////////////

export interface KTX2Level {
	data: Uint8Array;
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

export const KTX2DataFormatDescriptorModel = {
	ETC1S: 163,
	UASTC: 166,
};

export const KTX2DataFormatDescriptorChannel = {
	ETC1S: {
		RGB: 0,
		RRR: 3,
		GGG: 4,
		AAA: 15,
	},
	UASTC: {
		RGB: 0,
		RGBA: 3,
		RRR: 4,
		RRRG: 5
	},
};

export interface KTX2DataFormatDescriptorTexelBlockDimensions {
	x: number;
	y: number;
	z: number;
	w: number;
}

export interface KTX2DataFormatDescriptorSample {
	channelID: number;
	// ... remainder not implemented.
}

export interface KTX2DataFormatDescriptor {
	vendorId: number;
	versionNumber: number;
	descriptorBlockSize: number;
	colorModel: number;
	colorPrimaries: number;
	transferFunction: number;
	flags: number;
	texelBlockDimension: KTX2DataFormatDescriptorTexelBlockDimensions;
	bytesPlane0: number;
	numSamples: number;
	samples: KTX2DataFormatDescriptorSample[],
}

///////////////////////////////////////////////////
// Key/Value Data (KFD).
///////////////////////////////////////////////////

export interface KTX2KeyValue {
	// ... remainder not implemented.
}

///////////////////////////////////////////////////
// Supercompression Global Data.
///////////////////////////////////////////////////

interface KTX2GlobalDataImageDescription {
	imageFlags: number;
	rgbSliceByteOffset: number;
	rgbSliceByteLength: number;
	alphaSliceByteOffset: number;
	alphaSliceByteLength: number;
}

export interface KTX2GlobalData {
	endpointCount: number;
	selectorCount: number;
	endpointsByteLength: number;
	selectorsByteLength: number;
	tablesByteLength: number;
	extendedByteLength: number;
	imageDescs: KTX2GlobalDataImageDescription[];
	endpointsData: Uint8Array;
	selectorsData: Uint8Array;
	tablesData: Uint8Array;
	extendedData: Uint8Array;
}