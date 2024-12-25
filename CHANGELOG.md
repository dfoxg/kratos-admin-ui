# Changelog of kratos-admin-ui

## [2.6.1](https://github.com/meysam81/kratos-admin-ui/compare/v2.6.0...v2.6.1) (2024-12-25)


### Bug Fixes

* work as single page application ([7af1ae9](https://github.com/meysam81/kratos-admin-ui/commit/7af1ae9033c1aff23f9f26b340eefb36cf0c0b73))

## [2.6.0](https://github.com/meysam81/kratos-admin-ui/compare/v2.5.0...v2.6.0) (2024-12-24)


### Miscellaneous Chores

* modify release version ([bde25da](https://github.com/meysam81/kratos-admin-ui/commit/bde25da1fd013daa439f0d6c7f497f495a45d668))
* prepare for the first release ([583d5cd](https://github.com/meysam81/kratos-admin-ui/commit/583d5cd01c7fc2b9ab00af75a6f7411d92aa94d6))

## 2.xx

### 2.5.0
- Support for Ory Kratos v1.3.1
- Dark-mode
- use node 22 for build
- change typescript target from `es5` to `es2023`

### 2.4.0
- Add Search Box for Identity Filtering by @dhia-gharsallaoui in https://github.com/dfoxg/kratos-admin-ui/pull/193
- Add Prettier

### 2.3.2
- Support for boolean traits

### 2.3.1
- Support for arm64

### 2.3.0
- Support for Ory Kratos v1.1.0

### 2.2.0
- Nginx runs as non-root now. The exposed port changed from port 80 to 8080! 

### 2.1.0
- Allow metadata editing by @toonalbers in https://github.com/dfoxg/kratos-admin-ui/pull/137

### 2.0.0
#### BREAKING CHANGE
- Configure nginx to act as a reverse proxy for the kratos endpoints
  - **You have to change your environment variables!**

## 1.xx

### 1.2.0
- Support array schemas. see [#90](https://github.com/dfoxg/kratos-admin-ui/issues/90)
- notification popups
- rewrite identites overview to new fluentui DataGrid

### 1.1.0
- Support for ory/kratos v1.0.0

### 1.0.5
- Update Node.js to v20
- Support for ory/kratos v0.13.0

### 1.0.4
- Support for ory/kratos v0.11.0
- Support for viewing, deletion and extend sessions
- Update React -> 18; Upgrade packes by @dfoxg in [#66](https://github.com/dfoxg/kratos-admin-ui/pull/66)

### 1.0.3
- fix for [#63](https://github.com/dfoxg/kratos-admin-ui/issues/63) and [#64](https://github.com/dfoxg/kratos-admin-ui/issues/64) by @dfoxg in [65](https://github.com/dfoxg/kratos-admin-ui/pull/65)

### 1.0.2
- switched from @fluentui/react to @fluentui/react-components

### 1.0.1
- check undefined object by @rungthiwasrisaart in [#62](https://github.com/dfoxg/kratos-admin-ui/pull/62)
- Updated dependencies

### 1.0.0
- First stable release of kratos-admin-ui
