use std::str::FromStr;

use anchor_lang::prelude::*;

//mod increase_liquidity_v2;

/// The Raydium *Concentrated Liquidity (CLMM)*, from:
/// https://docs.raydium.io/raydium/protocol/developers/addresses
///
/// Available methods:
/// * https://solscan.io/account/CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK#anchorProgramIdl
///     * We use the `increaseLiquidityV2` and `decreaseLiquidityV2` methods.
pub static RAYDIUM_PROGRAM_ID: &str = "CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK";

declare_id!("DjQNrS7m8ZBKnPuGU76kRnUzer2wz96kjMsj9fUbEVqX");

#[derive(AnchorSerialize, AnchorDeserialize)]
pub enum RaydiumInstruction {
    IncreaseLiquidityV2 {
        liquidity: u128,
        amount_0_max: u64,
        amount_1_max: u64,
        base_flag: Option<bool>,
    },
    DecreaseLiquidityV2 {
        liquidity: u128,
        amount_0_min: u64,
        amount_1_min: u64,
    },
}

#[program]
pub mod raydium_example {
    use anchor_lang::solana_program::{instruction::Instruction, program::invoke};

    use super::*;

    pub fn main_business_logic(
        ctx: Context<ManageLiquidity>,
        liquidity: u128,
        amount_0_max: u64,
        amount_1_max: u64,
        base_flag: Option<bool>,
    ) -> Result<()> {
        let raydium_program = ctx.accounts.raydium_program.to_account_info();

        // Prepare transaction to increase Raydium liquidity.
        let tx = RaydiumInstruction::IncreaseLiquidityV2 {
            liquidity,
            amount_0_max,
            amount_1_max,
            base_flag,
        };

        let accounts = ctx.accounts.get_increase_liquidity_accounts();

        let data = tx.try_to_vec()?;

        let instruction = Instruction {
            program_id: *raydium_program.key,
            accounts: accounts
                .iter()
                .map(|a| AccountMeta {
                    pubkey: *a.key,
                    is_signer: a.is_signer,
                    is_writable: a.is_writable,
                })
                .collect(),
            data,
        };

        // Call the Raydium `increaseLiquidityV2` method.
        invoke(&instruction, &accounts)?;

        // ### MAIN SMART CONTRACT LOGIC
        //
        //
        //
        // ... imagine some important work and logic here...
        //
        //
        //
        // ###

        // Prepare transaction to decrease Raydium liquidity.
        let tx = RaydiumInstruction::DecreaseLiquidityV2 {
            liquidity,
            amount_0_min: 0,
            amount_1_min: 0,
        };

        let accounts = ctx.accounts.get_decrease_liquidity_accounts();

        let data = tx.try_to_vec()?;

        let instruction = Instruction {
            program_id: *raydium_program.key,
            accounts: accounts
                .iter()
                .map(|a| AccountMeta {
                    pubkey: *a.key,
                    is_signer: a.is_signer,
                    is_writable: a.is_writable,
                })
                .collect(),
            data,
        };

        // Call the Raydium `decreaseLiquidityV2` method.
        invoke(&instruction, &accounts).map_err(Into::into)
    }
}

#[derive(Accounts)]
// TODO: Safety checks for the accounts, or build with:
// * `anchor build --skip-lint`, or
// * `anchor test --skip-lint`
pub struct ManageLiquidity<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(address = Pubkey::from_str(RAYDIUM_PROGRAM_ID).unwrap())]
    pub raydium_program: AccountInfo<'info>,
    pub nft_account: AccountInfo<'info>,
    #[account(mut)]
    pub pool_state: AccountInfo<'info>,
    #[account(mut)]
    pub protocol_position: AccountInfo<'info>,
    #[account(mut)]
    pub personal_position: AccountInfo<'info>,
    #[account(mut)]
    pub token_account_0: AccountInfo<'info>,
    #[account(mut)]
    pub token_account_1: AccountInfo<'info>,
    #[account(mut)]
    pub token_vault_0: AccountInfo<'info>,
    #[account(mut)]
    pub token_vault_1: AccountInfo<'info>,
    #[account(mut)]
    pub tick_array_lower: AccountInfo<'info>,
    #[account(mut)]
    pub tick_array_upper: AccountInfo<'info>,
    pub token_program: AccountInfo<'info>,
    pub token_program_2022: AccountInfo<'info>,
    pub vault_0_mint: AccountInfo<'info>,
    pub vault_1_mint: AccountInfo<'info>,
    pub memo_program: AccountInfo<'info>,
}

impl<'info> ManageLiquidity<'info> {
    pub fn get_increase_liquidity_accounts(&self) -> Vec<AccountInfo<'info>> {
        vec![
            self.user.to_account_info(),
            self.nft_account.to_account_info(),
            self.pool_state.to_account_info(),
            self.protocol_position.to_account_info(),
            self.personal_position.to_account_info(),
            self.tick_array_lower.to_account_info(),
            self.tick_array_upper.to_account_info(),
            self.token_account_0.to_account_info(),
            self.token_account_1.to_account_info(),
            self.token_vault_0.to_account_info(),
            self.token_vault_1.to_account_info(),
            self.token_program.to_account_info(),
            self.token_program_2022.to_account_info(),
            self.vault_0_mint.to_account_info(),
            self.vault_1_mint.to_account_info(),
        ]
    }

    pub fn get_decrease_liquidity_accounts(&self) -> Vec<AccountInfo<'info>> {
        vec![
            self.user.to_account_info(),
            self.nft_account.to_account_info(),
            self.personal_position.to_account_info(),
            self.pool_state.to_account_info(),
            self.protocol_position.to_account_info(),
            self.token_vault_0.to_account_info(),
            self.token_vault_1.to_account_info(),
            self.tick_array_lower.to_account_info(),
            self.tick_array_upper.to_account_info(),
            // "recipientTokenAccount0"
            self.token_account_0.to_account_info(),
            // "recipientTokenAccount1"
            self.token_account_1.to_account_info(),
            self.token_program.to_account_info(),
            self.token_program_2022.to_account_info(),
            self.memo_program.to_account_info(),
            self.vault_0_mint.to_account_info(),
            self.vault_1_mint.to_account_info(),
        ]
    }
}
