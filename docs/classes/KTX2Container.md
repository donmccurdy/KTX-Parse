[ktx-parse](../README.md) / [Exports](../modules.md) / KTX2Container

# Class: KTX2Container

## Table of contents

### Constructors

- [constructor](KTX2Container.md#constructor)

### Properties

- [dataFormatDescriptor](KTX2Container.md#dataformatdescriptor)
- [faceCount](KTX2Container.md#facecount)
- [globalData](KTX2Container.md#globaldata)
- [keyValue](KTX2Container.md#keyvalue)
- [layerCount](KTX2Container.md#layercount)
- [levels](KTX2Container.md#levels)
- [pixelDepth](KTX2Container.md#pixeldepth)
- [pixelHeight](KTX2Container.md#pixelheight)
- [pixelWidth](KTX2Container.md#pixelwidth)
- [supercompressionScheme](KTX2Container.md#supercompressionscheme)
- [typeSize](KTX2Container.md#typesize)
- [vkFormat](KTX2Container.md#vkformat)

## Constructors

### constructor

• **new KTX2Container**()

## Properties

### dataFormatDescriptor

• **dataFormatDescriptor**: [`KTX2DataFormatDescriptorBasicFormat`](../interfaces/KTX2DataFormatDescriptorBasicFormat.md)[]

#### Defined in

[container.ts:57](https://github.com/donmccurdy/KTX-Parse/blob/13479f8/src/container.ts#L57)

___

### faceCount

• **faceCount**: `number` = `1`

#### Defined in

[container.ts:48](https://github.com/donmccurdy/KTX-Parse/blob/13479f8/src/container.ts#L48)

___

### globalData

• **globalData**: ``null`` \| [`KTX2GlobalDataBasisLZ`](../interfaces/KTX2GlobalDataBasisLZ.md) = `null`

#### Defined in

[container.ts:77](https://github.com/donmccurdy/KTX-Parse/blob/13479f8/src/container.ts#L77)

___

### keyValue

• **keyValue**: `Object` = `{}`

#### Index signature

▪ [key: `string`]: `string` \| `Uint8Array`

#### Defined in

[container.ts:74](https://github.com/donmccurdy/KTX-Parse/blob/13479f8/src/container.ts#L74)

___

### layerCount

• **layerCount**: `number` = `0`

#### Defined in

[container.ts:41](https://github.com/donmccurdy/KTX-Parse/blob/13479f8/src/container.ts#L41)

___

### levels

• **levels**: [`KTX2Level`](../interfaces/KTX2Level.md)[] = `[]`

#### Defined in

[container.ts:54](https://github.com/donmccurdy/KTX-Parse/blob/13479f8/src/container.ts#L54)

___

### pixelDepth

• **pixelDepth**: `number` = `0`

#### Defined in

[container.ts:38](https://github.com/donmccurdy/KTX-Parse/blob/13479f8/src/container.ts#L38)

___

### pixelHeight

• **pixelHeight**: `number` = `0`

#### Defined in

[container.ts:35](https://github.com/donmccurdy/KTX-Parse/blob/13479f8/src/container.ts#L35)

___

### pixelWidth

• **pixelWidth**: `number` = `0`

#### Defined in

[container.ts:32](https://github.com/donmccurdy/KTX-Parse/blob/13479f8/src/container.ts#L32)

___

### supercompressionScheme

• **supercompressionScheme**: `number` = `KHR_SUPERCOMPRESSION_NONE`

#### Defined in

[container.ts:51](https://github.com/donmccurdy/KTX-Parse/blob/13479f8/src/container.ts#L51)

___

### typeSize

• **typeSize**: `number` = `1`

#### Defined in

[container.ts:29](https://github.com/donmccurdy/KTX-Parse/blob/13479f8/src/container.ts#L29)

___

### vkFormat

• **vkFormat**: `number` = `VK_FORMAT_UNDEFINED`

#### Defined in

[container.ts:23](https://github.com/donmccurdy/KTX-Parse/blob/13479f8/src/container.ts#L23)
