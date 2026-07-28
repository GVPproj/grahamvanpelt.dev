---
title: "Deploying a containerized PocketBase instance to Fly.io"
description: "Putting PocketBase in a Docker container and shipping it to Fly.io: the Dockerfile, the package scripts, a persistent volume so the data survives a redeploy, and a GitHub Actions workflow to deploy on push."
created: 2024-11-02T13:14:40.868Z
---

## Requirements

I'd like to deploy a database for content and other data for this blog and various small projects. PocketBase is an ideal solution, being lightweight, quick to set up, and featuring an intuitive GUI that non-technical collaborators can comfortably use to contribute and update data.

## Hosting

I'll deploy to **fly.io**, though the steps to containerize will make this a viable process for other VPS setups in the future.

### 1. Initialize directory

First:

```
pnpm init
```

...in the directory of your choosing. Then make the necessary files and folders for PocketBase and Docker:

```
mkdir pb_migrations pb_hooks pb_data
```

```
touch Dockerfile pb_migrations/.gitkeep pb_hooks/.gitkeep pb_data/.gitignore
```

In `pb_data/.gitignore` we can tell git to ignore all the local data besides the .gitignore itself, so our folder is available but we don't version control the data:

```
*
!.gitignore
```

### 2. Set up the Dockerfile

Create our Dockerfile. These are essentially instructions to be followed by Docker as it builds the image:

```
FROM alpine:latest
# a small linux distro that will run in this container

ARG PB_VERSION=0.22.22
# check the latest version at the pocketbase website

RUN apk add --no-cache \
    # add the following packages without caching the package index (to reduce size)
    unzip \
    # add support for extracting zip archives
    ca-certificates \
    # Installs trusted certificates, enabling SSL/TLS verification for HTTPS connections
    openssh
    # Installs the OpenSSH client and server, allowing secure remote access if we want to download our data

ADD https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip /tmp/pb.zip
# download and unzip PocketBase based on the PB_VERSION

RUN unzip /tmp/pb.zip -d /pb/
# unzip it to the /pb directory

COPY ./pb_migrations /pb/pb_migrations
# copy the local pb_migrations dir into the container

COPY ./pb_hooks /pb/pb_hooks
# copy the local pb_hooks dir into the container

EXPOSE 8090
# expose 8090 for HTTP, usually this is 8080 but pocketbase examples use 8090

CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8090"]
# start PocketBase
```

### 3. Create the package scripts

Our `dev` script with run `docker:start` if the container isn't built yet, or fallback to `docker:run` if it's already there.

`docker run` creates and starts a new container from a Docker image.

`--name pb-starter` specifies the name of the container. In this case, it's named "pb-starter".

`*-d` runs the container in detached mode (background). The container will continue running even after the terminal session ends.

`-p 8090:8090` maps a container port to a host port.

- `8090` (left): The host port (your machine's port).
- `8090` (right): The container port (the port exposed by the container).

All the `-v` flags in `docker:run` are creating volumes for the directories in our PocketBase project.

```json
{
  "name": "pb-starter",
  "private": true,
  "version": "0.0.1",
  "description": "Demo repo for deploying Pocketbase to Fly!",
  "scripts": {
    "dev": "pnpm docker:start || pnpm docker:run",
    "docker:build": "docker build -t pb-starter .",
    "docker:run": "docker run --name pb-starter -d -p 8090:8090 -v ./pb_data:/pb/pb_data -v ./pb_migrations:/pb/pb_migrations -v ./pb_hooks:/pb/pb_hooks pb-starter",
    "docker:start": "docker start pb-starter",
    "docker:stop": "docker stop pb-starter",
    "docker:rm": "docker rm pb-starter"
  }
}
```

We can run:

```
pnpm docker:build
```

Then:

```
pnpm dev
```

Access the PocketBase UI locally at `localhost:8090/_`!

We can log in and update the database to our liking. Migrations will be created and visible in our `/pb_migrations` folder which we can version control in our repo. The data we create in `/pb_data` will only exist locally.

### 4. Deployment - Fly.io CLI & login

We can deploy wherever Docker containers are supported. For **fly.io** we can follow these steps:

```
curl -L https://fly.io/install.sh | sh
```

This installs the fly CLI.

```
fly auth login
```

This will authenticate our account through the browser.

### 5. Deployment - Configure project on Fly.io

```
fly launch --build-only
```

This will allow us to set some preferences like location (PocketBase only scales vertically in a single location), and choose CPU and RAM amounts (1 CPU w 512mb will work for us to start). It will then attempt to build the container and should succeed.

### 6. Deployment - persisting data and getting online

```
fly volumes create pb_data --size=1
```

This creates a 1gb `pb_data` volume for our data. Adjust the `http_sevice.concurrency` and `[mounts]` portions of out `fly.toml` file.

```toml
# fly.toml app configuration file generated for YOUR_APP on 2024-10-24T13:31:47-07:00
#
# See https://fly.io/docs/reference/configuration/ for information about how to use this file.
#

app = YOUR_APP
primary_region = REGION_CLOSE_TO_YOUR_USERS

[build]

[http_service]
  internal_port = 8090
  force_https = true
  auto_stop_machines = 'stop'
  auto_start_machines = true
  min_machines_running = 0
  processes = ['app']
  # help fly proxy reuse connections for requests
  [http_service.concurrency]
    type = "requests"
    soft_limit = 500
    hard_limit = 550

[[vm]]
  memory = '512mb'
  cpu_kind = 'shared'
  cpus = 1

# Add this:

[mounts]
  destination = "/pb/pb_data"
  source = "pb_data"
```

Finally...

```
fly deploy
```

And we're up and running .

### 7. CI/CD with Github Actions

```
mkdir .github .github/workflows
```

```
touch .github/workflows/deploy-pocketbase.yaml
```

Let's add a github action to deploy when we push changes to the repo. We need to add out `FLY_API_TOKEN` to our actions repository secrets. We can generate the token:

```
fly tokens deploy
```

```yaml
name: Deploy PocketBase to Fly
on:
  push:
    branches: [main]
jobs:
  deploy:
    name: Deploy proxy
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --remote-only
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

Now, any migrations we generate by updating tables in PocketBase can be deployed when we push the main branch.

## Helpful Sources

This workflow is credit to Johnny Magrippis, check out his tutorial here:
[Your own CMS + Backend in 15': How to deploy PocketBase to Fly.io 🚀 DevEx, version control, CI/CD! - YouTube](https://youtu.be/lnDiooLuhmc?si=JxetacKDJ9iL8VVf)
