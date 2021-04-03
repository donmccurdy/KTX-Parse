/**
 * Enums.
 */

///////////////////////////////////////////////////
// KTX2 Header.
///////////////////////////////////////////////////

export enum KTX2SupercompressionScheme {
	NONE = 0,
	BASISLZ = 1,
	ZSTD = 2,
	ZLIB = 3,
};


///////////////////////////////////////////////////
// Data Format Descriptor (DFD).
///////////////////////////////////////////////////

export enum KTX2DataFormatDescriptorType {
	BASICFORMAT = 0x00,
};

export enum KTX2DataFormatModel {
	UNSPECIFIED = 0,
	ETC1S = 163,
	UASTC = 166,
};

export enum KTX2DataFormatPrimaries {
	UNSPECIFIED = 0,
	SRGB = 1,
};

export enum KTX2DataFormatTransfer {
	UNSPECIFIED = 0,
	LINEAR = 1,
	SRGB = 2,
	ITU = 3,
	NTSC = 4,
	SLOG = 5,
	SLOG2 = 6,
};

export enum KTX2DataFormatFlags {
	ALPHA_STRAIGHT = 0,
	ALPHA_PREMULTIPLIED = 1,
};

export enum KTX2DataFormatChannelETC1S {
	RGB = 0,
	RRR = 3,
	GGG = 4,
	AAA = 15,
};

export enum KTX2DataFormatChannelUASTC {
	RGB = 0,
	RGBA = 3,
	RRR = 4,
	RRRG = 5,
};
