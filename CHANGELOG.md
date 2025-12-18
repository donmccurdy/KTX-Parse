# Changelog

## v2.0

- BREAKING CHANGE: Package is now ESM-only (#215)
- chore: Updated build tool to [`tsdown`](https://tsdown.dev/) (#215)

## v1.1

- feat: Support `levelCount = 0`, runtime-generated mipmaps (#199)

## v1.0

- refactor: KTX2Container now a plain object (#174)
- fix: Sort key/value data (#175)
- chore: Improvements in build process and testing

## v0.4

- Removed UMD builds

## v0.3

- Improved support for uncompressed formats and fixed various bugs
- Renamed `channelID` to `channelType`
- Added and reorganized exported constants and enums
- Changed type of `texelBlockDimension` to array
	- Values now match KTX2 specification, with dimensionality `d` represented as `d - 1`

## v0.2

## v0.1
