const fs = require("fs");
const path = require("path");

// ドキュメントファイルを再帰的に検索
function findDocFiles(dir, basePath = "") {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = basePath
      ? path.join(basePath, entry.name)
      : entry.name;

    if (entry.isDirectory()) {
      files.push(...findDocFiles(fullPath, relativePath));
    } else if (
      entry.isFile() &&
      /\.(md|html)$/i.test(entry.name) &&
      entry.name !== "index.md"
    ) {
      files.push({
        fullPath,
        relativePath,
        name: entry.name,
        ext: path.extname(entry.name).toLowerCase(),
      });
    }
  }

  return files.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
}

// HTMLファイルからタイトルを抽出
function extractHtmlTitle(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const titleMatch = content.match(/<title[^>]*>([^<]*)<\/title>/i);
    return titleMatch ? titleMatch[1].trim() : null;
  } catch (error) {
    console.warn(`HTMLタイトル抽出エラー: ${filePath}`, error.message);
    return null;
  }
}

// Markdownファイルからh1タイトルを抽出
function extractMarkdownTitle(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const titleMatch = content.match(/^#\s+(.+)$/m);
    return titleMatch ? titleMatch[1].trim() : null;
  } catch (error) {
    console.warn(`Markdownタイトル抽出エラー: ${filePath}`, error.message);
    return null;
  }
}

// 表示名を生成
function generateDisplayName(file) {
  let displayName;

  if (file.ext === ".html") {
    displayName = extractHtmlTitle(file.fullPath);
  } else if (file.ext === ".md") {
    displayName = extractMarkdownTitle(file.fullPath);
  }

  // タイトルが取得できない場合はファイル名を使用
  if (!displayName) {
    displayName = path.basename(file.name, file.ext);
  }

  return displayName;
}

// メイン処理
function generateDocsIndex() {
  const docsDir = path.join(__dirname, "..", "docs");
  const indexPath = path.join(docsDir, "index.md");

  if (!fs.existsSync(docsDir)) {
    console.error("docs ディレクトリが見つかりません");
    process.exit(1);
  }

  const files = findDocFiles(docsDir);

  let content = "# ドキュメント一覧\n\n";
  content += "このリポジトリのドキュメント一覧です。\n\n";

  if (files.length === 0) {
    content += "*現在ドキュメントはありません。*\n\n";
  } else {
    // ディレクトリごとにグループ化
    const groupedFiles = {};

    for (const file of files) {
      const dir = path.dirname(file.relativePath);
      const groupKey = dir === "." ? "root" : dir;

      if (!groupedFiles[groupKey]) {
        groupedFiles[groupKey] = [];
      }

      groupedFiles[groupKey].push(file);
    }

    // ルートファイルを最初に表示
    if (groupedFiles.root) {
      for (const file of groupedFiles.root) {
        const displayName = generateDisplayName(file);
        content += `- [${displayName}](${file.relativePath})\n`;
      }
      delete groupedFiles.root;
    }

    // サブディレクトリのファイル
    for (const [dir, dirFiles] of Object.entries(groupedFiles)) {
      content += `\n## ${dir}\n\n`;
      for (const file of dirFiles) {
        const displayName = generateDisplayName(file);
        content += `- [${displayName}](${file.relativePath})\n`;
      }
    }

    content += "\n";
  }

  // 最終更新時刻を追加
  const now = new Date();
  const dateStr = now.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  content += "---\n";
  content += `*最終更新: ${dateStr}*\n`;

  // ファイルに書き出し
  fs.writeFileSync(indexPath, content, "utf-8");
  console.log("docs/index.md を更新しました");
  console.log(`対象ファイル数: ${files.length}`);
}

// スクリプトが直接実行された場合のみ実行
if (require.main === module) {
  generateDocsIndex();
}

module.exports = { generateDocsIndex };
