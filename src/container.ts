import { KTX2DataFormatDescriptor, KTX2GlobalData, KTX2KeyValue, KTX2Level, KTX2SupercompressionScheme } from './ktx2-schema';

export class Container {
	// Header.
	public vkFormat: number = 0x00;
	public typeSize: number = -1;
	public pixelWidth: number = -1;
	public pixelHeight: number = -1;
	public pixelDepth: number = -1;
	public layerCount: number = -1;
	public faceCount: number = -1;
	public supercompressionScheme = KTX2SupercompressionScheme.NONE;

	/** Mip Levels. */
	public levels: KTX2Level[] = [];

	/** Data Format Descriptor. */
	public dataFormatDescriptor: KTX2DataFormatDescriptor[] = [];

	/** Key/Value Data. */
	public keyValue: {[key: string]: string | Uint8Array} = {};

	/** Supercompression Global Data. */
	public globalData: KTX2GlobalData | null = null;
}
