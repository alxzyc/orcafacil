-- 1. Profiles (Empresas/Usuários)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users,
    company_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Clientes
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Recursos (Catálogo)
CREATE TABLE catalog_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id),
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('material', 'labor')),
    unit TEXT,
    unit_cost DECIMAL(12,2) NOT NULL,
    default_markup DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Orçamentos (Propostas)
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id),
    client_id UUID REFERENCES clients(id),
    title TEXT NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected')),
    public_token UUID DEFAULT gen_random_uuid() UNIQUE,
    public_token_enabled BOOLEAN DEFAULT true,
    total_amount DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Itens do Orçamento (Snapshot)
CREATE TABLE budget_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
    catalog_item_id UUID REFERENCES catalog_items(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL, -- Snapshot do valor
    total_price DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies (Simplificado: Ativar RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;

-- Exemplo: Políticas para Usuários Autenticados (Acesso apenas à própria empresa)
CREATE POLICY "Users can manage their own data" ON clients FOR ALL USING (auth.uid() = profile_id);
CREATE POLICY "Users can manage their own catalog" ON catalog_items FOR ALL USING (auth.uid() = profile_id);
CREATE POLICY "Users can manage their own budgets" ON budgets FOR ALL USING (auth.uid() = profile_id);
CREATE POLICY "Users can manage their own budget items" ON budget_items FOR ALL USING (EXISTS (SELECT 1 FROM budgets WHERE budgets.id = budget_items.budget_id AND budgets.profile_id = auth.uid()));

-- Política de Acesso Público para Propostas (Somente leitura para tokens válidos)
CREATE POLICY "Public access to budgets via token" ON budgets FOR SELECT USING (public_token_enabled = true);
-- Nota: Para o portal público, o SELECT será feito filtrando pelo `public_token` na aplicação
