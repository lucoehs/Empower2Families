{ pkgs ? # If pkgs is not defined, use nixpkgs from locked commit
  let
    lock = (builtins.fromJSON (builtins.readFile ./flake.lock)).nodes.nixpkgs.locked;
    nixpkgs = fetchTarball {
      url = "https://github.com/nixos/nixpkgs/archive/${lock.rev}.tar.gz";
      sha256 = lock.narHash;
    };
  in
  import nixpkgs {
    config.allowUnfree = true; # Required by Android SDK
    config.android_sdk.accept_license = true;
  }
, ...
}:
let
  androidComposition = pkgs.androidenv.composeAndroidPackages {
    platformVersions = [ "34" ];
    cmakeVersions = [ "3.22.1" ];
    includeNDK = true;
    buildToolsVersions = [ "34.0.0" ];
    ndkVersions = ["26.1.10909125" "25.1.8937393"];
    systemImageTypes = [ "google_apis_playstore" ];

    includeEmulator = true;
    includeSystemImages = true;
    emulatorVersion = "35.1.4";

    #abiVersions = [ "armeabi-v7a" "arm64-v8a" ];
    includeSources = false;
    useGoogleAPIs = false;
    useGoogleTVAddOns = false;
    includeExtras = [
      "extras;google;gcm"
    ];
  };
in {
  default = pkgs.mkShell {
    packages = with pkgs; [ yarn nodejs_20 temurin-bin-17 androidComposition.androidsdk eslint ];
    ANDROID_HOME = "${androidComposition.androidsdk}/libexec/android-sdk";
  };
}
