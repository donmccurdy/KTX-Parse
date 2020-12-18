// Injected at compile time, from $npm_package_version.
declare const PACKAGE_VERSION: string;

export const KTX_WRITER = `KTX-Parse v${PACKAGE_VERSION}`;

export const KTX2_ID = [
	// '´', 'K', 'T', 'X', '2', '0', 'ª', '\r', '\n', '\x1A', '\n'
	0xAB, 0x4B, 0x54, 0x58, 0x20, 0x32, 0x30, 0xBB, 0x0D, 0x0A, 0x1A, 0x0A
];

export const HEADER_BYTE_LENGTH = 68; // 13 * 4 + 2 * 8

export enum KTX2DataFormatDescriptorType {
    BASICFORMAT = 0x00,
};

export enum KTX2DataFormatDescriptorModel {
	ETC1S = 163,
	UASTC = 166,
};

export enum KTX2DataFormatDescriptorChannelETC1S {
    RGB = 0,
    RRR = 3,
    GGG = 4,
    AAA = 15,
};

export enum KTX2DataFormatDescriptorChannelUASTC {
    RGB = 0,
    RGBA = 3,
    RRR = 4,
    RRRG = 5,
};

export const NUL = new Uint8Array([0x00]);
