#!/bin/bash
set -e

# Installing the Solana CLI
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
solana --version

# Installing using Anchor version manager (avm)
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm --version
avm install latest
avm use latest
anchor --version

# Setup local environment
solana config set --url localhost
solana-keygen new --no-bip39-passphrase
