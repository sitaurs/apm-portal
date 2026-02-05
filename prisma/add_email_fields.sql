-- Add email field to team_members
ALTER TABLE apm_prestasi_team_members ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Add nip and email fields to pembimbing
ALTER TABLE apm_prestasi_pembimbing ADD COLUMN IF NOT EXISTS nip VARCHAR(100);
ALTER TABLE apm_prestasi_pembimbing ADD COLUMN IF NOT EXISTS email VARCHAR(255);
