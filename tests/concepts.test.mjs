import { test } from "node:test";
import assert from "node:assert/strict";
import { checkScreenHtml, findColorLiterals, SHELL_REGIONS } from "../scripts/lib/concept-rules.mjs";
import { navGraph, reachable, checkPrototypeStatic } from "../scripts/check-prototype.mjs";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const shell = SHELL_REGIONS.map((r) => `<div data-region="${r}"></div>`).join("");
const page = ({ id = "home", concept = "A", body = shell, extra = "" } = {}) => `<!doctype html><html><head>
<link rel="stylesheet" href="../shared/tokens.base.css"><link rel="stylesheet" href="concept.css">
<script src="../shared/data.js"></script>${extra}</head>
<body data-screen="${id}" data-concept="${concept}">${body}<button data-action="primary">조회</button></body></html>`;

test("컨셉 화면 · 계약을 지키면 문제 0건", () => {
  assert.deepEqual(checkScreenHtml(page(), { id: "home", concept: "A", shell: true }), []);
});

test("컨셉 화면 · 셸 누락·primary 2개·색 리터럴을 잡는다", () => {
  const html = page({ body: '<div data-region="gnb"></div><button data-action="primary">x</button>', extra: "<style>.a{color:#1d4ed8}</style>" });
  const p = checkScreenHtml(html, { id: "home", concept: "A", shell: true }).join(" | ");
  assert.match(p, /T0 셸 누락: lnb/);
  assert.match(p, /primary" 2개/);
  assert.match(p, /색 리터럴/);
});

test("컨셉 화면 · 로그인은 셸 검사 대상이 아니다", () => {
  assert.deepEqual(checkScreenHtml(page({ id: "login", concept: "B", body: "" }),{ id: "login", concept: "B", shell: false }), []);
});

test("컨셉 화면 · data-screen·data-concept 불일치", () => {
  const p = checkScreenHtml(page({ id: "home", concept: "A" }), { id: "hr-status", concept: "C", shell: true }).join(" | ");
  assert.match(p, /data-screen="hr-status"/);
  assert.match(p, /data-concept="C"/);
});

test("색 리터럴 · style 속성·svg fill·rgba 탐지, var() 는 통과", () => {
  assert.equal(findColorLiterals('<div style="color:var(--color-text)"></div>').length, 0);
  assert.equal(findColorLiterals('<svg fill="#fff"></svg><i style="background: rgba(0,0,0,.1)"></i>').length, 2);
});

test("프로토타입 · 도달성·인터랙션 수·manifest 검사", () => {
  const screens = [
    { id: "login", file: "login.html", interactions: [{}] },
    { id: "home", file: "home.html", interactions: [{}, {}] },
    { id: "hr", file: "hr.html", interactions: [] },
  ];
  const dir = mkdtempSync(join(tmpdir(), "proto-"));
  writeFileSync(join(dir, "proto.js"), "");
  writeFileSync(join(dir, "login.html"), '<script src="proto.js"></script><a data-nav="home" data-ix="login-1">');
  writeFileSync(join(dir, "home.html"), '<script src="proto.js"></script><a data-nav="ghost" data-ix="home-1">');
  writeFileSync(join(dir, "hr.html"), '<script src="proto.js"></script>');
  const r = Object.fromEntries(checkPrototypeStatic(dir, "A", screens, dir).map((x) => [x.name, x]));
  assert.equal(r["data-nav 대상"].pass, false);
  assert.match(r["login 에서 모든 화면 도달"].detail, /hr/);
  assert.match(r["인터랙션 연결 (data-ix)"].detail, /home 1\/2/);
  assert.equal(r["manifest.json"].pass, false);
  assert.deepEqual([...reachable(navGraph({ a: 'data-nav="b"', b: 'data-nav="a"' }), "a")].sort(), ["a", "b"]);
});
