import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkReferenceRaw, summarize, untracked } from "../scripts/lib/reference-rules.mjs";
import { fileNameFor, validateSources } from "../scripts/capture-refs.mjs";

function makeRaw(files, log) {
  const dir = mkdtempSync(join(tmpdir(), "refs-"));
  for (const f of files) {
    mkdirSync(join(dir, f, ".."), { recursive: true });
    writeFileSync(join(dir, f), "x");
  }
  if (log) writeFileSync(join(dir, "sources.log.json"), JSON.stringify(log));
  return dir;
}

const full = [
  ...["A", "B", "C"].flatMap((c) => [1, 2, 3].map((n) => `web/${c}-s${n}-data-grid.png`)),
  "internal/asis-home.png",
];
const logFor = (files) => ({
  entries: Object.fromEntries(files.map((f, i) => [`id${i}`, { file: f, status: "ok" }])),
});

test("게이트 1 · 컨셉별 3장 + AS-IS + 출처 기록이면 통과", () => {
  const ext = full.filter((f) => !f.startsWith("internal/"));
  const checks = checkReferenceRaw(makeRaw(full, logFor(ext)));
  assert.deepEqual(checks.map((c) => c.pass), [true, true, true], JSON.stringify(checks, null, 2));
});

test("게이트 1 · 한 컨셉이 2장이면 실패하고 부족 컨셉을 알려준다", () => {
  const files = full.filter((f) => f !== "web/C-s3-data-grid.png");
  const ext = files.filter((f) => !f.startsWith("internal/"));
  const [concept] = checkReferenceRaw(makeRaw(files, logFor(ext)));
  assert.equal(concept.pass, false);
  assert.match(concept.detail, /부족: C/);
});

test("게이트 1 · AS-IS 가 없으면 실패", () => {
  const files = full.filter((f) => !f.startsWith("internal/"));
  const [, internal] = checkReferenceRaw(makeRaw(files, logFor(files)));
  assert.equal(internal.pass, false);
});

test("게이트 1 · 출처 기록 없는 외부 이미지는 실패 (internal 은 대상 아님)", () => {
  const ext = full.filter((f) => !f.startsWith("internal/"));
  const files = [...full, "manual/B-unknown-dashboard.png"];
  const [, , src] = checkReferenceRaw(makeRaw(files, logFor(ext)));
  assert.equal(src.pass, false);
  assert.match(src.detail, /B-unknown/);
});

test("summarize · common- 접두어는 컨셉 장수에 들어가지 않는다", () => {
  const s = summarize(["web/common-dhtmlx-data-grid.png", "web/A-x-shell.png"]);
  assert.deepEqual(s.perConcept, { A: 1, B: 0, C: 0 });
});

test("untracked · status failed 는 기록으로 인정하지 않는다", () => {
  const log = { entries: { a: { file: "web/A-a-shell.png", status: "failed" } } };
  assert.deepEqual(untracked(["web/A-a-shell.png"], log), ["web/A-a-shell.png"]);
});

test("capture-refs · figma 항목은 fileKey·nodeId·origin 을 검사한다", () => {
  const ok = { id: "krds-tab", concept: "A", pattern: "shell", fileKey: "GsE0cb9nUMj0h9BFuEQbEl", nodeId: "340:31688", origin: "KRDS" };
  assert.deepEqual(validateSources({ figma: [ok] }), []);
  const errs = validateSources({ figma: [{ ...ok, fileKey: "x", nodeId: "340-31688", origin: "" }] });
  for (const re of [/fileKey/, /nodeId/, /origin/]) assert.ok(errs.some((e) => re.test(e)), `${re}: ${errs}`);
});

test("capture-refs · 파일명 규칙과 sources 검증", () => {
  assert.equal(fileNameFor({ concept: "C", id: "fiori-table", pattern: "data-grid" }), "C-fiori-table-data-grid.png");
  const errs = validateSources({
    sources: [
      { id: "ok-one", concept: "A", pattern: "shell", url: "https://example.org" },
      { id: "Bad_ID", concept: "Z", pattern: "nope", url: "http://x" },
      { id: "ok-one", concept: "B", pattern: "form", url: "https://e.org", capture: "selector" },
    ],
    manual: [{ id: "m1", concept: "B", pattern: "dashboard" }],
  });
  for (const re of [/kebab/, /concept/, /pattern/, /https/, /중복/, /selector 필수/, /file 필수/]) {
    assert.ok(errs.some((e) => re.test(e)), `${re} 기대: ${errs.join(" | ")}`);
  }
});
