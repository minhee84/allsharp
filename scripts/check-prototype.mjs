#!/usr/bin/env node
/**
 * check-prototype.mjs · HTML 프로토타입 검사
 *
 *   npm run check:prototype -- --only A
 *
 * 정적: 4화면 + proto.js, data-nav 대상 존재, 로그인에서 모든 화면 도달,
 *       data-ix 수 ≥ screens.json interactions 수, manifest 해시 = 현재 시안 (아니면 재생성 필요)
 * 렌더: 각 화면 콘솔 오류 0 (reduced-motion), 로그인 primary 클릭 → 홈 이동
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { getArg, createLog } from "./lib/cli.mjs";
import { loadScreens } from "./lib/concept-rules.mjs";

const log = createLog();
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

export function navGraph(htmlById) {
  const g = {};
  for (const [id, html] of Object.entries(htmlById)) {
    g[id] = [...new Set([...html.matchAll(/data-nav="([^"]+)"/g)].map((m) => m[1]))];
  }
  return g;
}

export function reachable(graph, start) {
  const seen = new Set([start]);
  const q = [start];
  while (q.length) for (const n of graph[q.shift()] ?? []) if (!seen.has(n)) (seen.add(n), q.push(n));
  return seen;
}

export function checkPrototypeStatic(dir, concept, screens, root = ".") {
  const r = [];
  const html = {};
  const missing = [];
  for (const s of screens) {
    const f = join(dir, s.file);
    if (existsSync(f)) html[s.id] = readFileSync(f, "utf8");
    else missing.push(s.file);
  }
  r.push({ name: "화면 파일", pass: !missing.length, detail: missing.length ? `없음: ${missing.join(", ")}` : `${screens.length}개` });
  const noProto = Object.entries(html).filter(([, h]) => !/src="proto\.js"/.test(h)).map(([id]) => id);
  r.push({ name: "proto.js 연결", pass: existsSync(join(dir, "proto.js")) && !noProto.length, detail: noProto.length ? `연결 없음: ${noProto.join(", ")}` : "통과" });

  const g = navGraph(html);
  const ids = new Set(screens.map((s) => s.id));
  const dangling = Object.entries(g).flatMap(([from, tos]) => tos.filter((t) => !ids.has(t)).map((t) => `${from}→${t}`));
  r.push({ name: "data-nav 대상", pass: !dangling.length, detail: dangling.length ? `없는 화면: ${dangling.join(", ")}` : "통과" });
  const start = screens[0].id;
  const seen = reachable(g, start);
  const unreached = screens.map((s) => s.id).filter((id) => !seen.has(id));
  r.push({ name: `${start} 에서 모든 화면 도달`, pass: !unreached.length, detail: unreached.length ? `도달 불가: ${unreached.join(", ")}` : "통과" });

  const short = screens
    .filter((s) => html[s.id])
    .map((s) => {
      const have = new Set([...html[s.id].matchAll(new RegExp(`data-ix="${s.id}-\\d+"`, "g"))].map((m) => m[0])).size;
      return { id: s.id, have, need: (s.interactions || []).length };
    })
    .filter((x) => x.have < x.need);
  r.push({ name: "인터랙션 연결 (data-ix)", pass: !short.length, detail: short.length ? short.map((x) => `${x.id} ${x.have}/${x.need}`).join(" · ") : "screens.json 전부" });

  const mf = join(dir, "manifest.json");
  if (!existsSync(mf)) r.push({ name: "manifest.json", pass: false, detail: "원본 시안 해시 없음" });
  else {
    const m = JSON.parse(readFileSync(mf, "utf8"));
    const stale = Object.entries(m.sources || {}).filter(([p, h]) => !existsSync(join(root, p)) || sha(join(root, p)) !== h).map(([p]) => p);
    r.push({ name: "시안과 동기화", pass: !stale.length, detail: stale.length ? `시안 변경됨 → 재생성 필요: ${stale.join(", ")}` : `${Object.keys(m.sources || {}).length}개 파일 일치` });
  }
  return r;
}

async function renderChecks(dir, screens) {
  let chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch {
    return [{ name: "렌더 검사", pass: false, detail: "playwright 없음" }];
  }
  const browser = await chromium.launch();
  const r = [];
  for (const s of screens) {
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    await page.goto(pathToFileURL(resolve(dir, s.file)).href);
    await page.waitForTimeout(300);
    r.push({ name: `콘솔 오류 · ${s.id}`, pass: !errors.length, detail: errors.slice(0, 2).join(" / ") || "0건" });
    await page.close();
  }
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(pathToFileURL(resolve(dir, screens[0].file)).href);
  let landed = null;
  try {
    for (const input of await page.locator("input:visible").all()) {
      const type = await input.getAttribute("type");
      if (type === "checkbox" || type === "radio") continue;
      await input.fill(type === "password" ? "demo-password" : "demo").catch(() => {});
    }
    await page.locator('[data-action="primary"]').first().click();
    await page.waitForFunction(() => document.body.dataset.screen === "home", null, { timeout: 4000 });
    landed = "home";
  } catch {
    landed = await page.evaluate(() => document.body.dataset.screen).catch(() => null);
  }
  r.push({ name: "로그인 → 홈", pass: landed === "home", detail: `도착: ${landed}` });
  await browser.close();
  return r;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const screens = loadScreens();
  const only = (getArg("--only") || "A,B,C").split(",");
  let all = [];
  for (const c of only) {
    const dir = join("design/05-prototype/html", c);
    if (!existsSync(dir)) {
      log(`\n- ${c}: 프로토타입 없음 (요청 시 /build-prototype html ${c})`, "reset");
      continue;
    }
    const res = [...checkPrototypeStatic(dir, c, screens), ...(await renderChecks(dir, screens))];
    log(`\n🧭 프로토타입 · ${c}`, res.every((x) => x.pass) ? "green" : "red");
    for (const x of res) log(`  ${x.pass ? "✓" : "✗"} ${x.name}\n    ${x.detail}`, x.pass ? "green" : "red");
    all = all.concat(res);
  }
  const ok = all.filter((x) => x.pass).length;
  log(`\n  ${ok}/${all.length} 통과`, ok === all.length ? "green" : "yellow");
  process.exitCode = ok === all.length ? 0 : 1;
}
