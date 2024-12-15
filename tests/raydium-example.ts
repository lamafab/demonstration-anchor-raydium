import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { RaydiumExample } from "../target/types/raydium_example";
import { PublicKey, Keypair, Connection } from "@solana/web3.js";
import { ApiV3PoolInfoConcentratedItem, CLMM_PROGRAM_ID, ClmmKeys, farmAddRewardLayout, getPdaPersonalPositionAddress, getPdaProtocolPositionAddress, getPdaTickArrayAddress, PositionInfoLayout, Raydium, TickUtils } from '@raydium-io/raydium-sdk-v2'

describe("raydium-example", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider);

  const program = anchor.workspace.RaydiumExample as Program<RaydiumExample>;
  const connection = new Connection("http://localhost:8899", "confirmed");
  const owner = Keypair.fromSecretKey(Uint8Array.from(""));

  let raydium: Raydium;
  let poolState: PublicKey;
  let position: any;  // Will contain position info
  let poolInfo: ApiV3PoolInfoConcentratedItem;
  let poolKeys: ClmmKeys;

    before(async () => {
    // Initialize Raydium
    raydium = await Raydium.load({
      owner,
      connection,
    });

    // SOL-USDC pool
    const poolIdStr = 'Enfoa5Xdtirwa46xxa5LUVcQWe7EUb2pGzTjfvU7EBS1';
    const data = await raydium.clmm.getPoolInfoFromRpc(poolIdStr);
    poolInfo = data.poolInfo;
    poolKeys = data.poolKeys;

    const programId = new PublicKey(poolInfo.programId);
    const poolId = new PublicKey(poolInfo.id);

    const ownerPosition = (await raydium.clmm.getOwnerPositionInfo({ programId: programId})).find((pos) => pos.poolId === poolId);

    const protocolPosition = getPdaProtocolPositionAddress(programId, poolId, -100, 100).publicKey;
    const personalPosition = getPdaPersonalPositionAddress(programId, poolId).publicKey;

    const tickArrayLowerStartIndex = TickUtils.getTickArrayStartIndexByTick(ownerPosition.tickLower, poolInfo.config.tickSpacing);
    const tickArrayUpperStartIndex = TickUtils.getTickArrayStartIndexByTick(ownerPosition.tickUpper, poolInfo.config.tickSpacing);

    const tickArrayLower = getPdaTickArrayAddress(programId, poolId, tickArrayLowerStartIndex);
    const tickArrayUpper = getPdaTickArrayAddress(programId, poolId, tickArrayUpperStartIndex);

    const x = await raydium.clmm.getOwnerPositionInfo({ programId: owner.publicKey })

    // Create or get pool
    const { poolStatePubkey } = await raydium.clmm.createPool({
      tokenMint0: /* token0 mint */,
      tokenMint1: /* token1 mint */,
      ammConfig: /* amm config */,
      startPrice: /* start price */
    });

    poolState = poolStatePubkey;

    position = await raydium.clmm.

    // Create position
    position = await raydium.clmm.openPositionFromBase({
      pool: poolState,
      tickLower: -100,  // Example tick range
      tickUpper: 100,
      liquidity: "1000000",
      withMetadata: true,
    });
  });

  it("Is initialized!", async () => {
    const raydium = await Raydium.load({
      connection,
      owner, // key pair or publicKey, if you run a node process, provide keyPair
      signAllTransactions: async (txs) => {
        return txs.map(tx => {
          tx.partialSign(owner);
          return tx;
        });
      },
      tokenAccounts: undefined,
      tokenAccountRowInfos: undefined,
      disableLoadToken: false // default is false, if you don't need token info, set to true
    })

    const liquidity = new anchor.BN("1000000");
    const amount0Max = new anchor.BN("500000");
    const amount1Max = new anchor.BN("500000");
    const baseFlag = true;

    let x = await connection.getTokenAccountsByOwner(owner.publicKey, { programId: owner.publicKey });

    // Add your test here.
    const tx = await program.methods
      .mainBusinessLogic(
        liquidity,
        amount0Max,
        amount1Max,
        baseFlag
      )
      .accounts({
        user: provider.wallet.publicKey,
        nftAccount: /* NFT account pubkey */,
        poolState: /* pool state pubkey */,
        protocolPosition: /* protocol position pubkey */,
        personalPosition: /* personal position pubkey */,
        tickArrayLower: /* tick array lower pubkey */,
        tickArrayUpper: /* tick array upper pubkey */,
        tokenAccount0: /* user's token0 account */,
        tokenAccount1: /* user's token1 account */,
        tokenVault0: new PublicKey(poolKeys.vault.A),
        tokenVault1: new PublicKey(poolKeys.vault.A),
        tokenProgram: /* token program ID */,
        tokenProgram2022: /* token 2022 program ID */,
        vault0Mint: new PublicKey(poolInfo.mintA.address),
        vault1Mint: new PublicKey(poolInfo.mintB.address/* token1 mint */,
        memoProgram: /* memo program ID */,
      })
      .rpc();

    console.log("Your transaction signature", tx);
  });
});
