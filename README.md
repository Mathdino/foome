<h1 align="center">🍔 Foome</h1>

<p align="center">
  Aplicativo mobile de delivery de comida construído com React Native, Expo e Appwrite.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/-React_Native-black?style=for-the-badge&logoColor=white&logo=react&color=61DAFB" alt="React Native" />
  <img src="https://img.shields.io/badge/-Expo-black?style=for-the-badge&logoColor=white&logo=expo&color=000020" alt="Expo" />
  <img src="https://img.shields.io/badge/-Appwrite-black?style=for-the-badge&logoColor=white&logo=appwrite&color=F02E65" alt="Appwrite" />
  <img src="https://img.shields.io/badge/-NativeWind-black?style=for-the-badge&logoColor=white&logo=tailwindcss&color=06B6D4" alt="NativeWind" />
  <img src="https://img.shields.io/badge/-TypeScript-black?style=for-the-badge&logoColor=white&logo=typescript&color=3178C6" alt="TypeScript" />
  <img src="https://img.shields.io/badge/-Zustand-black?style=for-the-badge&logoColor=white&color=000000" alt="Zustand" />
</p>

---

## 📋 Índice

1. [Sobre](#sobre)
2. [Funcionalidades](#funcionalidades)
3. [Tech Stack](#tech-stack)
4. [Estrutura do projeto](#estrutura)
5. [Pré-requisitos](#pre-requisitos)
6. [Instalação](#instalacao)
7. [Variáveis de ambiente](#env)
8. [Executando o app](#executando)
9. [Scripts disponíveis](#scripts)
10. [Monitoramento](#sentry)

---

## <a name="sobre"></a>📱 Sobre

**Foome** é um aplicativo de delivery de comida com navegação fluida, busca dinâmica, filtros por categoria, carrinho de compras e autenticação de usuários. O app utiliza **Expo Router** com rotas tipadas, **NativeWind** para estilização utility-first e **Appwrite** como backend para autenticação, banco de dados e armazenamento de imagens.

## <a name="funcionalidades"></a>🔋 Funcionalidades

- 🔐 **Autenticação** — Cadastro e login de usuários com Appwrite.
- 🏠 **Home** — Banners de ofertas, categorias em destaque e atalhos para o menu.
- 🔎 **Busca e filtros** — Pesquisa por nome do produto e filtros por categoria.
- 🍟 **Detalhes do produto** — Imagem, descrição, preço, customizações (toppings, side options) e botão de adicionar ao carrinho.
- 🛒 **Carrinho** — Listagem de itens, ajuste de quantidade, cálculo de subtotal, taxa de entrega e total.
- 👤 **Perfil** — Visualização e edição dos dados do usuário (incluindo upload de avatar).
- 🌗 **Tema adaptativo** — Suporte automático a modo claro/escuro do sistema.
- 📊 **Monitoramento** — Sentry integrado para captura de erros e métricas de performance.
- ✨ **Animações** — Reanimated e Gesture Handler para transições suaves entre telas.

## <a name="tech-stack"></a>⚙️ Tech Stack

| Categoria       | Tecnologia                                                                                |
| --------------- | ----------------------------------------------------------------------------------------- |
| Framework       | [Expo](https://expo.dev/) + [React Native](https://reactnative.dev/) `0.81`               |
| Linguagem       | [TypeScript](https://www.typescriptlang.org/) `5.9`                                       |
| Roteamento      | [Expo Router](https://docs.expo.dev/router/introduction/) `6` (file-based, rotas tipadas) |
| Estilização     | [NativeWind](https://www.nativewind.dev/) + [Tailwind CSS](https://tailwindcss.com/)      |
| Backend         | [Appwrite](https://appwrite.io/) (`react-native-appwrite`)                                |
| Estado global   | [Zustand](https://github.com/pmndrs/zustand)                                              |
| Animações       | [Reanimated](https://docs.swmansion.com/react-native-reanimated/) + Gesture Handler       |
| Imagens e mídia | `expo-image`, `expo-image-picker`, `expo-file-system`                                     |
| Observabilidade | [Sentry](https://sentry.io/)                                                              |

## <a name="estrutura"></a>🗂️ Estrutura do projeto

```
foome/
├── app/                      # Rotas (Expo Router)
│   ├── (auth)/               # Telas públicas: sign-in, sign-up
│   ├── (tabs)/               # Tabs autenticadas: index, search, cart, profile
│   ├── menu/[id].tsx         # Detalhes do produto
│   ├── edit-profile.tsx      # Edição de perfil
│   └── _layout.tsx           # Layout raiz
├── components/               # Componentes reutilizáveis (CartItem, MenuCard, Filter, etc.)
├── lib/
│   ├── appwrite.ts           # Cliente e helpers do Appwrite
│   ├── seed.ts               # Script de seed do banco
│   ├── useAppwrite.ts        # Hook genérico para consultas
│   ├── data.ts               # Dados mock/seed
│   └── masks.ts              # Máscaras de input
├── store/
│   ├── auth.store.ts         # Sessão e usuário
│   └── cart.store.ts         # Carrinho
├── assets/                   # Imagens, fontes e ícones
├── constants/                # Constantes da UI
├── app.json                  # Configuração do Expo
├── tailwind.config.js
└── tsconfig.json
```

## <a name="pre-requisitos"></a>✅ Pré-requisitos

- [Node.js](https://nodejs.org/) 20 ou superior
- [Git](https://git-scm.com/)
- npm (ou pnpm/yarn)
- App **Expo Go** no celular ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779)) **ou** um emulador Android/iOS configurado
- Conta no [Appwrite Cloud](https://cloud.appwrite.io/) (ou instância self-hosted)

## <a name="instalacao"></a>🚀 Instalação

```bash
# clone o repositório
git clone <url-do-repositorio> foome
cd foome

# instale as dependências
npm install
```

## <a name="env"></a>🔑 Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com as credenciais do seu projeto Appwrite:

```env
EXPO_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
EXPO_PUBLIC_APPWRITE_PROJECT_ID=
EXPO_PUBLIC_APPWRITE_DATABASE_ID=
EXPO_PUBLIC_APPWRITE_PLATFORM=com.seunome.foome
```

> Confira em `lib/appwrite.ts` quais IDs de coleção/bucket são consumidos e crie-os no console do Appwrite. Use `lib/seed.ts` para popular o banco com os dados iniciais.

## <a name="executando"></a>▶️ Executando o app

```bash
# inicia o Metro Bundler
npx expo start
```

Em seguida:

- Escaneie o QR Code com o **Expo Go** no celular, **ou**
- Pressione `a` para abrir no emulador Android, **ou**
- Pressione `i` para abrir no simulador iOS (macOS).

## <a name="scripts"></a>🧰 Scripts disponíveis

| Comando           | Descrição                                    |
| ----------------- | -------------------------------------------- |
| `npm start`       | Inicia o servidor de desenvolvimento do Expo |
| `npm run android` | Abre o app no emulador/dispositivo Android   |
| `npm run ios`     | Abre o app no simulador iOS                  |
| `npm run web`     | Executa a versão web                         |
| `npm run lint`    | Executa o ESLint                             |

## <a name="sentry"></a>📈 Monitoramento (Sentry)

O projeto já está configurado com o plugin `@sentry/react-native/expo` apontando para a organização/projeto `foome`. Para ativar o envio de eventos em produção, configure o DSN do seu projeto Sentry e o auth token necessário para upload de source maps (consulte a [documentação oficial](https://docs.sentry.io/platforms/react-native/manual-setup/expo/)).

---
