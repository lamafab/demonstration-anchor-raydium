use anchor_lang::prelude::*;

declare_id!("DjQNrS7m8ZBKnPuGU76kRnUzer2wz96kjMsj9fUbEVqX");

#[program]
pub mod raydium_example {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
