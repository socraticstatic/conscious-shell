/*
  # Drop the AI-assisted songs

  Five pieces in the vault are songs (chorus/verse/bridge structure, released
  as tracks on music platforms) written with AI help. Per Micah, these are not
  part of the poetry corpus. Remove them. Idempotent.

  Corpus after this: 32 poems.
*/

delete from public.poems
where slug in (
  'bring-back-the-family-pride',
  'come-as-you-are',
  'you-ve-been-waiting',
  'in-your-arms',
  'they-say'
);
