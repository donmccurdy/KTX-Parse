import { Container } from './container';

// Data Format Descriptor (DFD) constants.

const DFDModel = {
	ETC1S: 163,
	UASTC: 166,
};

const DFDChannel = {
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

interface KTX2Header {
	vkFormat: number;
	typeSize: number;
	pixelWidth: number;
	pixelHeight: number;
	pixelDepth: number;
	arrayElementCount: number;
	faceCount: number;
	levelCount: number;

	supercompressionScheme: number;

	dfdByteOffset: number;
	dfdByteLength: number;
	kvdByteOffset: number;
	kvdByteLength: number;
	sgdByteOffset: number;
	sgdByteLength: number;
}

interface KTX2Level {
	byteOffset: number;
	byteLength: number;
	uncompressedByteLength: number;
}

interface KTX2TexelBlockDimensions {
	x: number;
	y: number;
	z: number;
	w: number;
}

interface KTX2Sample {
	channelID: number;
}

interface KTX2DFD {
	vendorId: number;
	versionNumber: number;
	descriptorBlockSize: number;
	colorModel: number;
	colorPrimaries: number;
	transferFunction: number;
	flags: number;
	texelBlockDimension: KTX2TexelBlockDimensions;
	bytesPlane0: number;
	numSamples: number;
	samples: KTX2Sample[],
}

interface KTX2ImageDescription {
	imageFlags: number;
	rgbSliceByteOffset: number;
	rgbSliceByteLength: number;
	alphaSliceByteOffset: number;
	alphaSliceByteLength: number;
}

interface KTX2SGD {
	endpointCount: number;
	selectorCount: number;
	endpointsByteLength: number;
	selectorsByteLength: number;
	tablesByteLength: number;
	extendedByteLength: number;
	imageDescs: KTX2ImageDescription[];
	endpointsData: Uint8Array;
	selectorsData: Uint8Array;
	tablesData: Uint8Array;
	extendedData: Uint8Array;
}

export function read(data: Uint8Array): Container {

	// Confirm this is a KTX 2.0 file, based on the identifier in the first 12 bytes.
	var idByteLength = 12;
	var id = new Uint8Array( data, 0, idByteLength );
	if ( id[ 0 ] !== 0xAB || // '´'
			id[ 1 ] !== 0x4B || // 'K'
			id[ 2 ] !== 0x54 || // 'T'
			id[ 3 ] !== 0x58 || // 'X'
			id[ 4 ] !== 0x20 || // ' '
			id[ 5 ] !== 0x32 || // '2'
			id[ 6 ] !== 0x30 || // '0'
			id[ 7 ] !== 0xBB || // 'ª'
			id[ 8 ] !== 0x0D || // '\r'
			id[ 9 ] !== 0x0A || // '\n'
			id[ 10 ] !== 0x1A || // '\x1A'
			id[ 11 ] !== 0x0A // '\n'
	) {
		throw new Error( 'THREE.KTX2Loader: Missing KTX 2.0 identifier.' );
	}

	const container = new Container();

	///////////////////////////////////////////////////
	// Header.
	///////////////////////////////////////////////////

	const headerByteLength = 17 * Uint32Array.BYTES_PER_ELEMENT;
	const headerReader = new KTX2BufferReader( data, idByteLength, headerByteLength, true );

	const header: KTX2Header = {
		vkFormat: headerReader.nextUint32(),
		typeSize: headerReader.nextUint32(),
		pixelWidth: headerReader.nextUint32(),
		pixelHeight: headerReader.nextUint32(),
		pixelDepth: headerReader.nextUint32(),
		arrayElementCount: headerReader.nextUint32(),
		faceCount: headerReader.nextUint32(),
		levelCount: headerReader.nextUint32(),

		supercompressionScheme: headerReader.nextUint32(),

		dfdByteOffset: headerReader.nextUint32(),
		dfdByteLength: headerReader.nextUint32(),
		kvdByteOffset: headerReader.nextUint32(),
		kvdByteLength: headerReader.nextUint32(),
		sgdByteOffset: headerReader.nextUint64(),
		sgdByteLength: headerReader.nextUint64(),
	};

	if ( header.pixelDepth > 0 ) {
		throw new Error( 'Only 2D textures are currently supported.' );
	}

	if ( header.arrayElementCount > 1 ) {
		throw new Error( 'Array textures are not currently supported.' );
	}

	if ( header.faceCount > 1 ) {
		throw new Error( 'Cube textures are not currently supported.' );
	}


	///////////////////////////////////////////////////
	// Level index
	///////////////////////////////////////////////////

	const levelByteLength = header.levelCount * 3 * 8;
	const levelReader = new KTX2BufferReader( data, idByteLength + headerByteLength, levelByteLength, true );

	const levels: KTX2Level[] = [];

	for ( let i = 0; i < header.levelCount; i ++ ) {
		levels.push( {
			byteOffset: levelReader.nextUint64(),
			byteLength: levelReader.nextUint64(),
			uncompressedByteLength: levelReader.nextUint64(),
		} );
	}


	///////////////////////////////////////////////////
	// Data Format Descriptor (DFD)
	///////////////////////////////////////////////////

	const dfdReader = new KTX2BufferReader(
		data,
		header.dfdByteOffset,
		header.dfdByteLength,
		true
	);

	const sampleStart = 6;
	const sampleWords = 4;

	const dfd: KTX2DFD = {

		vendorId: dfdReader.skip( 4 /* totalSize */ ).nextUint16(),
		versionNumber: dfdReader.skip( 2 /* descriptorType */ ).nextUint16(),
		descriptorBlockSize: dfdReader.nextUint16(),
		colorModel: dfdReader.nextUint8(),
		colorPrimaries: dfdReader.nextUint8(),
		transferFunction: dfdReader.nextUint8(),
		flags: dfdReader.nextUint8(),
		texelBlockDimension: {
			x: dfdReader.nextUint8() + 1,
			y: dfdReader.nextUint8() + 1,
			z: dfdReader.nextUint8() + 1,
			w: dfdReader.nextUint8() + 1,
		},
		bytesPlane0: dfdReader.nextUint8(),
		numSamples: 0,
		samples: [],

	};

	dfd.numSamples = ( dfd.descriptorBlockSize / 4 - sampleStart ) / sampleWords;

	dfdReader.skip( 7 /* bytesPlane[1-7] */ );

	for ( var i = 0; i < dfd.numSamples; i ++ ) {
		dfd.samples[ i ] = {

			channelID: dfdReader.skip( 3 /* bitOffset + bitLength */ ).nextUint8(),
			// ... remainder not implemented.

		};
		dfdReader.skip( 12 /* samplePosition[0-3], lower, upper */ );
	}

	if ( header.vkFormat !== 0x00 /* VK_FORMAT_UNDEFINED */ &&
			! ( header.supercompressionScheme === 1 /* BasisLZ */ ||
			dfd.colorModel === DFDModel.UASTC ) ) {
		throw new Error( 'Only Basis Universal supercompression is currently supported.' );
	}


	///////////////////////////////////////////////////
	// Key/Value Data (KVD)
	///////////////////////////////////////////////////

	// Not implemented.
	const kvd = {};


	///////////////////////////////////////////////////
	// Supercompression Global Data (SGD)
	///////////////////////////////////////////////////

	if ( header.sgdByteLength <= 0 ) return container;

	const sgdReader = new KTX2BufferReader(
		data,
		header.sgdByteOffset,
		header.sgdByteLength,
		true
	);

	const sgd: KTX2SGD = {
		endpointCount: sgdReader.nextUint16(),
		selectorCount: sgdReader.nextUint16(),
		endpointsByteLength: sgdReader.nextUint32(),
		selectorsByteLength: sgdReader.nextUint32(),
		tablesByteLength: sgdReader.nextUint32(),
		extendedByteLength: sgdReader.nextUint32(),
		imageDescs: [],
		endpointsData: null,
		selectorsData: null,
		tablesData: null,
		extendedData: null,
	};



	for ( var i = 0; i < header.levelCount; i ++ ) {
		sgd.imageDescs.push( {
			imageFlags: sgdReader.nextUint32(),
			rgbSliceByteOffset: sgdReader.nextUint32(),
			rgbSliceByteLength: sgdReader.nextUint32(),
			alphaSliceByteOffset: sgdReader.nextUint32(),
			alphaSliceByteLength: sgdReader.nextUint32(),
		} );
	}

	const endpointsByteOffset = header.sgdByteOffset + sgdReader.offset;
	const selectorsByteOffset = endpointsByteOffset + sgd.endpointsByteLength;
	const tablesByteOffset = selectorsByteOffset + sgd.selectorsByteLength;
	const extendedByteOffset = tablesByteOffset + sgd.tablesByteLength;

	sgd.endpointsData = new Uint8Array( data, endpointsByteOffset, sgd.endpointsByteLength );
	sgd.selectorsData = new Uint8Array( data, selectorsByteOffset, sgd.selectorsByteLength );
	sgd.tablesData = new Uint8Array( data, tablesByteOffset, sgd.tablesByteLength );
	sgd.extendedData = new Uint8Array( data, extendedByteOffset, sgd.extendedByteLength );

	return container;
}

class KTX2BufferReader {

	private _dataView: DataView;
	private _littleEndian: boolean;
	private _offset: number;

	constructor(data: Uint8Array, byteOffset: number, byteLength: number, littleEndian: boolean ) {
		this._dataView = new DataView( data, byteOffset, byteLength );
		this._littleEndian = littleEndian;
		this._offset = 0;
	}

	nextUint8() {
		const value = this._dataView.getUint8( this._offset );
		this._offset += 1;
		return value;
	}

	nextUint16() {
		const value = this._dataView.getUint16( this._offset, this._littleEndian );
		this._offset += 2;
		return value;
	}

	nextUint32() {
		const value = this._dataView.getUint32( this._offset, this._littleEndian );
		this._offset += 4;
		return value;
	}

	nextUint64() {
		// https://stackoverflow.com/questions/53103695/
		const left = this._dataView.getUint32( this._offset, this._littleEndian );
		const right = this._dataView.getUint32( this._offset + 4, this._littleEndian );
		const value = this._littleEndian ? left + ( 2 ** 32 * right ) : ( 2 ** 32 * left ) + right;

		if ( ! Number.isSafeInteger( value ) ) {
			console.warn( value + ' exceeds MAX_SAFE_INTEGER. Precision may be lost.' );
		}

		this._offset += 8;
		return value;
	}

	skip( bytes: number ) {
		this._offset += bytes;
		return this;
	}

}