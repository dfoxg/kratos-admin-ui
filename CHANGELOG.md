# Changelog of kratos-admin-ui

## 2.xx

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