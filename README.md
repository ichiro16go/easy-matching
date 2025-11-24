### ディレクトリ構成

```
src/
├── assets/          # 画像やフォントなどの静的アセット
├── components/      # アプリ全体で使う「汎用的な」UIパーツ
│   ├── ui/          # ボタン、入力欄など最小単位 (shadcn/uiなどのライブラリ由来)
│   └── layout/      # ヘッダー、サイドバーなどのレイアウト枠
├── features/        # ★ここが核心。機能（ドメイン）ごとに分割
│   ├── auth/        # 例: 認証機能
│   │   ├── api/     # 認証関連のAPI通信
│   │   ├── components/ # 認証画面専用のコンポーネント (LoginFormなど)
│   │   ├── hooks/   # 認証関連のロジック (useAuthなど)
│   │   └── types/   # 認証関連の型定義
│   └── game/        # 例: ゲーム機能 (TCGシミュレーターならここが厚くなる)
├── hooks/           # アプリ全体で使う汎用hooks (useToggle, useScrollなど)
├── lib/             # サードパーティライブラリの設定・ラッパー (axios, firebase, utilsの再エクスポート)
├── routes/          # ルーティング定義
├── stores/          # グローバルステート (Zustand/Jotaiなどのストア)
├── types/           # アプリ全体で使う型定義 (User, GenericResponseなど)
├── utils/           # 純粋なヘルパー関数 (日付フォーマット、計算ロジック)
├── App.tsx
└── main.tsx
```
# easy-matching
