[**ktx-parse**](../README.md) • **Docs**

***

[ktx-parse](../globals.md) / KTX2Container

# Class: KTX2Container

Represents an unpacked KTX 2.0 texture container. Data for individual mip levels are stored in
the `.levels` array, typically compressed in Basis Universal formats. Additional properties
provide metadata required to process, transcode, and upload these textures.

## Constructors

### new KTX2Container()

> **new KTX2Container**(): [`KTX2Container`](KTX2Container.md)

#### Returns

[`KTX2Container`](KTX2Container.md)

## Properties

### dataFormatDescriptor

> **dataFormatDescriptor**: [`KTX2DataFormatDescriptorBasicFormat`](../interfaces/KTX2DataFormatDescriptorBasicFormat.md)[]

Data Format Descriptor.

#### Defined in

[container.ts:59](https://github.com/donmccurdy/KTX-Parse/blob/181955da6070d09378df06abb0240a902cac355e/src/container.ts#L59)

***

### faceCount

> **faceCount**: `number` = `1`

Number of cubemap faces. For cubemaps and cubemap arrays, `faceCount` must be 6. For all
other textures, `faceCount` must be 1. Cubemap faces are stored in +X, -X, +Y, -Y, +Z, -Z
order.

#### Defined in

[container.ts:50](https://github.com/donmccurdy/KTX-Parse/blob/181955da6070d09378df06abb0240a902cac355e/src/container.ts#L50)

***

### globalData

> **globalData**: `null` \| [`KTX2GlobalDataBasisLZ`](../interfaces/KTX2GlobalDataBasisLZ.md) = `null`

Supercompression Global Data.

#### Defined in

[container.ts:79](https://github.com/donmccurdy/KTX-Parse/blob/181955da6070d09378df06abb0240a902cac355e/src/container.ts#L79)

***

### keyValue

> **keyValue**: `object` = `{}`

Key/Value Data.

#### Index Signature

 \[`key`: `string`\]: `string` \| `Uint8Array`

#### Defined in

[container.ts:76](https://github.com/donmccurdy/KTX-Parse/blob/181955da6070d09378df06abb0240a902cac355e/src/container.ts#L76)

***

### layerCount

> **layerCount**: `number` = `0`

Number of array elements (array textures only).

#### Defined in

[container.ts:43](https://github.com/donmccurdy/KTX-Parse/blob/181955da6070d09378df06abb0240a902cac355e/src/container.ts#L43)

***

### levels

> **levels**: [`KTX2Level`](../interfaces/KTX2Level.md)[] = `[]`

Mip levels, ordered largest (original) to smallest (~1px).

#### Defined in

[container.ts:56](https://github.com/donmccurdy/KTX-Parse/blob/181955da6070d09378df06abb0240a902cac355e/src/container.ts#L56)

***

### pixelDepth

> **pixelDepth**: `number` = `0`

Depth of the texture image for level 0, in pixels (3D textures only).

#### Defined in

[container.ts:40](https://github.com/donmccurdy/KTX-Parse/blob/181955da6070d09378df06abb0240a902cac355e/src/container.ts#L40)

***

### pixelHeight

> **pixelHeight**: `number` = `0`

Height of the texture image for level 0, in pixels.

#### Defined in

[container.ts:37](https://github.com/donmccurdy/KTX-Parse/blob/181955da6070d09378df06abb0240a902cac355e/src/container.ts#L37)

***

### pixelWidth

> **pixelWidth**: `number` = `0`

Width of the texture image for level 0, in pixels.

#### Defined in

[container.ts:34](https://github.com/donmccurdy/KTX-Parse/blob/181955da6070d09378df06abb0240a902cac355e/src/container.ts#L34)

***

### supercompressionScheme

> **supercompressionScheme**: [`Supercompression`](../type-aliases/Supercompression.md) = `KHR_SUPERCOMPRESSION_NONE`

Indicates which supercompression scheme has been applied to mip level images, if any.

#### Defined in

[container.ts:53](https://github.com/donmccurdy/KTX-Parse/blob/181955da6070d09378df06abb0240a902cac355e/src/container.ts#L53)

***

### typeSize

> **typeSize**: `number` = `1`

Size of the data type in bytes used to upload the data to a graphics API. When `vkFormat` is
VK_FORMAT_UNDEFINED, `typeSize` must be 1.

#### Defined in

[container.ts:31](https://github.com/donmccurdy/KTX-Parse/blob/181955da6070d09378df06abb0240a902cac355e/src/container.ts#L31)

***

### vkFormat

> **vkFormat**: [`VKFormat`](../type-aliases/VKFormat.md) = `VK_FORMAT_UNDEFINED`

Specifies the image format using Vulkan VkFormat enum values. When using Basis Universal
texture formats, `vkFormat` must be VK_FORMAT_UNDEFINED.

#### Defined in

[container.ts:25](https://github.com/donmccurdy/KTX-Parse/blob/181955da6070d09378df06abb0240a902cac355e/src/container.ts#L25)
