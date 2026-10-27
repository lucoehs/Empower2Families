{
  description = "Development tools";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
  };

  outputs = { self, nixpkgs }:
    let
      systems = [ "x86_64-linux" ];
      pkgsFor = s: import nixpkgs {
        system = s;
        config.allowUnfree = true; # Required by Android SDK
        config.android_sdk.accept_license = true;
      };
      forEachSystem = f: nixpkgs.lib.genAttrs systems (sys: f (pkgsFor sys));
    in
    {
      # Allow formatting through `nix fmt`.
      formatter = forEachSystem (pkgs: pkgs.nixpkgs-fmt);

      # Shell environments . Source the shell from a separate file so
      # both `nix develop` and `nix-shell` work.
      devShells = forEachSystem (pkgs: import ./shell.nix { inherit pkgs; });
    };
}
