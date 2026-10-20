
CREATE TYPE public.app_role AS ENUM ('admin','advogado','assistente','estagiario');

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- Organizations
CREATE TABLE public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 160),
  oab text, oab_uf text, address text, phone text, email text,
  plan text NOT NULL DEFAULT 'individual' CHECK (plan IN ('individual','escritorio','premium')),
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.organizations TO authenticated;
GRANT ALL ON public.organizations TO service_role;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, organization_id)
);
CREATE INDEX ON public.memberships(organization_id);
GRANT SELECT ON public.memberships TO authenticated;
GRANT ALL ON public.memberships TO service_role;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_member(_org uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.memberships WHERE organization_id = _org AND user_id = auth.uid())
$$;
CREATE OR REPLACE FUNCTION public.has_org_role(_org uuid, _roles public.app_role[]) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.memberships WHERE organization_id = _org AND user_id = auth.uid() AND role = ANY(_roles))
$$;
CREATE OR REPLACE FUNCTION public.can_write(_org uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_org_role(_org, ARRAY['admin','advogado','assistente']::public.app_role[])
$$;
CREATE OR REPLACE FUNCTION public.can_delete(_org uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_org_role(_org, ARRAY['admin','advogado']::public.app_role[])
$$;

CREATE POLICY "members read org" ON public.organizations FOR SELECT TO authenticated USING (public.is_member(id));
CREATE POLICY "admin updates org" ON public.organizations FOR UPDATE TO authenticated USING (public.has_org_role(id, ARRAY['admin']::public.app_role[])) WITH CHECK (public.has_org_role(id, ARRAY['admin']::public.app_role[]));
CREATE POLICY "members read memberships" ON public.memberships FOR SELECT TO authenticated USING (public.is_member(organization_id));
CREATE TRIGGER t_org_upd BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text, email text, phone text, oab text, oab_uf text,
  current_organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own or coworkers" ON public.profiles FOR SELECT TO authenticated USING (
  id = auth.uid() OR EXISTS (SELECT 1 FROM public.memberships m1 JOIN public.memberships m2 ON m1.organization_id = m2.organization_id WHERE m1.user_id = auth.uid() AND m2.user_id = profiles.id)
);
CREATE POLICY "update own" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid() AND (current_organization_id IS NULL OR public.is_member(current_organization_id)));
CREATE TRIGGER t_prof_upd BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email) VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.email) ON CONFLICT DO NOTHING;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Invitations
CREATE TABLE public.invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email text NOT NULL,
  role public.app_role NOT NULL,
  token uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','aceito','revogado')),
  invited_by uuid NOT NULL,
  expires_at timestamptz NOT NULL DEFAULT now() + interval '14 days',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.invitations TO authenticated;
GRANT ALL ON public.invitations TO service_role;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read invites" ON public.invitations FOR SELECT TO authenticated USING (public.has_org_role(organization_id, ARRAY['admin']::public.app_role[]));

-- Business tables
CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'pf' CHECK (kind IN ('pf','pj')),
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 200),
  document text, rg text, nationality text, marital_status text, profession text,
  email text, phone text, cep text, street text, number text, complement text, neighborhood text, city text, state text,
  notes text,
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, organization_id)
);
CREATE INDEX ON public.clients(organization_id, name);

CREATE TABLE public.cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  number text NOT NULL, number_is_cnj boolean NOT NULL DEFAULT true,
  client_id uuid, opposing_party text, court text, district text, area text, description text,
  status text NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo','suspenso','arquivado','encerrado')),
  responsible_id uuid,
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, organization_id),
  FOREIGN KEY (client_id, organization_id) REFERENCES public.clients(id, organization_id) ON DELETE SET NULL (client_id),
  FOREIGN KEY (responsible_id, organization_id) REFERENCES public.memberships(user_id, organization_id) ON DELETE SET NULL (responsible_id)
);
CREATE INDEX ON public.cases(organization_id);

CREATE TABLE public.case_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  case_id uuid NOT NULL,
  event_date date NOT NULL, title text NOT NULL, description text,
  created_by uuid DEFAULT auth.uid(), created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (case_id, organization_id) REFERENCES public.cases(id, organization_id) ON DELETE CASCADE
);
CREATE INDEX ON public.case_events(case_id, event_date);

CREATE TABLE public.petitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title text NOT NULL, kind text, summary text,
  client_id uuid, case_id uuid, responsible_id uuid,
  priority text NOT NULL DEFAULT 'media' CHECK (priority IN ('baixa','media','alta','urgente')),
  work_date date, official_deadline date,
  status text NOT NULL DEFAULT 'a_iniciar' CHECK (status IN ('a_iniciar','em_elaboracao','aguardando_revisao','pronta_protocolo','protocolada','concluida')),
  filed_at date, protocol_number text, receipt_path text, notes text,
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, organization_id),
  FOREIGN KEY (client_id, organization_id) REFERENCES public.clients(id, organization_id) ON DELETE SET NULL (client_id),
  FOREIGN KEY (case_id, organization_id) REFERENCES public.cases(id, organization_id) ON DELETE SET NULL (case_id),
  FOREIGN KEY (responsible_id, organization_id) REFERENCES public.memberships(user_id, organization_id) ON DELETE SET NULL (responsible_id)
);
CREATE INDEX ON public.petitions(organization_id, status);

CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  kind text NOT NULL DEFAULT 'reuniao' CHECK (kind IN ('audiencia','reuniao','consulta','outro')),
  starts_at timestamptz NOT NULL, ends_at timestamptz NOT NULL,
  location text, description text,
  client_id uuid, case_id uuid, assignee_id uuid,
  status text NOT NULL DEFAULT 'agendado' CHECK (status IN ('agendado','concluido','desmarcado')),
  reminder_minutes int DEFAULT 60,
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at >= starts_at),
  FOREIGN KEY (client_id, organization_id) REFERENCES public.clients(id, organization_id) ON DELETE SET NULL (client_id),
  FOREIGN KEY (case_id, organization_id) REFERENCES public.cases(id, organization_id) ON DELETE SET NULL (case_id),
  FOREIGN KEY (assignee_id, organization_id) REFERENCES public.memberships(user_id, organization_id) ON DELETE SET NULL (assignee_id)
);
CREATE INDEX ON public.appointments(organization_id, starts_at);

CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title text NOT NULL, description text,
  assignee_id uuid, client_id uuid, case_id uuid, petition_id uuid,
  due_at timestamptz,
  priority text NOT NULL DEFAULT 'media' CHECK (priority IN ('baixa','media','alta','urgente')),
  status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','em_andamento','concluida')),
  checklist jsonb NOT NULL DEFAULT '[]'::jsonb,
  completed_at timestamptz,
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (client_id, organization_id) REFERENCES public.clients(id, organization_id) ON DELETE SET NULL (client_id),
  FOREIGN KEY (case_id, organization_id) REFERENCES public.cases(id, organization_id) ON DELETE SET NULL (case_id),
  FOREIGN KEY (petition_id, organization_id) REFERENCES public.petitions(id, organization_id) ON DELETE SET NULL (petition_id),
  FOREIGN KEY (assignee_id, organization_id) REFERENCES public.memberships(user_id, organization_id) ON DELETE SET NULL (assignee_id)
);
CREATE INDEX ON public.tasks(organization_id, status, due_at);

CREATE TABLE public.professional_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL, nationality text, marital_status text, oab text NOT NULL, oab_uf text NOT NULL,
  firm text, address text, email text, phone text,
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.power_of_attorneys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_id uuid,
  title text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('ad_judicia','ad_judicia_et_extra','administrativa','outro')),
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  content text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho','aprovado')),
  version int NOT NULL DEFAULT 1,
  generated_by text NOT NULL DEFAULT 'modelo' CHECK (generated_by IN ('modelo','ia')),
  approved_by uuid, approved_at timestamptz,
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, organization_id),
  FOREIGN KEY (client_id, organization_id) REFERENCES public.clients(id, organization_id) ON DELETE SET NULL (client_id)
);
CREATE TABLE public.power_of_attorney_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  power_of_attorney_id uuid NOT NULL,
  version int NOT NULL, content text NOT NULL, status text NOT NULL,
  created_by uuid DEFAULT auth.uid(), created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (power_of_attorney_id, organization_id) REFERENCES public.power_of_attorneys(id, organization_id) ON DELETE CASCADE
);

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  title text NOT NULL, body text, link text,
  dedupe_key text UNIQUE,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.notifications(user_id, read_at, created_at DESC);
GRANT SELECT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own notifications read" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "own notifications update" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "own notifications delete" ON public.notifications FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid, action text NOT NULL, entity text NOT NULL, entity_id uuid, summary text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.audit_logs(organization_id, created_at DESC);
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read audit" ON public.audit_logs FOR SELECT TO authenticated USING (public.has_org_role(organization_id, ARRAY['admin']::public.app_role[]));

-- Generic grants/policies for business tables
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['clients','cases','case_events','petitions','appointments','tasks','professional_profiles','power_of_attorneys','power_of_attorney_versions'] LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY "members read" ON public.%I FOR SELECT TO authenticated USING (public.is_member(organization_id))', t);
    EXECUTE format('CREATE POLICY "writers delete" ON public.%I FOR DELETE TO authenticated USING (public.can_delete(organization_id))', t);
  END LOOP;
  FOREACH t IN ARRAY ARRAY['clients','cases','case_events','petitions','professional_profiles','power_of_attorneys','power_of_attorney_versions'] LOOP
    EXECUTE format('CREATE POLICY "writers insert" ON public.%I FOR INSERT TO authenticated WITH CHECK (public.can_write(organization_id))', t);
    EXECUTE format('CREATE POLICY "writers update" ON public.%I FOR UPDATE TO authenticated USING (public.can_write(organization_id)) WITH CHECK (public.can_write(organization_id))', t);
  END LOOP;
  -- tasks & appointments: interns may create and update their own assigned items
  FOREACH t IN ARRAY ARRAY['tasks','appointments'] LOOP
    EXECUTE format('CREATE POLICY "members insert" ON public.%I FOR INSERT TO authenticated WITH CHECK (public.can_write(organization_id) OR (public.is_member(organization_id) AND assignee_id = auth.uid()))', t);
    EXECUTE format('CREATE POLICY "members update" ON public.%I FOR UPDATE TO authenticated USING (public.can_write(organization_id) OR (public.is_member(organization_id) AND assignee_id = auth.uid())) WITH CHECK (public.can_write(organization_id) OR (public.is_member(organization_id) AND assignee_id = auth.uid()))', t);
  END LOOP;
  FOREACH t IN ARRAY ARRAY['clients','cases','petitions','appointments','tasks','professional_profiles','power_of_attorneys'] LOOP
    EXECUTE format('CREATE TRIGGER t_upd BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()', t);
  END LOOP;
END $$;

-- Protect organization_id / created_by immutability
CREATE OR REPLACE FUNCTION public.protect_tenant_cols() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.organization_id <> OLD.organization_id THEN RAISE EXCEPTION 'organization_id imutável'; END IF;
  RETURN NEW;
END $$;
DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['clients','cases','case_events','petitions','appointments','tasks','professional_profiles','power_of_attorneys'] LOOP
    EXECUTE format('CREATE TRIGGER t_tenant BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.protect_tenant_cols()', t);
  END LOOP;
END $$;

-- Audit logging
CREATE OR REPLACE FUNCTION public.audit_trigger() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r record;
BEGIN
  IF TG_OP = 'DELETE' THEN r := OLD; ELSE r := NEW; END IF;
  INSERT INTO public.audit_logs (organization_id, user_id, action, entity, entity_id)
  VALUES (r.organization_id, auth.uid(), lower(TG_OP), TG_TABLE_NAME, r.id);
  RETURN r;
END $$;
DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['clients','cases','petitions','appointments','tasks','power_of_attorneys'] LOOP
    EXECUTE format('CREATE TRIGGER t_audit AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.audit_trigger()', t);
  END LOOP;
END $$;

-- Notifications on assignment
CREATE OR REPLACE FUNCTION public.notify_assignment() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE target uuid; ttl text; lnk text;
BEGIN
  IF TG_TABLE_NAME = 'tasks' THEN target := NEW.assignee_id; ttl := 'Nova tarefa atribuída: ' || NEW.title; lnk := '/tarefas';
    IF TG_OP = 'UPDATE' AND NEW.assignee_id IS NOT DISTINCT FROM OLD.assignee_id THEN RETURN NEW; END IF;
  ELSIF TG_TABLE_NAME = 'petitions' THEN target := NEW.responsible_id; ttl := 'Petição sob sua responsabilidade: ' || NEW.title; lnk := '/peticoes';
    IF TG_OP = 'UPDATE' AND NEW.responsible_id IS NOT DISTINCT FROM OLD.responsible_id THEN RETURN NEW; END IF;
  ELSE target := NEW.assignee_id; ttl := 'Novo compromisso: ' || NEW.title; lnk := '/agenda';
    IF TG_OP = 'UPDATE' AND NEW.assignee_id IS NOT DISTINCT FROM OLD.assignee_id THEN RETURN NEW; END IF;
  END IF;
  IF target IS NOT NULL AND target IS DISTINCT FROM auth.uid() THEN
    INSERT INTO public.notifications (organization_id, user_id, title, link) VALUES (NEW.organization_id, target, ttl, lnk);
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER t_notify AFTER INSERT OR UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.notify_assignment();
CREATE TRIGGER t_notify AFTER INSERT OR UPDATE ON public.petitions FOR EACH ROW EXECUTE FUNCTION public.notify_assignment();
CREATE TRIGGER t_notify AFTER INSERT OR UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.notify_assignment();

-- RPCs
CREATE OR REPLACE FUNCTION public.create_organization(_name text, _oab text DEFAULT NULL, _uf text DEFAULT NULL) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE oid uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Não autenticado'; END IF;
  IF char_length(coalesce(trim(_name),'')) < 2 THEN RAISE EXCEPTION 'Nome do escritório inválido'; END IF;
  INSERT INTO public.organizations (name, oab, oab_uf, created_by) VALUES (trim(_name), _oab, upper(_uf), auth.uid()) RETURNING id INTO oid;
  INSERT INTO public.memberships (organization_id, user_id, role) VALUES (oid, auth.uid(), 'admin');
  UPDATE public.profiles SET current_organization_id = oid WHERE id = auth.uid();
  RETURN oid;
END $$;

CREATE OR REPLACE FUNCTION public.create_invitation(_org uuid, _email text, _role public.app_role) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE tok uuid;
BEGIN
  IF NOT public.has_org_role(_org, ARRAY['admin']::public.app_role[]) THEN RAISE EXCEPTION 'Apenas administradores podem convidar'; END IF;
  IF _email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN RAISE EXCEPTION 'E-mail inválido'; END IF;
  UPDATE public.invitations SET status = 'revogado' WHERE organization_id = _org AND lower(email) = lower(_email) AND status = 'pendente';
  INSERT INTO public.invitations (organization_id, email, role, invited_by) VALUES (_org, lower(trim(_email)), _role, auth.uid()) RETURNING token INTO tok;
  INSERT INTO public.audit_logs (organization_id, user_id, action, entity, summary) VALUES (_org, auth.uid(), 'invite', 'invitations', lower(_email) || ' como ' || _role);
  RETURN tok;
END $$;

CREATE OR REPLACE FUNCTION public.revoke_invitation(_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE o uuid;
BEGIN
  SELECT organization_id INTO o FROM public.invitations WHERE id = _id;
  IF o IS NULL OR NOT public.has_org_role(o, ARRAY['admin']::public.app_role[]) THEN RAISE EXCEPTION 'Sem permissão'; END IF;
  UPDATE public.invitations SET status = 'revogado' WHERE id = _id;
END $$;

CREATE OR REPLACE FUNCTION public.get_invitation(_token uuid) RETURNS TABLE (organization_name text, email text, role public.app_role, status text, expired boolean) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT o.name, i.email, i.role, i.status, i.expires_at < now() FROM public.invitations i JOIN public.organizations o ON o.id = i.organization_id
  WHERE i.token = _token AND auth.uid() IS NOT NULL
$$;

CREATE OR REPLACE FUNCTION public.accept_invitation(_token uuid) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE inv public.invitations; uemail text;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Não autenticado'; END IF;
  SELECT * INTO inv FROM public.invitations WHERE token = _token FOR UPDATE;
  IF inv.id IS NULL OR inv.status <> 'pendente' THEN RAISE EXCEPTION 'Convite inválido ou já utilizado'; END IF;
  IF inv.expires_at < now() THEN RAISE EXCEPTION 'Convite expirado'; END IF;
  SELECT email INTO uemail FROM auth.users WHERE id = auth.uid();
  IF lower(uemail) <> lower(inv.email) THEN RAISE EXCEPTION 'Este convite foi enviado para outro e-mail'; END IF;
  INSERT INTO public.memberships (organization_id, user_id, role) VALUES (inv.organization_id, auth.uid(), inv.role) ON CONFLICT (user_id, organization_id) DO NOTHING;
  UPDATE public.invitations SET status = 'aceito' WHERE id = inv.id;
  UPDATE public.profiles SET current_organization_id = inv.organization_id WHERE id = auth.uid();
  INSERT INTO public.notifications (organization_id, user_id, title, link) SELECT inv.organization_id, inv.invited_by, uemail || ' aceitou o convite', '/equipe';
  RETURN inv.organization_id;
END $$;

CREATE OR REPLACE FUNCTION public.update_member_role(_membership uuid, _role public.app_role) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE m public.memberships;
BEGIN
  SELECT * INTO m FROM public.memberships WHERE id = _membership FOR UPDATE;
  IF m.id IS NULL OR NOT public.has_org_role(m.organization_id, ARRAY['admin']::public.app_role[]) THEN RAISE EXCEPTION 'Sem permissão'; END IF;
  IF m.role = 'admin' AND _role <> 'admin' AND (SELECT count(*) FROM public.memberships WHERE organization_id = m.organization_id AND role = 'admin') <= 1 THEN
    RAISE EXCEPTION 'O escritório precisa de pelo menos um administrador'; END IF;
  UPDATE public.memberships SET role = _role WHERE id = _membership;
  INSERT INTO public.audit_logs (organization_id, user_id, action, entity, entity_id, summary) VALUES (m.organization_id, auth.uid(), 'role_change', 'memberships', m.id, _role::text);
END $$;

CREATE OR REPLACE FUNCTION public.remove_member(_membership uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE m public.memberships;
BEGIN
  SELECT * INTO m FROM public.memberships WHERE id = _membership FOR UPDATE;
  IF m.id IS NULL OR NOT public.has_org_role(m.organization_id, ARRAY['admin']::public.app_role[]) THEN RAISE EXCEPTION 'Sem permissão'; END IF;
  IF m.role = 'admin' AND (SELECT count(*) FROM public.memberships WHERE organization_id = m.organization_id AND role = 'admin') <= 1 THEN
    RAISE EXCEPTION 'Não é possível remover o único administrador'; END IF;
  DELETE FROM public.memberships WHERE id = _membership;
  INSERT INTO public.audit_logs (organization_id, user_id, action, entity, entity_id) VALUES (m.organization_id, auth.uid(), 'remove_member', 'memberships', m.id);
END $$;

CREATE OR REPLACE FUNCTION public.refresh_my_alerts(_org uuid) RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n int := 0; c int;
BEGIN
  IF NOT public.is_member(_org) THEN RAISE EXCEPTION 'Sem permissão'; END IF;
  INSERT INTO public.notifications (organization_id, user_id, title, body, link, dedupe_key)
  SELECT _org, auth.uid(), 'Prazo informado próximo: ' || p.title, 'Prazo em ' || to_char(p.official_deadline, 'DD/MM/YYYY') || ' (informado pelo usuário — revise).', '/peticoes', 'pet:' || p.id || ':' || p.official_deadline || ':' || auth.uid()
  FROM public.petitions p WHERE p.organization_id = _org AND p.responsible_id = auth.uid() AND p.status NOT IN ('protocolada','concluida')
    AND p.official_deadline BETWEEN (now() AT TIME ZONE 'America/Sao_Paulo')::date AND (now() AT TIME ZONE 'America/Sao_Paulo')::date + 3
  ON CONFLICT (dedupe_key) DO NOTHING;
  GET DIAGNOSTICS c = ROW_COUNT; n := n + c;
  INSERT INTO public.notifications (organization_id, user_id, title, body, link, dedupe_key)
  SELECT _org, auth.uid(), 'Tarefa vencendo: ' || t.title, 'Limite em ' || to_char(t.due_at AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI'), '/tarefas', 'task:' || t.id || ':' || t.due_at
  FROM public.tasks t WHERE t.organization_id = _org AND t.assignee_id = auth.uid() AND t.status <> 'concluida' AND t.due_at BETWEEN now() - interval '7 days' AND now() + interval '24 hours'
  ON CONFLICT (dedupe_key) DO NOTHING;
  GET DIAGNOSTICS c = ROW_COUNT; n := n + c;
  INSERT INTO public.notifications (organization_id, user_id, title, body, link, dedupe_key)
  SELECT _org, auth.uid(), 'Compromisso em breve: ' || a.title, to_char(a.starts_at AT TIME ZONE 'America/Sao_Paulo', 'DD/MM HH24:MI'), '/agenda', 'appt:' || a.id || ':' || a.starts_at
  FROM public.appointments a WHERE a.organization_id = _org AND a.assignee_id = auth.uid() AND a.status = 'agendado'
    AND a.starts_at BETWEEN now() AND now() + make_interval(mins => greatest(coalesce(a.reminder_minutes, 60), 15))
  ON CONFLICT (dedupe_key) DO NOTHING;
  GET DIAGNOSTICS c = ROW_COUNT; n := n + c;
  RETURN n;
END $$;

REVOKE EXECUTE ON FUNCTION public.create_organization(text,text,text), public.create_invitation(uuid,text,public.app_role), public.revoke_invitation(uuid), public.get_invitation(uuid), public.accept_invitation(uuid), public.update_member_role(uuid,public.app_role), public.remove_member(uuid), public.refresh_my_alerts(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.create_organization(text,text,text), public.create_invitation(uuid,text,public.app_role), public.revoke_invitation(uuid), public.get_invitation(uuid), public.accept_invitation(uuid), public.update_member_role(uuid,public.app_role), public.remove_member(uuid), public.refresh_my_alerts(uuid) TO authenticated;

-- Storage policies (bucket "documentos", path: <org_id>/...)
CREATE POLICY "org members read docs" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'documentos' AND public.is_member(((storage.foldername(name))[1])::uuid));
CREATE POLICY "org writers upload docs" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'documentos' AND public.can_write(((storage.foldername(name))[1])::uuid));
CREATE POLICY "org writers update docs" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'documentos' AND public.can_write(((storage.foldername(name))[1])::uuid));
CREATE POLICY "org deleters delete docs" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'documentos' AND public.can_delete(((storage.foldername(name))[1])::uuid));
