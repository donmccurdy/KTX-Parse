[ktx-parse](../README.md) / [Exports](../modules.md) / KTX2Level

# Interface: KTX2Level

## Table of contents

### Properties

- [levelData](KTX2Level.md#leveldata)
- [uncompressedByteLength](KTX2Level.md#uncompressedbytelength)

## Properties

### levelData

• **levelData**: `Uint8Array`

Compressed data of the mip level.

#### Defined in

[container.ts:88](https://github.com/donmccurdy/KTX-Parse/blob/30a25c2/src/container.ts#L88)

___

### uncompressedByteLength

• **uncompressedByteLength**: `number`

Size of the mip level after reflation from supercompression, if applicable. When
`supercompressionType` is BASISLZ, `uncompressedByteLength` must be 0. When
`supercompressionType` is `NONE`, `uncompressedByteLength` must match the `levelData` byte
length.

_**NOTICE:** this implies that for formats such as UASTC, `uncompressedByteLength` may
indicate size after ZSTD reflation (and of transcoded ASTC data), but does _not_ indicate
size of decoded RGBA32 pixels._

#### Defined in

[container.ts:100](https://github.com/donmccurdy/KTX-Parse/blob/30a25c2/src/container.ts#L100)
