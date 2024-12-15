use anchor_lang::prelude::*;

//mod increase_liquidity_v2;

pub static RAYDIUM_PROGRAM_ID: &str = "CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK";

declare_id!("DjQNrS7m8ZBKnPuGU76kRnUzer2wz96kjMsj9fUbEVqX");

#[derive(AnchorSerialize, AnchorDeserialize)]
pub enum RaydiumInstruction {
    AddLiquidity {
        amount_a: u64,
        amount_b: u64,
        amount_a_min: u64,
        amount_b_min: u64,
    },
    RemoveLiquidity {
        amount: u64,
        amount_a_min: u64,
        amount_b_min: u64,
    },
}

#[program]
pub mod raydium_example {
    use anchor_lang::solana_program::{instruction::Instruction, program::invoke};

    use super::*;

    pub fn provide_liquidity(
        ctx: Context<Initialize>,
        amount_a: u64,
        amount_b: u64,
        amount_a_min: u64,
        amount_b_min: u64,
    ) -> Result<()> {
        let raydium_program = ctx.accounts.raydium_program.to_account_info();

        let accounts = vec![
            ctx.accounts.pool.to_account_info(),
            ctx.accounts.token_a.to_account_info(),
            ctx.accounts.token_b.to_account_info(),
        ];

        let ix = RaydiumInstruction::AddLiquidity {
            amount_a,
            amount_b,
            amount_a_min,
            amount_b_min,
        };

        let data = ix.try_to_vec()?;

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

        invoke(&instruction, &accounts).map_err(Into::into)
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    pub raydium_program: Program<'info, System>,
    /// CHECK: TODO
    pub pool: AccountInfo<'info>,
    /// CHECK: TODO
    pub token_a: AccountInfo<'info>,
    /// CHECK: TODO
    pub token_b: AccountInfo<'info>,
}
