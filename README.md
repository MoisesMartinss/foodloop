# FoodLoop

Protótipo web de um marketplace local voltado à redução do desperdício de alimentos.

## Como executar

O projeto é estático e não precisa instalar dependências. Sirva a pasta por HTTP. Por exemplo:

```bash
python3 -m http.server 4173
```

Depois, acesse `http://localhost:4173` e crie uma conta na tela de cadastro.

## Funcionalidades

- cadastro de **pessoa física (CPF) ou empresa (CNPJ)**, com máscaras de CPF/CNPJ e telefone;
- anúncios de **venda ou doação** (doações aparecem como “Grátis” e com selo próprio);
- selo de validade (“Vence em X dias”) e ocultação automática de produtos vencidos;
- login de usuários;
- proteção das páginas que exigem autenticação;
- catálogo e filtros de produtos;
- cadastro de produtos com imagem;
- perfil próprio, perfil do vendedor e mensagens;
- carrinho individual por usuário;
- checkout e histórico de pedidos;
- encerramento de sessão.

## Front-end

- `shared/style.css` — design system: cores, tipografia, botões, formulários, cards e selos. Altere as variáveis em `:root` para mudar a identidade visual do site inteiro.
- `shared/auth.css` — layout das telas de login e cadastro.
- `shared/layout.js` — ícones SVG, cabeçalho, barra de navegação inferior (celular), rodapé, card de produto e avisos (toast).
- `shared/app.js` — regras de negócio e armazenamento (sem alterações de interface).
- Cada página mantém seu próprio `.css` e `.js` apenas com o que é específico dela.
- Layout responsivo: no celular, a navegação vira uma barra inferior e os filtros abrem em painel.

## Persistência

Os dados são salvos no armazenamento local do navegador. Isso permite demonstrar todos os fluxos sem configurar servidor ou banco de dados. Para uso em produção, a autenticação, os dados e as imagens devem ser migrados para uma API com banco de dados e armazenamento de arquivos.
