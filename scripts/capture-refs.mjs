#!/usr/bin/env node
/**
 * capture-refs.mjs · 무료 레퍼런스 캡처 (uibowl 대체)
 *
 * design/01-references/sources.json 에 사람이 승인한 공개 URL 만 Playwright 로 캡처한다.
 * 로그인이 필요한 서비스는 manual 항목으로 두고 사람이 직접 캡처해 넣는다.
 *
 * 사용:
 *   npm run capture:refs                 # 전체
 *   npm run capture:refs -- --only fiori-table,krds-breadcrumb
 *   npm run capture:refs -- --dry-run    # URL·파일명만 확인
 *
 * 산출:
 *   design/01-references/raw/web/{concept}-{id}-{pattern}.png
 *   design/01-references/raw/sources.log.json   (출처·캡처 시각·결과)
 *
 * 준비 (최초 1회):
 *   npm install            (devDependencies 의 playwright)
 *   npx playwright install chromium
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = "design/01-references";
const SOURCES = join(ROOT, "sources.json");
const RAW = join(ROOT, "raw");
const WEB = join(RAW, "web");
const LOG = join(RAW, "sources.log.json");

export const CONCEPTS = ["A", "B", "C", "common"];
export const PATTERNS = ["dashboard", "data-grid", "form", "shell", "status", "chart", "interaction", "other"];

export function fileNameFor(src) {
  return `${src.concept}-${src.id}-${src.pattern}.png`;
}

export function validateSources(cfg) {
  const errors = [];
  const ids = new Set();
  for (const [i, s] of [...(cfg.sources || []), ...(cfg.manual || []), ...(cfg.figma || [])].entries()) {
    const where = `#${i + 1} (${s.id ?? "id 없음"})`;
    if (!s.id || !/^[a-z0-9-]+$/.test(s.id)) errors.push(`${where}: id 는 소문자 kebab-case`);
    if (ids.has(s.id)) errors.push(`${where}: id 중복`);
    ids.add(s.id);
    if (!CONCEPTS.includes(s.concept)) errors.push(`${where}: concept 는 ${CONCEPTS.join("/")}`);
    if (!PATTERNS.includes(s.pattern)) errors.push(`${where}: pattern 은 ${PATTERNS.join("/")}`);
  }
  for (const s of cfg.sources || []) {
    if (!/^https:\/\//.test(s.url || "")) errors.push(`${s.id}: url 은 https:// 로 시작`);
    if (s.capture === "selector" && !s.selector) errors.push(`${s.id}: capture=selector 면 selector 필수`);
  }
  for (const m of cfg.manual || []) {
    if (!m.file) errors.push(`${m.id}: manual 항목은 file 필수 (raw/manual/ 아래)`);
  }
  // figma 항목은 이 스크립트가 캡처하지 않는다 (Figma MCP 로 reference-collector 가 받는다). 형식만 검사.
  for (const f of cfg.figma || []) {
    if (!/^[0-9a-zA-Z]{22,128}$/.test(f.fileKey || "")) errors.push(`${f.id}: figma 항목은 fileKey 필수`);
    if (!/^\d+:\d+$/.test(f.nodeId || "")) errors.push(`${f.id}: figma nodeId 는 "123:456" 형식`);
    if (!f.origin) errors.push(`${f.id}: figma 항목은 origin(원 출처) 필수`);
  }
  return errors;
}

function parseArgs(argv) {
  const args = { only: null, dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--dry-run") args.dryRun = true;
    else if (argv[i] === "--only") args.only = new Set(argv[++i].split(","));
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!existsSync(SOURCES)) {
    console.error(`✗ ${SOURCES} 가 없습니다. reference-collector 가 초안을 만들고 사용자 승인을 받아야 합니다.`);
    process.exit(1);
  }
  const cfg = JSON.parse(readFileSync(SOURCES, "utf8"));
  const errors = validateSources(cfg);
  if (errors.length) {
    console.error("✗ sources.json 오류\n  " + errors.join("\n  "));
    process.exit(1);
  }

  const vp = { width: 1920, height: 1080, deviceScaleFactor: 1, ...(cfg.viewport || {}) };
  const maxHeight = cfg.maxHeight ?? 4000;
  const dismiss = cfg.dismissSelectors ?? [];
  const targets = (cfg.sources || []).filter((s) => !args.only || args.only.has(s.id));

  if (args.dryRun) {
    for (const s of targets) console.log(`${fileNameFor(s)}  ←  ${s.url}`);
    return;
  }

  let chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch {
    console.error("✗ playwright 가 없습니다. `npm install` 후 `npx playwright install chromium` 을 실행하세요.");
    process.exit(1);
  }

  mkdirSync(WEB, { recursive: true });
  const prev = existsSync(LOG) ? JSON.parse(readFileSync(LOG, "utf8")) : { entries: {} };
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: vp.deviceScaleFactor,
    locale: "ko-KR",
  });

  let ok = 0;
  for (const s of targets) {
    const file = fileNameFor(s);
    const out = join(WEB, file);
    const page = await context.newPage();
    try {
      await page.goto(s.url, { waitUntil: "networkidle", timeout: 45000 }).catch(async (e) => {
        // networkidle 이 안 오는 사이트(채팅 위젯 등)는 load 까지만 기다린다
        if (!/Timeout/.test(String(e))) throw e;
      });
      for (const sel of [...dismiss, ...(s.dismiss || [])]) {
        await page.locator(sel).first().click({ timeout: 1500 }).catch(() => {});
      }
      await page.waitForTimeout(s.waitMs ?? 1200);

      if (s.capture === "selector") {
        await page.locator(s.selector).first().screenshot({ path: out, timeout: 10000 });
      } else if (s.capture === "viewport") {
        await page.screenshot({ path: out });
      } else {
        const h = await page.evaluate(() => document.documentElement.scrollHeight);
        await page.screenshot({
          path: out,
          fullPage: true,
          clip: { x: 0, y: 0, width: vp.width, height: Math.min(h, maxHeight) },
        });
      }
      prev.entries[s.id] = { ...s, file: `web/${file}`, status: "ok", captured_at: new Date().toISOString() };
      ok++;
      console.log(`✓ ${file}`);
    } catch (e) {
      prev.entries[s.id] = { ...s, file: `web/${file}`, status: "failed", error: String(e).slice(0, 300), captured_at: new Date().toISOString() };
      console.log(`✗ ${s.id} — ${String(e).split("\n")[0]}`);
    } finally {
      await page.close();
    }
  }
  await browser.close();

  for (const m of cfg.manual || []) {
    const exists = existsSync(join(RAW, m.file.replace(/^raw\//, "")));
    prev.entries[m.id] = { ...m, status: exists ? "ok" : "missing" };
    console.log(`${exists ? "✓" : "…"} manual ${m.id} ${exists ? "" : "(아직 없음 — 사람이 캡처해 넣는다)"}`);
  }

  prev.updated_at = new Date().toISOString();
  writeFileSync(LOG, JSON.stringify(prev, null, 2) + "\n");
  console.log(`\n${ok}/${targets.length} 캡처 성공 · 기록: ${LOG}`);
  if (ok < targets.length) process.exitCode = 2;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
