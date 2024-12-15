import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { RaydiumExample } from "../target/types/raydium_example";
import { PublicKey, Keypair, Connection } from "@solana/web3.js";
import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { ApiV3PoolInfoConcentratedItem, CLMM_PROGRAM_ID, ClmmKeys, farmAddRewardLayout, getATAAddress, getPdaPersonalPositionAddress, getPdaPoolVaultId, getPdaProtocolPositionAddress, getPdaTickArrayAddress, PositionInfoLayout, Raydium, TickUtils } from '@raydium-io/raydium-sdk-v2'

describe("raydium-example", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider);

  const program = anchor.workspace.RaydiumExample as Program<RaydiumExample>;
  const connection = new Connection("http://localhost:8899", "confirmed");
  // TODO: Seed
  const owner = Keypair.fromSecretKey(Uint8Array.from(""));

  let raydium: Raydium;
  let poolState: PublicKey;
  let position: any;  // Will contain position info
  let poolInfo: ApiV3PoolInfoConcentratedItem;
  let poolKeys: ClmmKeys;
  let protocolPosition: PublicKey;
  let personalPosition: PublicKey;
  let tickArrayLower: PublicKey;
  let tickArrayUpper: PublicKey;
  let tokenVault0: PublicKey;
  let tokenVault1: PublicKey;
  let vault0Mint: PublicKey;
  let vault1Mint: PublicKey;
  let tokenProgram: PublicKey;
  let tokenProgram2022: PublicKey;

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

    // Prepare protocol and owner position.
    const ownerPosition = (await raydium.clmm.getOwnerPositionInfo({ programId: programId })).find((pos) => pos.poolId === poolId);
    protocolPosition = getPdaProtocolPositionAddress(programId, poolId, -100, 100).publicKey;
    personalPosition = getPdaPersonalPositionAddress(programId, poolId).publicKey;

    // Prepare token accounts.
    // TODO: This should probably be moved to the actual unit test(?)
    const _tokenAccountA = await raydium.account.getOrCreateTokenAccount({
      tokenProgram: poolInfo.mintA.programId,
      mint: new PublicKey(poolInfo.mintA.address),
      notUseTokenAccount: true,
      owner: raydium.ownerPubKey,
      createInfo: {
        payer: raydium.ownerPubKey,
        // TODO:
        amount: new anchor.BN(0),
      },
      skipCloseAccount: false,
      associatedOnly: false,
      checkCreateATAOwner: false,
    });

    const _tokenAccountB = await raydium.account.getOrCreateTokenAccount({
      tokenProgram: poolInfo.mintB.programId,
      mint: new PublicKey(poolInfo.mintB.address),
      notUseTokenAccount: true,
      owner: raydium.ownerPubKey,
      createInfo: {
        payer: raydium.ownerPubKey,
        // TODO:
        amount: new anchor.BN(0),
      },
      skipCloseAccount: false,
      associatedOnly: false,
      checkCreateATAOwner: false,
    });

    // Finalize remaining accounts.
    const tickArrayLowerStartIndex = TickUtils.getTickArrayStartIndexByTick(ownerPosition.tickLower, poolInfo.config.tickSpacing);
    const tickArrayUpperStartIndex = TickUtils.getTickArrayStartIndexByTick(ownerPosition.tickUpper, poolInfo.config.tickSpacing);
    tickArrayLower = getPdaTickArrayAddress(programId, poolId, tickArrayLowerStartIndex).publicKey;
    tickArrayUpper = getPdaTickArrayAddress(programId, poolId, tickArrayUpperStartIndex).publicKey;

    tokenVault0 = new PublicKey(poolKeys.vault.A);
    tokenVault1 = new PublicKey(poolKeys.vault.A);
    vault0Mint = new PublicKey(poolInfo.mintA.address);
    vault1Mint = new PublicKey(poolInfo.mintB.address);

    const accountInfo = (await raydium.connection.getAccountInfo(ownerPosition.nftMint));
    tokenProgram = getATAAddress(raydium.ownerPubKey, ownerPosition.nftMint, TOKEN_PROGRAM_ID).publicKey;
    tokenProgram2022 = getATAAddress(raydium.ownerPubKey, ownerPosition.nftMint, TOKEN_2022_PROGRAM_ID).publicKey;
  });

  it("run main business logic", async () => {
    const liquidity = new anchor.BN("1000000");
    const amount0Max = new anchor.BN("500000");
    const amount1Max = new anchor.BN("500000");
    const baseFlag = true;

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
        protocolPosition,
        personalPosition,
        tickArrayLower,
        tickArrayUpper,
        tokenAccount0: /* user's token0 account */,
        tokenAccount1: /* user's token1 account */,
        tokenVault0,
        tokenVault1,
        tokenProgram,
        tokenProgram2022,
        vault0Mint,
        vault1Mint,
        memoProgram: /* memo program ID */,
      })
      .rpc();

    console.log("Transaction signature", tx);
  });
});
