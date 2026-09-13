# GrowKit Scheduler

# GROWKIT — PROMPT MASTER

## FASE 1 — FUNDAÇÃO DO SAAS

Você é um engenheiro de software sênior responsável por implementar a primeira fase de um SaaS chamado **GrowKit**.

O objetivo deste projeto é criar uma plataforma própria para gerenciamento e posterior publicação automática de Reels em múltiplas contas profissionais do Instagram controladas pelo usuário.

Nesta primeira fase, NÃO implemente o motor de publicação automática no Instagram.

O objetivo desta etapa é construir uma fundação sólida, profissional, segura e escalável para que as próximas fases possam adicionar OAuth da Meta, publicação automática, filas, cron, retry e analytics sem necessidade de reconstruir a aplicação.

---

# 1. OBJETIVO DO PRODUTO

O GrowKit permitirá que um usuário:

* tenha uma conta própria no sistema;
* conecte múltiplas contas profissionais do Instagram;
* mantenha uma biblioteca central de vídeos;
* cadastre modelos de legendas;
* cadastre grupos de hashtags;
* crie agendamentos;
* associe um mesmo vídeo a várias contas;
* visualize a fila de publicações;
* acompanhe o estado dos agendamentos;
* visualize informações gerais através de um dashboard.

A ideia central do produto é:

UM VÍDEO → VÁRIAS CONTAS → VÁRIOS AGENDAMENTOS INDEPENDENTES.

Exemplo:

Um usuário possui:

* @conta_a
* @conta_b
* @conta_c

Ele envia um único Reel para a biblioteca.

Depois pode criar:

* Reel X → @conta_a → 10:00
* Reel X → @conta_b → 12:00
* Reel X → @conta_c → 15:00

Cada publicação deve ser tratada como uma tarefa independente.

---

# 2. STACK OBRIGATÓRIA

Utilize exclusivamente:

Frontend:

* React
* TypeScript
* Vite
* Tailwind CSS
* componentes reutilizáveis

Backend:

* Supabase

Utilizar:

* Supabase Auth
* Supabase PostgreSQL
* Supabase Storage
* Supabase Row Level Security
* Supabase Edge Functions somente quando forem necessárias no backend

Não criar:

* servidor Node separado;
* Railway;
* VPS;
* backend externo;
* Firebase;
* MongoDB;
* banco externo;
* API própria fora do Supabase.

A arquitetura deve permanecer dentro do ecossistema:

Lovable + React + Supabase.

---

# 3. PRINCÍPIO ARQUITETURAL IMPORTANTE

NÃO implemente toda a aplicação de uma vez.

Esta é somente a FASE 1.

A aplicação deve ser preparada para receber posteriormente:

FASE 2:

* OAuth da Meta;
* conexão real de contas Instagram;
* gerenciamento de tokens.

FASE 3:

* motor de publicação;
* criação de containers;
* polling;
* publicação.

FASE 4:

* cron;
* fila;
* retry;
* backoff;
* rate limiting.

FASE 5:

* analytics;
* Instagram Insights;
* métricas.

NÃO implemente essas fases agora.

Não crie código fictício tentando simular publicação real.

Não invente APIs.

Não coloque tokens fictícios.

Não faça chamadas reais à Meta nesta primeira fase.

---

# 4. PADRÃO VISUAL

O GrowKit deve parecer um produto SaaS real e profissional.

Evite completamente:

* aparência genérica de dashboard criado por IA;
* excesso de gradientes;
* glassmorphism exagerado;
* cards gigantes;
* sombras excessivas;
* cores neon sem necessidade;
* interfaces visualmente carregadas;
* elementos decorativos que não possuem função.

Quero uma interface que pareça ter sido construída manualmente por uma equipe profissional de produto.

Priorize:

* hierarquia visual;
* espaçamento consistente;
* tipografia profissional;
* componentes discretos;
* bordas sutis;
* boa utilização de espaço;
* estados de hover;
* feedback visual;
* responsividade;
* excelente experiência desktop;
* boa experiência mobile.

O visual deve transmitir:

PRODUTO SaaS + AUTOMAÇÃO + ORGANIZAÇÃO + PROFISSIONALISMO.

Use uma interface predominantemente escura ou neutra, elegante e moderna.

Não transformar tudo em preto puro.

Use uma cor de destaque de forma controlada.

A interface deve lembrar uma ferramenta profissional de produtividade, não uma landing page.

---

# 5. ESTRUTURA PRINCIPAL DA APLICAÇÃO

Criar uma estrutura com:

Sidebar:

* Dashboard
* Contas
* Biblioteca
* Legendas
* Hashtags
* Agendamentos

Área inferior da sidebar:

* Configurações
* Perfil
* Sair

Header:

* título da página atual;
* informações básicas do usuário;
* elementos contextuais quando necessário.

A sidebar deve ser responsiva.

No mobile, utilizar navegação adaptada.

---

# 6. AUTENTICAÇÃO

Implementar autenticação utilizando exclusivamente Supabase Auth.

Criar:

* Login
* Cadastro
* Logout
* Proteção de rotas
* Persistência de sessão

Campos:

Cadastro:

* nome
* e-mail
* senha

Login:

* e-mail
* senha

Criar estrutura preparada para recuperação de senha posteriormente.

Após autenticação, direcionar o usuário para:

/dashboard

Usuários não autenticados não devem conseguir acessar as páginas internas.

---

# 7. BANCO DE DADOS

Criar migrations SQL reais dentro de:

supabase/migrations/

Não criar somente estruturas visuais.

O banco precisa existir de verdade no Supabase.

Todas as tabelas devem possuir:

* UUID como identificador;
* created_at;
* updated_at quando fizer sentido;
* foreign keys;
* índices adequados;
* constraints;
* RLS.

Utilizar UUID com geração automática.

---

# 8. TABELA profiles

Criar:

profiles

Campos:

* id UUID PRIMARY KEY REFERENCES auth.users(id)
* full_name TEXT
* avatar_url TEXT
* created_at TIMESTAMPTZ
* updated_at TIMESTAMPTZ

Criar trigger ou mecanismo apropriado para criar automaticamente o profile após cadastro do usuário.

RLS:

O usuário só pode visualizar e editar o próprio profile.

---

# 9. TABELA connected_accounts

Criar:

connected_accounts

Campos:

* id UUID PRIMARY KEY
* user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
* ig_user_id TEXT
* username TEXT
* facebook_page_id TEXT
* account_status TEXT
* token_expires_at TIMESTAMPTZ
* created_at TIMESTAMPTZ
* updated_at TIMESTAMPTZ

account_status deve possuir estados controlados, por exemplo:

* active
* token_expiring
* token_expired
* error
* disconnected
* pending

IMPORTANTE:

Nesta primeira fase NÃO implementar OAuth real.

A interface deve possuir o botão:

"Conectar conta do Instagram"

mas ele deve somente apresentar uma interface/estado preparado para a futura integração.

Não criar um OAuth falso.

Não inventar tokens.

Não expor tokens no frontend.

IMPORTANTE SOBRE SEGURANÇA:

Não permitir que tokens de acesso da Meta sejam manipulados pelo React.

Quando o sistema receber tokens reais em fases futuras, a manipulação deverá ocorrer exclusivamente em backend/Edge Functions.

---

# 10. TABELA media_assets

Criar:

media_assets

Campos:

* id UUID PRIMARY KEY
* user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
* storage_path TEXT NOT NULL
* public_url TEXT
* duration_seconds NUMERIC
* thumbnail_url TEXT
* original_filename TEXT
* mime_type TEXT
* file_size_bytes BIGINT
* created_at TIMESTAMPTZ
* updated_at TIMESTAMPTZ

A biblioteca pertence ao usuário.

Um vídeo pode posteriormente ser utilizado em vários agendamentos.

---

# 11. SUPABASE STORAGE

Criar estrutura de Storage para os vídeos.

Bucket:

media-assets

Organizar os arquivos por usuário, por exemplo:

user_id/media_id/arquivo.mp4

O frontend nunca deve conseguir acessar arquivos pertencentes a outro usuário.

Configurar políticas de Storage adequadas.

Não utilizar bucket público sem necessidade.

Preferir acesso protegido e signed URLs quando apropriado.

---

# 12. UPLOAD DE VÍDEOS

Criar página:

/library

A página deve permitir:

* drag and drop;
* seleção de arquivo;
* indicação visual de upload;
* barra de progresso;
* feedback de sucesso;
* feedback de erro.

Aceitar inicialmente:

* MP4
* MOV

Criar validações básicas:

* tipo do arquivo;
* tamanho máximo razoável;
* arquivo vazio;
* extensão inválida.

A arquitetura deve permitir futuramente integrar FFmpeg.wasm para processamento do vídeo antes do upload.

IMPORTANTE:

Nesta primeira fase, NÃO tornar FFmpeg.wasm obrigatório se isso aumentar desnecessariamente a complexidade.

Criar a estrutura de serviço/componente para que ele possa ser adicionado posteriormente.

Se o arquivo já estiver adequado, permitir upload direto.

---

# 13. BIBLIOTECA DE MÍDIA

Criar grid profissional de vídeos.

Cada item deve mostrar:

* thumbnail;
* nome;
* duração;
* tamanho;
* data;
* ações.

Ações:

* visualizar;
* excluir.

Preparar espaço para futuramente:

* editar;
* duplicar;
* visualizar informações;
* criar agendamento.

Criar estados:

* biblioteca vazia;
* carregando;
* erro;
* biblioteca preenchida.

A empty state deve possuir CTA:

"Adicionar primeiro Reel"

---

# 14. TABELA caption_templates

Criar:

caption_templates

Campos:

* id UUID PRIMARY KEY
* user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
* nicho TEXT
* nome TEXT
* texto TEXT
* created_at TIMESTAMPTZ
* updated_at TIMESTAMPTZ

Criar CRUD completo.

Página:

/captions

Funcionalidades:

* criar;
* editar;
* excluir;
* pesquisar;
* filtrar por nicho.

---

# 15. TABELA hashtag_groups

Criar:

hashtag_groups

Campos:

* id UUID PRIMARY KEY
* user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
* nicho TEXT
* nome TEXT
* hashtags TEXT[]
* created_at TIMESTAMPTZ
* updated_at TIMESTAMPTZ

Criar CRUD completo.

Página:

/hashtags

Permitir adicionar hashtags individualmente.

Mostrar visualmente cada hashtag como tag/chip.

Permitir:

* criar;
* editar;
* excluir;
* pesquisar;
* filtrar por nicho.

---

# 16. TABELA scheduled_posts

Esta é uma das tabelas mais importantes do sistema.

Criar:

scheduled_posts

Campos:

* id UUID PRIMARY KEY
* user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
* media_asset_id UUID NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE
* connected_account_id UUID NOT NULL REFERENCES connected_accounts(id) ON DELETE CASCADE
* caption_template_id UUID REFERENCES caption_templates(id) ON DELETE SET NULL
* hashtag_group_id UUID REFERENCES hashtag_groups(id) ON DELETE SET NULL
* caption_override TEXT
* hashtags_override TEXT[]
* scheduled_for TIMESTAMPTZ NOT NULL
* status TEXT NOT NULL DEFAULT 'pending'
* ig_container_id TEXT
* attempt_count INTEGER NOT NULL DEFAULT 0
* last_attempt_at TIMESTAMPTZ
* next_attempt_at TIMESTAMPTZ
* error_code TEXT
* error_message TEXT
* published_at TIMESTAMPTZ
* created_at TIMESTAMPTZ
* updated_at TIMESTAMPTZ

Status inicialmente:

* pending
* publishing
* published
* error
* cancelled

Criar constraints e índices apropriados.

Criar índice para:

* user_id
* scheduled_for
* status
* connected_account_id

IMPORTANTE:

Cada linha representa UMA tentativa de publicação de UM vídeo em UMA conta.

Nunca tratar múltiplas contas como uma única publicação.

---

# 17. TABELA publish_logs

Criar:

publish_logs

Campos:

* id UUID PRIMARY KEY
* user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
* scheduled_post_id UUID NOT NULL REFERENCES scheduled_posts(id) ON DELETE CASCADE
* attempt_number INTEGER NOT NULL
* status TEXT NOT NULL
* response_payload JSONB
* error_message TEXT
* created_at TIMESTAMPTZ

Essa tabela será usada futuramente pelo motor de publicação.

Nesta primeira fase apenas criar a estrutura.

---

# 18. TABELA account_rate_limits

Criar:

account_rate_limits

Campos:

* id UUID PRIMARY KEY
* user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
* connected_account_id UUID NOT NULL REFERENCES connected_accounts(id) ON DELETE CASCADE
* published_at TIMESTAMPTZ NOT NULL
* created_at TIMESTAMPTZ

Essa tabela representa eventos reais de publicação.

NÃO criar contador diário.

A lógica futura deverá consultar uma janela móvel de tempo, por exemplo:

published_at > now() - interval '24 hours'

Nesta fase apenas criar a tabela, índices e RLS.

---

# 19. ROW LEVEL SECURITY

Todas as tabelas devem possuir RLS habilitado.

Regra fundamental:

Um usuário só pode acessar os próprios dados.

Não confiar somente no frontend.

Aplicar segurança no banco.

Para tabelas que possuem user_id:

user_id = auth.uid()

Para tabelas relacionadas, garantir que o usuário não consiga manipular registros pertencentes a outro usuário.

Exemplo:

Um usuário não pode criar um scheduled_post apontando para:

* media_asset de outro usuário;
* connected_account de outro usuário;
* caption_template de outro usuário;
* hashtag_group de outro usuário.

Criar políticas INSERT, SELECT, UPDATE e DELETE adequadas.

Testar mentalmente cenários de acesso cruzado.

---

# 20. AGENDAMENTOS

Criar página:

/schedule

Criar interface para:

1. selecionar um Reel;
2. selecionar uma ou várias contas;
3. selecionar legenda;
4. selecionar hashtags;
5. definir data;
6. definir horário;
7. criar agendamento.

Quando múltiplas contas forem selecionadas:

Criar UMA linha de scheduled_posts para cada conta.

Exemplo:

1 vídeo + 3 contas = 3 scheduled_posts.

Cada registro deve ter:

* mesma mídia;
* conta diferente;
* horário independente;
* status independente.

---

# 21. SOBRESCRITA DE LEGENDA E HASHTAGS

A publicação deve poder utilizar:

* template;
* override.

Prioridade futura:

caption_override > caption_template

hashtags_override > hashtag_group

Nesta fase apenas criar o modelo de dados e interface necessária.

---

# 22. DISTRIBUIÇÃO AUTOMÁTICA

Criar na interface a opção:

"Distribuir automaticamente"

Nesta primeira fase, implementar apenas uma lógica simples e determinística.

O usuário poderá definir:

* intervalo mínimo entre posts;
* data inicial;
* horário inicial.

O sistema poderá distribuir os posts selecionados respeitando o intervalo.

IMPORTANTE:

Não implementar ainda regras avançadas de rate limiting da Meta.

A lógica avançada ficará para uma fase posterior.

---

# 23. FILA DE AGENDAMENTOS

Criar página:

/scheduled-posts

Mostrar:

* próximas publicações;
* publicações anteriores;
* status;
* conta;
* Reel;
* data/hora;
* legenda;
* ações.

Filtros:

* conta;
* status;
* período.

Status visualmente diferenciados:

Pending:
"Pendente"

Publishing:
"Publicando"

Published:
"Publicado"

Error:
"Erro"

Cancelled:
"Cancelado"

Criar ações:

* visualizar;
* cancelar agendamento;
* excluir quando permitido.

NÃO criar botão que finja publicar no Instagram.

---

# 24. DASHBOARD

Criar:

/dashboard

Mostrar indicadores:

* contas conectadas;
* vídeos na biblioteca;
* posts agendados;
* posts publicados;
* posts com erro.

Mostrar:

### Próximos agendamentos

Lista com:

* horário;
* conta;
* thumbnail;
* nome do Reel;
* status.

### Contas que precisam de atenção

Exemplo:

* token expirado;
* conta com erro;
* conta desconectada.

Nesta fase esses estados podem ser alimentados pelo banco.

### Atividade recente

Mostrar últimos eventos relevantes.

Não criar dados fake permanentes.

Se o banco estiver vazio, mostrar empty states reais.

---

# 25. COMPONENTES REUTILIZÁVEIS

Criar componentes reutilizáveis para:

* Sidebar
* Header
* PageHeader
* StatCard
* StatusBadge
* AccountCard
* MediaCard
* EmptyState
* LoadingState
* ErrorState
* Modal
* ConfirmDialog
* DataTable
* FilterBar
* UploadDropzone
* FormField
* Toast/Notification

Evitar duplicação de componentes.

---

# 26. SERVIÇOS E ORGANIZAÇÃO DO CÓDIGO

Organizar o código de forma profissional.

Separar:

* pages;
* components;
* hooks;
* services;
* lib;
* types;
* utils.

Criar uma camada clara para comunicação com Supabase.

Não espalhar chamadas SQL/Supabase aleatoriamente dentro de componentes.

Criar funções reutilizáveis.

Usar TypeScript corretamente.

Evitar:

* any desnecessário;
* código duplicado;
* componentes gigantes;
* lógica de negócio misturada com UI.

---

# 27. ESTADOS DE INTERFACE

Todas as telas devem considerar:

* loading;
* empty;
* success;
* error;
* disabled;
* submitting.

Nunca deixar uma tela simplesmente vazia enquanto carrega.

Mostrar feedback para ações importantes.

Exemplo:

Ao excluir vídeo:

"Excluir este Reel?"

Após exclusão:

"Reel removido da biblioteca."

---

# 28. RESPONSIVIDADE

Desktop é prioridade, mas o sistema deve funcionar corretamente em:

* desktop;
* notebook;
* tablet;
* mobile.

A sidebar deve adaptar-se ao mobile.

Tabelas devem possuir comportamento responsivo adequado.

Não simplesmente colocar overflow horizontal em tudo.

---

# 29. SEGURANÇA

Regras obrigatórias:

1. Nunca expor tokens da Meta no frontend.
2. Nunca colocar secrets no código.
3. Nunca colocar secrets no Git.
4. Nunca utilizar service_role key no frontend.
5. RLS obrigatório.
6. Validar ownership no banco.
7. Validar inputs.
8. Evitar XSS ao renderizar conteúdo criado pelo usuário.
9. Não confiar em IDs enviados pelo frontend.
10. Não criar credenciais falsas.
11. Não simular publicação real.
12. Não implementar OAuth fictício.

---

# 30. PREPARAÇÃO PARA META API

Nesta fase não integrar a Meta API.

Porém, estruturar connected_accounts para futuramente suportar:

* Instagram Business/Creator;
* Instagram User ID;
* Facebook Page ID;
* access token;
* expiração;
* status;
* conexão;
* desconexão.

Criar uma abstração para o futuro serviço de integração.

Não fazer chamadas reais agora.

---

# 31. NÃO IMPLEMENTAR NESTA FASE

É extremamente importante NÃO implementar:

* publicação real no Instagram;
* Meta OAuth real;
* renovação automática de token;
* Edge Function de publicação;
* criação de containers;
* polling de containers;
* media_publish;
* retry automático;
* backoff;
* rate limiting avançado;
* Instagram Insights;
* analytics avançado;
* notificações externas;
* WhatsApp;
* Telegram;
* planos;
* cobrança;
* multi-tenancy comercial;
* sistema de afiliados.

Essas funcionalidades serão implementadas posteriormente.

---

# 32. DADOS DE DEMONSTRAÇÃO

Não inserir dados falsos permanentes no banco.

Para testar a interface, utilizar empty states.

Se for necessário criar dados de desenvolvimento, deixar isso claramente separado e não misturar com produção.

---

# 33. MIGRATIONS

As alterações de banco devem ser feitas através de migrations SQL organizadas.

Criar migrations em:

supabase/migrations/

Não depender somente de alterações manuais pelo painel.

O projeto deve permanecer reproduzível.

---

# 34. ÍCONES

Utilizar uma biblioteca de ícones já compatível com o projeto, preferencialmente Lucide.

Evitar emojis como ícones principais da interface.

---

# 35. ACESSIBILIDADE

Implementar:

* labels;
* aria-label quando necessário;
* navegação por teclado;
* foco visível;
* contraste adequado;
* botões com estados claros.

---

# 36. PERFORMANCE

Não fazer queries desnecessárias.

Utilizar:

* paginação quando necessário;
* carregamento sob demanda;
* thumbnails;
* queries filtradas;
* índices no banco.

Evitar carregar todos os vídeos/agendamentos de uma vez quando a quantidade crescer.

---

# 37. CRITÉRIO DE CONCLUSÃO DA FASE 1

A Fase 1 será considerada concluída quando for possível:

1. Criar uma conta.
2. Fazer login.
3. Acessar o dashboard.
4. Criar/editar profile.
5. Visualizar a área de contas.
6. Visualizar o botão de conexão do Instagram.
7. Fazer upload de um Reel.
8. Visualizar o Reel na biblioteca.
9. Excluir o Reel.
10. Criar uma legenda.
11. Criar um grupo de hashtags.
12. Criar um agendamento.
13. Selecionar múltiplas contas para um Reel.
14. Gerar uma linha de scheduled_posts por conta.
15. Visualizar os agendamentos na fila.
16. Filtrar os agendamentos.
17. Cancelar um agendamento.
18. Visualizar os estados corretamente.
19. Ter RLS funcionando.
20. Não permitir acesso aos dados de outro usuário.

---

# 38. INSTRUÇÃO FINAL PARA A IMPLEMENTAÇÃO

Antes de escrever código:

1. Analise toda esta especificação.
2. Crie a arquitetura.
3. Verifique as dependências.
4. Crie as migrations.
5. Configure Supabase.
6. Configure Auth.
7. Configure Storage.
8. Configure RLS.
9. Depois construa a interface.
10. Depois conecte a interface ao banco.
11. Depois teste os fluxos principais.

NÃO tente implementar funcionalidades das próximas fases.

NÃO simplifique a arquitetura removendo RLS, migrations ou ownership.

NÃO criar backend externo.

NÃO criar código fictício para funcionalidades ainda não implementadas.

Se alguma decisão técnica precisar ser tomada, escolha a solução mais simples, segura e escalável dentro da stack especificada.

O código deve ser completo, funcional e organizado.

Não entregar apenas mockups.

Não criar apenas telas estáticas.

O objetivo desta etapa é entregar uma primeira versão funcional da fundação do GrowKit conectada ao Supabase.

Ao finalizar, apresente um resumo objetivo contendo:

* arquitetura criada;
* tabelas criadas;
* migrations criadas;
* políticas RLS criadas;
* Storage configurado;
* páginas criadas;
* funcionalidades funcionais;
* funcionalidades propositalmente deixadas para a próxima fase;
* eventuais pendências ou decisões que precisam ser tomadas.

IMPORTANTE:

Não avance para a implementação do motor de publicação automática nesta etapa.

A prioridade absoluta é construir uma fundação limpa, segura, funcional e preparada para as próximas fases.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://multi-reel-pro.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/cb45e704-d741-429d-9f0b-83f30e275173).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
