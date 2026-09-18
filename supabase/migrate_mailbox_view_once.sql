-- Allow deleting secret letters after "view once"
drop policy if exists "letters_delete" on public.secret_letters;
create policy "letters_delete" on public.secret_letters for delete using (true);
grant delete on public.secret_letters to anon, authenticated;
