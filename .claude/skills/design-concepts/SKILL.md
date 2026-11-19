---
name: design-concepts
description: 컨셉 3안(A KRDS · B 상업용 ERP · C 해외 ERP) × 4화면(로그인 · 홈 · 인사현황 · 근무기준설정) HTML 시안과 비교 페이지 생성. Phase 2b.
argument-hint: [A|B|C|all|shared|compare]
context: fork
agent: concept-designer
background: false
---

# /design-concepts

같은 구조·같은 데이터·같은 색 위에 스타일만 다른 HTML 시안 3안을 만든다.

**요청**: $ARGUMENTS

> `concept-designer` 서브에이전트에서 실행된다. 규칙은 `.claude/agents/concept-designer.md`.

## 인자

- `all` (기본) — shared → A → B → C → compare
- `A` · `B` · `C` — 한 안만 (shared 가 없으면 먼저 만든다)
- `shared` · `compare` — 공통 파일 · 비교 페이지만

## 산출물

`design/02b-concepts/` — shared/, A/, B/, C/, compare.html, concept-review.md

## 다음 단계

- 리뷰 후 사용자가 1안 선택 → `concept-selection.md` → `/generate-rules`
- 시연이 필요하면 `/build-prototype html {안}`
