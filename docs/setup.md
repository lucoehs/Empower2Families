# Setup

You will need the following packages on your system

- Node.js
- Yarn
- (optional) eas-cli installed from npm or yarn
- Android SDK if you are developing for Android

From the project root folder run the following.

> **Note:** the usage of yarn is important as eas currently produces bad APKs when using normal npm for some unknown
> reason.

- `yarn install`
- `npx expo prebuild`
- `npx expo run`

## Development with Nix

A `flake.nix` and `shell.nix` are provided in the project to install all the necessary packages for Android development
and a development shell can be accessed either using the `nix develop` or `nix-shell` commands. Note this does **not**
include packages that would be installed from Yarn so you still need to run `yarn install`.
