/**
 * 컨셉 시안(Phase 2b) HTML 계약 — 정적 검사
 *
 * design/02b-concepts/
 *   shared/tokens.base.css   토큰 v1 (색 리터럴은 tokens*.css 에만)
 *   shared/data.js           세 안 공통 더미 데이터
 *   {A,B,C}/concept.css      컨셉 토큰 (var() 만 · 색 리터럴 금지)
 *   {A,B,C}/{screen}.html    design/00-spec/screens.json 의 file
 *   {A,B,C}/index.html       4화면 목차
 *
 * 화면 HTML 마크업 계약
 *   <body data-screen="{id}" data-concept="{A|B|C}">
 *   셸 화면: data-region="gnb|lnb|mdi|page-header|statusbar|allsharp-i"
 *   주 액션: data-action="primary" 정확히 1개
 *   데이터 : data-bind="{key}" (렌더 검사에서 세 안 값이 같은지 비교)
 *   상태   : data-status="{approved|warning|error|info|edited}" + 아이콘 + 텍스트
 *   그리드 : data-grid-header / data-grid-row
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const CONCEPTS = ["A", "B", "C"];
export const SHELL_REGIONS = ["gnb", "lnb", "mdi", "page-header", "statusbar", "allsharp-i"];
const COLOR_LITERAL = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/;

/** <style>·style="" 안의 색 리터럴. SVG 는 currentColor 를 쓴다. */
export function findColorLiterals(text) {
  const hits = [];
  const blocks = [
    ...[...text.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]),
    ...[...text.matchAll(/style="([^"]*)"/gi)].map((m) => m[1]),
    ...[...text.matchAll(/\b(?:fill|stroke|color)="([^"]*)"/gi)].map((m) => m[1]),
  ];
  for (const b of blocks) {
    const m = b.match(COLOR_LITERAL);
    if (m) hits.push(m[0]);
  }
  return hits;
}

export function checkScreenHtml(html, { id, concept, shell }) {
  const problems = [];
  const body = html.match(/<body([^>]*)>/i)?.[1] ?? "";
  if (!new RegExp(`data-screen="${id}"`).test(body)) problems.push(`body data-screen="${id}" 없음`);
  if (!new RegExp(`data-concept="${concept}"`).test(body)) problems.push(`body data-concept="${concept}" 없음`);
  for (const href of ["../shared/tokens.base.css", "concept.css"]) {
    if (!html.includes(`href="${href}"`)) problems.push(`${href} 연결 없음`);
  }
  if (!html.includes('src="../shared/data.js"')) problems.push("../shared/data.js 연결 없음");
  const primaries = (html.match(/data-action="primary"/g) || []).length;
  if (primaries !== 1) problems.push(`data-action="primary" ${primaries}개 (정확히 1개)`);
  if (shell) {
    const missing = SHELL_REGIONS.filter((r) => !html.includes(`data-region="${r}"`));
    if (missing.length) problems.push(`T0 셸 누락: ${missing.join(", ")}`);
  }
  const colors = findColorLiterals(html);
  if (colors.length) problems.push(`색 리터럴 ${colors.length}개 (${colors.slice(0, 3).join(", ")}) — var(--…) 사용`);
  return problems;
}

export function loadScreens(root = ".") {
  return JSON.parse(readFileSync(join(root, "design/00-spec/screens.json"), "utf8")).screens;
}

export function checkConceptsStatic(root = ".", only = CONCEPTS) {
  const base = join(root, "design/02b-concepts");
  const screens = loadScreens(root);
  const results = [...checkProjectSources(root)];
  const tokens = join(base, "shared/tokens.base.css");
  const tokensText = existsSync(tokens) ? readFileSync(tokens, "utf8") : "";
  results.push({ name: "shared/tokens.base.css", pass: !!tokensText, detail: tokens });
  results.push({
    name: "다크 모드 토큰",
    pass: /\[data-mode="dark"\]/.test(tokensText),
    detail: 'tokens.base.css 에 [data-mode="dark"] 블록',
  });
  results.push({ name: "shared/data.js", pass: existsSync(join(base, "shared/data.js")), detail: "세 안 공통 더미 데이터" });

  for (const c of only) {
    const dir = join(base, c);
    const problems = [];
    const css = join(dir, "concept.css");
    if (!existsSync(css)) problems.push("concept.css 없음");
    else {
      const lits = readFileSync(css, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").match(new RegExp(COLOR_LITERAL, "g")) || [];
      if (lits.length) problems.push(`concept.css 색 리터럴 ${lits.length}개 — 컨셉 단계 색은 세 안 동일(tokens.base.css)`);
    }
    if (!existsSync(join(dir, "index.html"))) problems.push("index.html 없음");
    for (const s of screens) {
      const f = join(dir, s.file);
      if (!existsSync(f)) {
        problems.push(`${s.file} 없음`);
        continue;
      }
      for (const p of checkScreenHtml(readFileSync(f, "utf8"), { id: s.id, concept: c, shell: s.shell })) {
        problems.push(`${s.file}: ${p}`);
      }
    }
    results.push({
      name: `컨셉 ${c} · ${screens.length}화면 계약`,
      pass: problems.length === 0,
      detail: problems.length ? problems.join(" / ") : "통과",
    });
  }
  return results;
}

/** design/00-spec/local-sources.json — local 경로 또는 repo 사본에 파일이 1개 이상 있어야 한다 */
export function checkProjectSources(root = ".") {
  const cfgPath = join(root, "design/00-spec/local-sources.json");
  if (!existsSync(cfgPath)) return [{ name: "프로젝트 참고 자료", pass: false, detail: "design/00-spec/local-sources.json 없음" }];
  const cfg = JSON.parse(readFileSync(cfgPath, "utf8"));
  const hasFiles = (dir) => existsSync(dir) && readdirSync(dir).some((f) => !f.startsWith("."));
  return cfg.sources.map((s) => {
    const where = hasFiles(s.local) ? "local" : hasFiles(join(root, s.repo)) ? "repo" : null;
    return {
      name: `참고 자료 · ${s.id}`,
      pass: !!where,
      detail: where ? `${where}: ${where === "local" ? s.local : s.repo}` : `비어 있음 — ${s.repo} 에 복사하거나 PC에서 실행 (${s.local})`,
    };
  });
}
