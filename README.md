# kratos-admin-ui

A simple Admin-Interface for [ory/kratos](https://www.ory.sh/kratos/docs/). Made with React und Microsoft Fluent-UI.

## Run

On every commit on the main branch a new docker image is getting created on ghcr.io: ghcr.io/dfoxg/kratos-admin-ui.
To run the image, you have to provide two environemnt variables:
- `KRATOS_ADMIN_URL`: the admin url of your kratos instance
- `KRATOS_PUBLIC_URL`: the public url of your kratos instance

```
docker run -it \
--rm -p 3000:80 \
-e KRATOS_ADMIN_URL=http://localhost:4435 \
-e KRATOS_PUBLIC_URL=http://localhost:4430 \
ghcr.io/dfoxg/kratos-admin-ui
```


## Start local

It is required, that a local instance of ory kratos is running. the latest tested version is `v0.10.1`.

```
cd kratos-admin-ui
npm install
node cors-proxy.js // starts a cors-proxy for the admin-api, so the browser can make requests
npm run start
```

## Build Docker-Image

```
cd kratos-admin-ui
docker build -t kratos-admin-ui .
docker run -it --rm -p 3000:80 -e KRATOS_ADMIN_URL=http://localhost:4435 -e KRATOS_PUBLIC_URL=http://localhost:4430 kratos-admin-ui
```

## Images

Following a few sample images:

### List Identites

![listIdentities](./images/listIdentites.PNG)

### Single Select Identity

![singleSelectIdentity](./images/selectIdentites.PNG)

### Multiselect Identities

![multiselectIdentities](./images/multiselectIdentites.PNG)

### Create Identity

![createIdentity](./images/createIdentity.PNG)

### Edit Identity

![editIdentity](./images/editIdentity.PNG)

### View Identity

![viewIdentity](./images/viewSingleIdentity.PNG)
