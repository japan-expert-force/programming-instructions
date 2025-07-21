# Programming Instructions

プログラミング指導用ドキュメント集です。

## ドキュメント一覧

[docs/index.md](docs/index.md) に最新のドキュメント一覧があります。

## 自動ドキュメント一覧生成

このリポジトリでは、GitHub Actions を使って `docs` フォルダ内のファイル変更を自動的に検知し、`docs/index.md` を更新するシステムを導入しています。

### 動作仕組み

1. `docs` フォルダ内の `.md` または `.html` ファイルが変更される
2. GitHub Actions が自動的に実行される
3. `docs/index.md` が自動生成・更新される
4. 変更があった場合、自動でコミット・プッシュされる

### 手動でドキュメント一覧を更新する

ローカルで手動更新したい場合：

```bash
# Node.js スクリプトを直接実行
node scripts/generate-docs-index.js

# または npm script を使用
npm run docs:generate
```

### 開発時の自動更新

開発時にドキュメントファイルの変更を監視して自動更新：

```bash
# 必要な場合は依存関係をインストール
npm install

# ファイル監視開始
npm run docs:watch
```

## GitHub Actions ワークフロー

`.github/workflows/update-docs-index.yml` でドキュメント一覧の自動生成を行っています。

Node.js スクリプトを使用しており、以下の特徴があります：

- HTML ファイルから `<title>` タグを自動抽出
- Markdown ファイルから `# タイトル` を自動抽出
- ディレクトリ階層に対応
- ローカルでのテスト実行も可能
