/**
 * 게이트 1 · 레퍼런스 규칙 (uibowl 대체 · 무료 수집)
 *
 * raw/ 아래 이미지를 재귀로 모아 다음을 판정한다.
 *   - 컨셉(A/B/C)별 최소 장수   : 파일명 접두어 `{A|B|C}-`
 *   - 자체 자료(AS-IS) 최소 장수 : raw/internal/ 아래
 *   - 출처 추적                  : web/ · manual/ 의 파일은 sources.log.json 에 있어야 한다
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

export const IMAGE_EXT = /\.(png|jpe?g|webp)$/i;
export const CONCEPT_KEYS = ["A", "B", "C"];
export const MIN_PER_CONCEPT = 3;
export const MIN_INTERNAL = 1;

export function listImages(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...listImages(p));
    else if (IMAGE_EXT.test(name)) out.push(p);
  }
  return out;
}

/** files: raw 기준 상대경로 목록 (posix 구분자) */
export function summarize(files) {
  const perConcept = Object.fromEntries(CONCEPT_KEYS.map((k) => [k, 0]));
  let internal = 0;
  let external = [];
  for (const f of files) {
    const base = f.split("/").pop();
    if (f.startsWith("internal/")) {
      internal++;
      continue;
    }
    external.push(f);
    const m = base.match(/^([ABC])-/);
    if (m) perConcept[m[1]]++;
  }
  return { perConcept, internal, external };
}

export function untracked(external, log) {
  const known = new Set(
    Object.values(log?.entries ?? {})
      .filter((e) => e.status === "ok")
      .map((e) => (e.file ?? "").replace(/^raw\//, "")),
  );
  return external.filter((f) => !known.has(f));
}

export function checkReferenceRaw(rawDir) {
  const files = listImages(rawDir).map((p) => relative(rawDir, p).split(sep).join("/"));
  const { perConcept, internal, external } = summarize(files);
  const logPath = join(rawDir, "sources.log.json");
  const log = existsSync(logPath) ? JSON.parse(readFileSync(logPath, "utf8")) : null;
  const orphan = untracked(external, log);

  const short = CONCEPT_KEYS.filter((k) => perConcept[k] < MIN_PER_CONCEPT);
  return [
    {
      name: `컨셉별 레퍼런스 ${MIN_PER_CONCEPT}장 이상 (A·B·C)`,
      pass: short.length === 0,
      detail:
        CONCEPT_KEYS.map((k) => `${k} ${perConcept[k]}장`).join(" · ") +
        (short.length ? ` — 부족: ${short.join(", ")} (파일명 접두어 A-/B-/C-)` : ""),
    },
    {
      name: `자체 자료(AS-IS) ${MIN_INTERNAL}장 이상`,
      pass: internal >= MIN_INTERNAL,
      detail: `raw/internal/ ${internal}장`,
    },
    {
      name: "출처 기록 (sources.log.json)",
      pass: orphan.length === 0,
      detail: orphan.length
        ? `기록 없는 파일 ${orphan.length}개: ${orphan.slice(0, 5).join(", ")}${orphan.length > 5 ? " …" : ""} — capture:refs 재실행 또는 sources.json manual 에 등록`
        : `외부 레퍼런스 ${external.length}개 모두 기록됨`,
    },
  ];
}
