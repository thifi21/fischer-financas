# Fischer Finanças - App Mobile📱

Este é o aplicativo móvel companheiro do projeto **Fischer Finanças**, construído com [React Native](https://reactnative.dev) e [Expo](https://expo.dev). Ele permite que os usuários acessem seus painéis financeiros de qualquer lugar através do celular, consumindo a mesma base de dados do sistema web.

## Estrutura Atual
* **`App.tsx`**: Ponto central responsável por verificar se o usuário está logado usando a sessão do Supabase, roteando para a **DashboardScreen** ou a **LoginScreen**.
* **`LoginScreen`**: Interface otimizada com inputs nativos que se conectam ao método `signInWithPassword` do Supabase.
* **`DashboardScreen`**: Um placar gerencial financeiro que faz buscas das tabelas `entradas`, `cartoes`, `contas_fixas` e `combustivel` exibindo somatórias e saldo líquido em tempo real.

## Como Executar
1. Instale o aplicativo **Expo Go** no seu Android ou dispositivo iOS.
2. Certifique-se de preencher o arquivo `.env` na pasta raiz de `mobile` com as chaves do seu Supabase:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=sua_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=sua_key
   ```
3. A partir do diretório raiz onde este repositório se encontra, instale os pacotes:
   ```bash
   cd mobile
   npm install
   ```
4. E então inicie o servidor:
   ```bash
   npx expo start
   ```
5. Mire a câmera do seu celular no código QR para que ele carregue dentro do Expo Go nativamente.

## Tecnologias Usadas
* **React Native / Expo**: Estrutura frontend para construir os visuais nativos sem mexer com Android Studio ou Xcode.
* **Supabase-js**: Para gerenciar as buscas das tabelas no backend e armazenar `AsyncStorage` da conta de usuário sem risco de perda de sessão ao fechar o app.
