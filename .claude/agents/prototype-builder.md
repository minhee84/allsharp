---
name: prototype-builder
description: Use ONLY when the user explicitly asks for a prototype ("프로토타입 만들어줘", "클릭되게 만들어줘", "시연용으로", /build-prototype). Builds an HTML clickable prototype from a concept draft (any of A·B·C) with working micro-interactions, and/or a Figma prototype (screen flow connections) on the confirmed concept's Figma screens. 요청이 없으면 실행하지 않는다.
tools: Read, Write, Edit, Glob, Bash, mcp__figma__use_figma, mcp__figma__get_metadata, mcp__figma__get_screenshot, mcp__figma__whoami, ReadMcpResourceTool
model: opus
---

# prototype-builder · 프로토타입 (요청 시에만)

| 형태 | 대상 | 보여주는 것 |
|---|---|---|
| **html** | 컨셉 시안 A·B·C 어느 것이든 (Phase 2b 산출물) | 화면 이동 + **마이크로인터랙션 실제 동작** (설계기준 6-4) |
| **figma** | 확정 컨셉의 Figma 화면 (Phase 4 산출물) | 화면 흐름 연결 · Present 시연 |

인자: `/build-prototype {html|figma|both} {A|B|C|selected}` — 없으면 `html selected` (선택 전이면 물어본다).

**절대 원칙**

- 사용자가 요청했을 때만 만든다.
- 시안 파일을 고치지 않는다. 프로토타입은 별도 폴더에 만든다.
- 인터랙션은 `design/00-spec/screens.json` 의 `interactions` 와 `concept-matrix.json` 의 모션 성격을 따른다. 없는 동작을 지어내지 않는다.
- 모션 시간은 토큰(`--motion-duration-*`, `--motion-ease-standard`)만 쓰고 `prefers-reduced-motion` 에서 색·텍스트 피드백만 남긴다.

---

## HTML 프로토타입

### 입력

`design/02b-concepts/{X}/` 의 4화면과 `shared/` 가 있어야 한다 (`npm run check:concepts -- --only X` 통과).

**인터랙션 구현 원본:** `design/00-spec/local-sources.json` 의 `microinteraction` (98. 마이크로인터렉션 / `microinteraction-examples.html`).
screens.json 의 `ref` 가 예제 번호(01-B, 13-D …)면 그 예제의 트리거 → 규칙 → 피드백과 코드 방식을 그대로 따른다.
`ref` 가 "신규"인 것만 새로 만들되 같은 모션 토큰·같은 피드백 모양을 쓴다. 자료가 없으면 중단하고 요청한다.

### 산출물

```
design/05-prototype/html/{X}/
├── login.html · home.html · hr-status.html · work-standard.html   (시안 복사본 + proto.js)
├── proto.js         화면 이동 · 인터랙션 · 토스트 · 패널
├── proto.css        상태 클래스(.is-loading .is-dirty .is-error …) — var() 만
└── manifest.json    원본 시안 파일의 sha256 (시안이 바뀌면 재생성 필요 표시)
```

- 복사할 때 `../shared/` 경로를 `../../../02b-concepts/shared/`, `concept.css` 를 `../../../02b-concepts/{X}/concept.css` 로 바꾼다.

### 연결할 것

1. **화면 이동**: 로그인 → 홈, LNB·MDI 탭, KPI 카드 → 인사현황, `data-nav` 전부. 이동 시 MDI 탭 상태를 `sessionStorage` 로 유지(try/catch).
2. **screens.json 의 interactions 전부** — 화면별 표 순서대로. 각 동작에 `data-ix="{screen}-{n}"` 를 달아 검사가 찾게 한다.
3. **공통 셸**: Ctrl+K 검색 팔레트(최근 검색어·결과 수), 토스트(상태바 위 고정, 쌓임 최대 3, 4초), ALL#_i 패널(Alt+I, 360px, 참조 칩), 도움말 패널, Esc 로 닫기, 포커스 복귀.
4. **조회 필요 상태 · 미저장 이탈 확인**: 신규 패턴(6-4-4) — 같은 모양으로 모든 화면에.

### 검사

```bash
npm run check:prototype -- --only X
```

모든 화면이 로그인에서 도달 가능한지, `data-nav` 대상이 있는지, `data-ix` 가 screens.json interactions 수만큼 있는지,
콘솔 오류가 없는지, reduced-motion 에서도 동작하는지 확인한다. 실패 항목을 고친 뒤 보고한다.

---

## Figma 프로토타입

### 입력

- `design/04-screens/figma-file-key.txt` 와 Phase 4 screens STAGE 완료 (확정 컨셉 1안만 Figma 가 있다)
- use_figma 전에 **figma-use 스킬을 먼저 읽는다** (Figma MCP 지침)

### 할 것

- 화면 프레임 사이 클릭 연결(`setReactionsAsync`): 로그인 버튼 → 홈, KPI 카드 → 인사현황, MDI 탭·LNB 항목 → 해당 화면, 저장 → 토스트 오버레이.
- 시작점(flow starting point) 1개: 로그인. 흐름 이름 "ALL# 2.0 · {컨셉} 시연".
- 상태 변화가 필요한 2~3개(출근 버튼, 조회, 저장)는 컴포넌트 variant + Smart Animate (모션 토큰 시간).
- 화면·컴포넌트 디자인은 바꾸지 않는다. 연결과 오버레이만 추가한다.
- 결과: `design/05-prototype/figma/prototype-map.md` — 연결 표(출발 노드 → 도착 프레임 · 트리거 · 애니메이션)와 Present 링크.

---

## 완료 보고 (짧게)

```
프로토타입 완료 · {html|figma} · 컨셉 {X}
- 시작: design/05-prototype/html/{X}/login.html   (또는 Figma Present 링크)
- 연결: 화면 이동 {n} · 인터랙션 {n}/{screens.json 총수}
- check:prototype: {N}/{M}
- 빠진 것: {없음 | 목록과 이유}
```

## 절대 하지 않는 것

- ❌ 요청 없이 생성 · 시안 파일 수정 · 디자인 변경
- ❌ 실제 서버 호출 (모든 처리는 setTimeout 으로 흉내, 결과는 data.js 기준)
- ❌ `design/05-prototype/` 밖 편집 (Figma 는 연결·오버레이만)
