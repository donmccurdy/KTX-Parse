export class BufferReader {
	private _dataView: DataView;
	private _littleEndian: boolean;
	public _offset: number;

	constructor(data: Uint8Array, byteOffset: number, byteLength: number, littleEndian: boolean ) {
		this._dataView = new DataView( data, byteOffset, byteLength );
		this._littleEndian = littleEndian;
		this._offset = 0;
	}

	_nextUint8() {
		const value = this._dataView.getUint8( this._offset );
		this._offset += 1;
		return value;
	}

	_nextUint16() {
		const value = this._dataView.getUint16( this._offset, this._littleEndian );
		this._offset += 2;
		return value;
	}

	_nextUint32() {
		const value = this._dataView.getUint32( this._offset, this._littleEndian );
		this._offset += 4;
		return value;
	}

	_nextUint64() {
		// https://stackoverflow.com/questions/53103695/
		const left = this._dataView.getUint32( this._offset, this._littleEndian );
		const right = this._dataView.getUint32( this._offset + 4, this._littleEndian );
		const value = this._littleEndian ? left + ( 2 ** 32 * right ) : ( 2 ** 32 * left ) + right;

		if (!Number.isSafeInteger(value)) {
			console.warn(value + ' exceeds MAX_SAFE_INTEGER. Precision may be lost.');
		}

		this._offset += 8;
		return value;
	}

	_skip(bytes: number) {
		this._offset += bytes;
		return this;
	}
}
