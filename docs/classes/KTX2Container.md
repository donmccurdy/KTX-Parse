[ktx-parse](../README.md) / [Exports](../modules.md) / KTX2Container

# Class: KTX2Container

Represents an unpacked KTX 2.0 texture container. Data for individual mip levels are stored in
the `.levels` array, typically compressed in Basis Universal formats. Additional properties
provide metadata required to process, transcode, and upload these textures.

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

Data Format Descriptor.

#### Defined in

[container.ts:57](https://github.com/donmccurdy/KTX-Parse/blob/9988acf/src/container.ts#L57)

___

### faceCount

• **faceCount**: `number` = `1`

Number of cubemap faces. For cubemaps and cubemap arrays, `faceCount` must be 6. For all
other textures, `faceCount` must be 1. Cubemap faces are stored in +X, -X, +Y, -Y, +Z, -Z
order.

#### Defined in

[container.ts:48](https://github.com/donmccurdy/KTX-Parse/blob/9988acf/src/container.ts#L48)

___

### globalData

• **globalData**: ``null`` \| [`KTX2GlobalDataBasisLZ`](../interfaces/KTX2GlobalDataBasisLZ.md) = `null`

Supercompression Global Data.

#### Defined in

[container.ts:77](https://github.com/donmccurdy/KTX-Parse/blob/9988acf/src/container.ts#L77)

___

### keyValue

• **keyValue**: `Object` = `{}`

Key/Value Data.

#### Index signature

▪ [key: `string`]: `string` \| `Uint8Array`

#### Defined in

[container.ts:74](https://github.com/donmccurdy/KTX-Parse/blob/9988acf/src/container.ts#L74)

___

### layerCount

• **layerCount**: `number` = `0`

Number of array elements (array textures only).

#### Defined in

[container.ts:41](https://github.com/donmccurdy/KTX-Parse/blob/9988acf/src/container.ts#L41)

___

### levels

• **levels**: [`KTX2Level`](../interfaces/KTX2Level.md)[] = `[]`

Mip levels, ordered largest (original) to smallest (~1px).

#### Defined in

[container.ts:54](https://github.com/donmccurdy/KTX-Parse/blob/9988acf/src/container.ts#L54)

___

### pixelDepth

• **pixelDepth**: `number` = `0`

Depth of the texture image for level 0, in pixels (3D textures only).

#### Defined in

[container.ts:38](https://github.com/donmccurdy/KTX-Parse/blob/9988acf/src/container.ts#L38)

___

### pixelHeight

• **pixelHeight**: `number` = `0`

Height of the texture image for level 0, in pixels.

#### Defined in

[container.ts:35](https://github.com/donmccurdy/KTX-Parse/blob/9988acf/src/container.ts#L35)

___

### pixelWidth

• **pixelWidth**: `number` = `0`

Width of the texture image for level 0, in pixels.

#### Defined in

[container.ts:32](https://github.com/donmccurdy/KTX-Parse/blob/9988acf/src/container.ts#L32)

___

### supercompressionScheme

• **supercompressionScheme**: `number` = `KHR_SUPERCOMPRESSION_NONE`

Indicates which supercompression scheme has been applied to mip level images, if any.

#### Defined in

[container.ts:51](https://github.com/donmccurdy/KTX-Parse/blob/9988acf/src/container.ts#L51)

___

### typeSize

• **typeSize**: `number` = `1`

Size of the data type in bytes used to upload the data to a graphics API. When `vkFormat` is
VK_FORMAT_UNDEFINED, `typeSize` must be 1.

#### Defined in

[container.ts:29](https://github.com/donmccurdy/KTX-Parse/blob/9988acf/src/container.ts#L29)

___

### vkFormat

• **vkFormat**: `number` = `VK_FORMAT_UNDEFINED`

Specifies the image format using Vulkan VkFormat enum values. When using Basis Universal
texture formats, `vkFormat` must be VK_FORMAT_UNDEFINED.

#### Defined in

[container.ts:23](https://github.com/donmccurdy/KTX-Parse/blob/9988acf/src/container.ts#L23)
