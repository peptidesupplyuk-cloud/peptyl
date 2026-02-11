
-- Drop FK constraints on vote tables to allow seed community data
ALTER TABLE stack_votes DROP CONSTRAINT IF EXISTS stack_votes_user_id_fkey;
ALTER TABLE benefit_votes DROP CONSTRAINT IF EXISTS benefit_votes_user_id_fkey;
ALTER TABLE side_effect_votes DROP CONSTRAINT IF EXISTS side_effect_votes_user_id_fkey;
