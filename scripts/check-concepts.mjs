#!/usr/bin/env node
/**
 * check-concepts.mjs · Phase 2b 컨셉 시안 검사
 *
 *   npm run check:concepts                 # 정적 검사 (브라우저 없음)
 *   npm run check:concepts -- --render     # + Playwright 렌더 검사 · 스크린샷
 *   npm run check:concepts -- --only A     # 한 안만
 *
 * 렌더 검사
 *   - 그리드 헤더 30 · 행 28 (data-grid-header / data-grid-row)
 *   - 세 안의 data-bind 값이 화면별로 같다 (같은 데이터)
 *   - data-status 는 아이콘(svg 또는 [data-icon]) + 텍스트
 *   - 보이는 primary 액션 1개
 *   - 1280 폭에서 가로 스크롤 없음
 *   - 스크린샷: design/02b-concepts/_shots/{concept}-{screen}@{w}.png (+ 홈 다크)
 */
import { mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { getArg, hasFlag, createLog } from "./lib/cli.mjs";
import { CONCEPTS, checkConceptsStatic, loadScreens } from "./lib/concept-rules.mjs";

const log = createLog();
const BASE = "design/02b-concepts";
const SHOTS = join(BASE, "_shots");

function print(title, results) {
  log("", "reset");
  log(title, results.every((r) => r.pass) ? "green" : "red");
  for (const r of results) {
    log(`  ${r.pass ? "✓" : "✗"} ${r.name}`, r.pass ? "green" : "red");
    log(`    ${r.detail}`, "reset");
  }
}

async function render(only) {
  let chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch {
    return [{ name: "렌더 검사", pass: false, detail: "playwright 없음 — npm install && npx playwright install chromium" }];
  }
  mkdirSync(SHOTS, { recursive: true });
  const screens = loadScreens();
  const browser = await chromium.launch();
  const results = [];
  const binds = {}; // screen -> concept -> {key: text}

  for (const c of only) {
    for (const s of screens) {
      const url = pathToFileURL(resolve(BASE, c, s.file)).href;
      const problems = [];
      for (const [w, h] of [[1920, 1080], [1280, 800]]) {
        const page = await browser.newPage({ viewport: { width: w, height: h } });
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.goto(url);
        await page.waitForTimeout(300);
        await page.screenshot({ path: join(SHOTS, `${c}-${s.id}@${w}.png`) });
        if (w === 1280) {
          const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
          if (overflow > 0) problems.push(`1280 가로 스크롤 ${overflow}px`);
        } else {
          const info = await page.evaluate(() => {
            const vis = (el) => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
            const h = (sel) => [...document.querySelectorAll(sel)].filter(vis).map((e) => Math.round(e.getBoundingClientRect().height));
            const statuses = [...document.querySelectorAll("[data-status]")].filter(vis);
            return {
              header: h("[data-grid-header]"),
              rows: h("[data-grid-row]"),
              primary: [...document.querySelectorAll('[data-action="primary"]')].filter(vis).length,
              badStatus: statuses.filter((e) => !e.querySelector("svg,[data-icon]") || !e.textContent.trim()).length,
              binds: Object.fromEntries([...document.querySelectorAll("[data-bind]")].map((e) => [e.dataset.bind, e.textContent.trim()])),
            };
          });
          if (info.header.some((v) => v !== 30)) problems.push(`그리드 헤더 높이 ${[...new Set(info.header)]} (30)`);
          if (info.rows.some((v) => v !== 28)) problems.push(`그리드 행 높이 ${[...new Set(info.rows)]} (28)`);
          if (info.primary !== 1) problems.push(`보이는 primary ${info.primary}개`);
          if (info.badStatus) problems.push(`아이콘·텍스트 없는 상태 표시 ${info.badStatus}개`);
          ((binds[s.id] ??= {})[c] = info.binds);
          if (s.id === "home") {
            await page.evaluate(() => (document.documentElement.dataset.mode = "dark"));
            await page.screenshot({ path: join(SHOTS, `${c}-${s.id}-dark@${w}.png`) });
          }
        }
        await page.close();
      }
      results.push({ name: `렌더 ${c} · ${s.id}`, pass: !problems.length, detail: problems.join(" / ") || "통과" });
    }
  }
  await browser.close();

  if (only.length > 1) {
    for (const [sid, byConcept] of Object.entries(binds)) {
      const [first, ...rest] = Object.keys(byConcept);
      const diffs = [];
      for (const c of rest) {
        const keys = new Set([...Object.keys(byConcept[first]), ...Object.keys(byConcept[c])]);
        for (const k of keys) {
          if (byConcept[first][k] !== byConcept[c][k]) diffs.push(`${c}.${k}`);
        }
      }
      results.push({
        name: `같은 데이터 · ${sid}`,
        pass: !diffs.length,
        detail: diffs.length ? `${first} 와 다른 data-bind: ${diffs.slice(0, 6).join(", ")}${diffs.length > 6 ? " …" : ""}` : `${Object.keys(byConcept).join("·")} 동일`,
      });
    }
  }
  results.push({ name: "스크린샷", pass: true, detail: SHOTS });
  return results;
}

const only = getArg("--only") ? getArg("--only").split(",") : CONCEPTS;
const stat = checkConceptsStatic(".", only);
print("🎨 Phase 2b · 컨셉 시안 (정적)", stat);
let all = stat;
if (hasFlag("--render")) {
  const r = await render(only);
  print("🖥  Phase 2b · 컨셉 시안 (렌더)", r);
  all = [...stat, ...r];
}
const passed = all.filter((r) => r.pass).length;
log(`\n  ${passed}/${all.length} 통과`, passed === all.length ? "green" : "yellow");
process.exitCode = passed === all.length ? 0 : 1;
