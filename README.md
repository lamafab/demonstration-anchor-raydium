# Demonstration: Anchor Project with Raydium

A Solana smart contract developed in Rust using the Anchor framework to interact with Raydium's Concentrated Liquidity (CLMM) protocol. This contract provides a simple demonstration on how to manage liquidity positions through Raydium's `increaseLiquidityV2` and `decreaseLiquidityV2` methods.

## Features

- Cross-Program Invocation (CPI) integration with Raydium's CLMM contract.
- Increase liquidity positions using `increaseLiquidityV2`.
- Decrease liquidity positions using `decreaseLiquidityV2`.

## Development Setup

Note: A local `.devcontainer/` is provided which can be opened in vscode.

Software requirements:

```bash
# Installing the Solana CLI
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
echo 'export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"' >> "$HOME/.bashrc"
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

# (For testing) Add Raydium SDK for initial setup.
yarn add @raydium-io/raydium-sdk-v2
```

To build, run:

```bash
# Ignore missing safety checks, for now.
$ anchor build --skip-lint
```

## Implementation Details

The contract interacts with Raydium's Concentrated Liquidity (CLMM) smart contract instead of the originally requested `AddLiquidity` and `RemoveLiquidity` methods, which are not available:

- CLMM Contract Address: `CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK`.
- Reference: [Contract IDL](https://solscan.io/account/CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK#anchorProgramIdl).
- [Raydium Protocol Addresses](https://docs.raydium.io/raydium/protocol/developers/addresses).

### Technical Decisions

1. Direct CPI Implementation.
   - Implemented direct Cross-Program Invocations instead of using the `raydium-clmm` crate.
   - The `raydium-clmm` crate relies on outdated versions of Rust, Solana, and Anchor.
      - Reference: [Dependency issue](https://github.com/raydium-io/raydium-clmm/issues/93).
      - Reference: [Related issue](https://github.com/raydium-io/raydium-clmm/issues/91).

2. Known Issue in Anchor.
   - **Current Workaround**: Manually change `version = 4` to `version = 3` in `Cargo.lock` for new Anchor projects.
   - Reference: [Lockfile issue](https://github.com/coral-xyz/anchor/issues/3392).
   - Note: `Cargo.lock` is tracked in this repository.

## Testing Status

The test suite is currently **non-functional** and will remain incomplete. While basic test structures are in place, full integration testing with the Raydium (SDK) protocol is complicated and setting up and studying the required accounts states takes more time. The implementation focuses on demonstrating the core contract structure and development approach.
