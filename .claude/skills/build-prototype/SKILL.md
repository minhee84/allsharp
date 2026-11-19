---
name: build-prototype
description: 요청 시에만 프로토타입 생성. html = 컨셉 시안(A·B·C)에 화면 이동과 마이크로인터랙션 연결, figma = 확정안 Figma 화면에 흐름 연결.
argument-hint: [html|figma|both] [A|B|C|selected]
context: fork
agent: prototype-builder
background: false
---

# /build-prototype

**요청**: $ARGUMENTS

> `prototype-builder` 서브에이전트에서 실행된다. 규칙은 `.claude/agents/prototype-builder.md`.

## 인자

- 형태: `html` (기본) · `figma` · `both`
- 대상: `A` · `B` · `C` · `selected` (기본 — concept-selection.md 의 선택안)

`figma` 는 확정 컨셉의 Phase 4 Figma 화면이 있어야 한다.

## 산출물

- html: `design/05-prototype/html/{안}/` (시작: login.html)
- figma: Figma 파일의 프로토타입 연결 + `design/05-prototype/figma/prototype-map.md`
