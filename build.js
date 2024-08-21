import esbuild from "esbuild";
import { sync as globSync } from "glob";

// srcフォルダ内のすべての.jsファイルを取得
const entryPoints = globSync("src/**/*.js");

esbuild
  .build({
    entryPoints: entryPoints,
    bundle: true,
    outdir: "dist", // 出力ディレクトリを指定
    minify: true, // 必要に応じてコードを圧縮
    keepNames: true, // クラス名を保持
    format: "esm", // ESモジュール形式で出力
  })
  .catch(() => process.exit(1));