-- App da vida (Fase 2): configuração do app guardada na tabela shared, em caminhos config/* (ex.: config/modulos)
-- Todos os logados já leem a tabela shared; aqui só o admin ganha permissão de gravar em config/*.
-- Rode primeiro no Supabase de TESTE (rcywzqbuobhmvbyemrmz). Pode rodar mais de uma vez.
drop policy if exists "shared: admin grava config" on public.shared;
drop policy if exists "shared: admin altera config" on public.shared;
create policy "shared: admin grava config" on public.shared for insert to authenticated
  with check (path like 'config/%' and public.sou_admin());
create policy "shared: admin altera config" on public.shared for update to authenticated
  using (path like 'config/%' and public.sou_admin()) with check (path like 'config/%' and public.sou_admin());
grant insert, update on public.shared to authenticated;
