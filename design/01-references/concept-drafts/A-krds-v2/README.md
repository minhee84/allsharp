# 1안 v2 (KRDS + ALL#) — 시안 탐색

> 게이트 밖 탐색 산출물이다 (Phase 2b 정식 산출물 아님 · `check-phase` 대상 아님).
> 기존 1안은 `../A-krds/` PNG 3장을 그대로 두고, 레이아웃부터 새로 그렸다.

- Figma: https://www.figma.com/design/wDJDQTBnDTp5gKcqx7Yo86 (팀 프로젝트 693296142)
- 작성일: 2026-11-19

## 파일 구성

| 페이지 | 내용 |
|---|---|
| 00 기존 1안 (참고) | `../A-krds/` PNG 3장 · 잠금 |
| 01 Foundations | 색 변수 Primitives → Semantic(Light/Dark) · Dimension(간격·radius) · 텍스트 스타일 13 · 그림자 E1~E3 |
| 02 Components | lucide 0.460.0 아이콘 71 · Button · Input · Badge · Checkbox · Toggle · Tab · Chip · MDI Tab · LNB Item · Shell(GNB · StatusBar · ALL#_i) |
| 03 1안 v2 화면 | 00 로그인 · 01 홈 · 02 인사현황(재직기준일) · 03 근무기준설정 · 01 홈 다크 모드 · 변경점 메모 |

## 기존 1안 대비 변경점

- **셸**: LNB 파란 면 → 흰 면 + 선택 강조, 브레드크럼을 제목 위로, ALL#_i는 높이 36 + 콘텐츠 하단 여백 60으로 주 액션을 가리지 않음
- **홈**: KPI 카드 6개 → '오늘 처리할 일' 레일 + 문서 목록. KPI 6항목은 레일(결재 대기·반려·요청·지출진행 대기), 예산 대비 지출 '합계'(예산 집행률), 오늘 근태(잔여 연차)로 옮김
- **인사현황**: 조회 한 줄 + 상세 조건 접기, 재직구분 요약 칩 필터, 선택 시 일괄작업 바
- **근무기준설정**: 섹션 목차 + 다열 폼, 하단 고정 저장 바, '저장 (3)' → '변경 3건' 배지 + '저장'(숫자 접미어 금지 규칙)

## 규칙 검증 (2026-11-19)

기준: CLAUDE.md 절대 원칙 · `design/00-spec/fixed-conditions.md` · concept-matrix A · `docs/figma-layout-safety.md`.
`design-rules.md`가 아직 없어서(Phase 3 전) design-auditor와 게이트 검사는 적용 대상이 아니다. 하네스 `scripts/figma-lint.js` 규칙으로 대신 검사했다.

- 통과: 셸 치수(GNB 56 · LNB 240 · MDI 36 · 상태바 28) · 그리드 행 28 · radius 스케일 · 상태 4색 · 다크 홈 · 색 바인딩 semantic 100%
- 수정함:
  - 컬렉션 이름을 하네스 규칙에 맞춤(`Semantic` → `semantic`, `Primitives` → `primitive`)
  - `Dimension` 직접 바인딩 2,052건 → semantic 별칭(`radius/*`, `space/*`)으로 재바인딩
  - 값으로 칠한 색 → Toggle Knob · ALL#_i 링을 semantic으로 바인딩
  - textAutoResize NONE 18건 → HEIGHT
  - T3 목록 '대표이사' 4px 넘침 → 직급 열 64로 넓힘
- 일괄 정규화 (2차):
  - 간격 949곳을 4~48 스케일로 맞춤. 가운데 값이면 세로 방향은 작은 쪽, 가로 방향은 큰 쪽. 48 초과는 48
  - 간격 2,909곳을 `space/*` 토큰에 바인딩
  - 아이콘 146개: 12/14 → 16, 18 → 20
  - 재검사 결과 스케일 밖 간격 0 · 아이콘 0
  - 후속 보정: 홈 문서 목록 푸터 여백(8) · 목록 HUG, C안 폼 열 440 고정 폭 가운데 배치, C안 입력칸 내부 레이아웃 재계산
- ALL#_i 버튼의 펭귄 얼굴 → sparkles 아이콘 마크 (컴포넌트 원본에서 수정, 화면·컴포넌트에 남은 이미지 0)
- 남은 위반 (결정 필요):
  - 로그인 Hero 44 · Lead 18 (타입 스케일 밖)
  - 고정 높이 컨테이너 약 390개 (design-rules에 fixed로 선언해야 함)
  - 글꼴 Noto Sans KR (규격 Pretendard GOV, H2 SemiBold 없음)
  - 차트 영역은 오토레이아웃 예외

## 가정 · 확인 필요

- 글꼴: Figma에 Pretendard GOV가 없어 Noto Sans KR로 대체 (텍스트 스타일만 바꾸면 교체)
- 로고: 공식 ALL# BI(Figma `oWDrnexiwnDqEUn3Tg7gdT` node 42:2)를 벡터 컴포넌트로 적용 — `Logo/ALL# Mark`(GNB), `Logo/ALL# BI (올샵)`(로그인). 원본 SVG: `design/assets/characters/allsharp-bi.svg` (`Logo.svg`는 'Huddling Club' 로고라 미사용)
- 이미지: ALL#_i `perdi-face.png` (로그인은 AS-IS 구조를 따라 캐릭터 이미지 없이 중앙 정렬로 변경)
- 로그인: AS-IS는 참고만 하고 새로 그림 — 좌측 브랜드 패널(bg/brand 남색 + 그리드 라인 + BI 곡선 모티프, AS-IS 태그라인을 헤드라인으로, AS-IS 하단 아이콘 줄 → 라벨 있는 업무 모듈 타일 + ALL#_i 타일) · 우측 폼(로그인 방식 탭 아이디/간편인증/인증서 · 기관 · 아이디 · 비밀번호 · 아이디 저장/비밀번호 재설정). 공지사항은 요청에 따라 제외(screens.json의 '공지사항 3건'과 다름 — 확인 필요). 간편인증·인증서 탭은 가정. 다크 모드 프레임 별도
- 로그인 3안 비교(선택 대기): `03 1안 v2 화면` 페이지 섹션 '00 로그인 · 시안 3안 비교'(y 2440)에 A안 브랜드 분할형 · B안 미니멀 중앙형 · C안 업무 지원형 · 참고 A안 다크 모드를 나란히 두고 각 안 아래에 콘셉트/강점/주의/추천 상황 요약. 메인 행 (0,0)은 확정안 자리표시. 로그인 화면에서 펭귄(perdi-face) 이미지 제거
- 로그인 배경 물결 모션 (Figma 프로토타입)
  - `02 Components` 페이지의 `Motion/BI Wave · On Brand 860 / On Light 1920 / On Light 1160` 세트를 씀
  - Phase 1 ↔ 2 를 After delay → Smart animate 6s ease-in-out 으로 왕복
  - 적용: A안 패널 · A안 다크 · B안 전체 배경 · C안 오른쪽 안내 영역
  - 플로우 시작점 4개 등록
  - 1안 모션 규칙(최소·명료, 150~200ms)의 예외 → 확정하면 design-rules에 '로그인 한정 앰비언트 모션'으로 기록해야 함. reduced-motion 대응은 HTML 구현에서만 가능
- 반투명 면은 alpha 프리미티브(alpha/white-*, alpha/sky-*) → brand/* 시맨틱으로 처리(페인트 opacity는 모드 전환 시 유실되어 사용 안 함)
- Primary(2026-11-20 변경): A. Trust Blue #1D4ED8 = `theme-a-trust-blue/700`. 테마 3색 스케일 `theme-a-trust-blue` · `theme-b-calm-teal` · `theme-c-graphite-indigo` (50~950) 를 primitive 에 추가. `theme` 컬렉션(모드 A. Trust Blue · B. Calm Teal · C. Graphite Indigo)의 `primary/50~950` 이 각 스케일을 참조하고, action/primary·hover·subtle·border, text/link, border/focus, bg/selected, chart/current 가 `theme/primary/*` 를 참조. 프레임에 theme 모드를 지정하면 테마 전환. C(고대비형)는 theme `neutral/light/*`·`neutral/dark/*` 로 text/secondary·tertiary·disabled, border/default·strong 을 강화 (Light: gray/800·600·500·450·600, Dark: d-text·d-text2·d-text3·d-border-hc·d-text3). 신규 primitive gray/450 #838D9B, gray/d-border-hc #66707C. gray/500 #6B7684 → #616B79 (흐린 글자 대비 4.26 → 4.99:1). GNB 화면 설정 패널: `Shell/화면 설정 패널`(부품 Settings/Theme Option · Mode Option · Size Option. 화면 모드는 밝게/어둡게/시스템 설정 + 미니 미리보기, 미리보기 강조색은 theme/primary 를 따름), 시연 화면은 03 페이지 섹션 "화면 설정 · 테마 3안" (Light 700/800/50/200, Dark 600/500/950/800·링크·포커스·차트 400) → 다크 action 은 아래 2026-11-20 대비 보정으로 변경
- 대비 보정(2026-11-20, Figma 파일 `wDJDQTBnDTp5gKcqx7Yo86`): 6개 모드 조합(Light/Dark × A/B/C) 글자 4.5:1 · 그래픽(테두리·강조·포커스·차트) 3:1 전부 통과 (토큰 조합 438건, 화면 글자 5,741개)
  - `gray/d-text3` #7C8794 → #8B95A2 (다크 흐린 글자 4.44 → 5.34:1, C 다크 비활성·진한 테두리도 함께 밝아짐)
  - `text/on-brand-muted` Light: blue/200 → blue/100 #D4E5F3 (로그인 브랜드 패널 "AI 업무 도우미" 3.9 → 통과)
  - `status/success` Light: green/700 → 신규 `green/800` #166534 · `status/warning` Light: amber/700 → 신규 `amber/800` #92400E (surface-sunken 위 4.31 → 6.1:1)
  - `action/primary` Dark: primary/600 → 신규 theme 변수 `action/dark/primary` (A `theme-a-trust-blue/600` · B `theme-b-calm-teal/700` · C 신규 `theme-c-graphite-indigo/550` #5956EB). 흰 글자 5.17 / 5.47 / 5.31, 그래픽 3.45 / 3.26 / 3.36
  - `action/primary-hover` Dark: primary/500 → primary/800 (다크에서도 hover 는 어둡게, 흰 글자 7.6:1 이상)
  - `neutral/light/border-strong` A·B: gray/300 → gray/500 (1.6 → 4.6:1 이상) · `neutral/dark/border-strong` A·B: gray/720 → 신규 `gray/d-border-strong` #6A7480 (1.78 → 3.05:1 이상). C 는 그대로
- LNB 접힘 프로토타입: 01·02·03·홈 125%·홈 다크 5화면 ↔ 각 접힘 화면(섹션 "LNB 접힘 (64)"), 메뉴 접기/펼치기 클릭 → Smart Animate 200ms cubic-bezier(.2,.8,.2,1). 접힘 화면 대메뉴 아이콘 hover → 툴팁 (prototype 컬렉션 boolean `lnb-tooltip/*` 를 MOUSE_ENTER/LEAVE 로 켜고 끔). 플로 시작점 "LNB 접기/펼치기 · …" 5개
- 브랜드 색: BI 남색 #005395 = `blue/600` (이전 action/primary). 브랜드 면 `bg/brand` 는 기존 `blue/700` 그대로, 스케일 재산출. 빨강 #CE1B22·하늘 #28AAE1·먹 #231F20은 `brand/*` → `logo/*` 변수로 로고 전용(빨강은 오류색과 혼동되어 UI 미사용). 상태 4색은 fixed-conditions.md 값 그대로
- `design/04-screens/figma-file-key.txt`(8MaPdwz8…)는 이 계정으로 열리지 않음 — Phase 4용 키라 건드리지 않음
- MDI 탭 활성 표시 보정(2026-11-20, 웹접근성 · 가독성 > 정보량 > 심미성): 기존엔 활성/비활성 배경이 surface ↔ surface-subtle(1.02:1)로 거의 같고 모든 탭이 같은 진한 테두리라 구분이 안 됨. 면 밝기 3단계로 정리 — 탭 바 `bg/surface-sunken` < 비활성 `bg/canvas` < 활성 `bg/surface`
  - State=Active: `bg/surface` · 테두리 `border/strong` 좌·상·우 · 상단 강조선 2→3px `action/primary`(6.7:1) · SemiBold · 하단 열림(본문과 연결)
  - State=Default: `bg/canvas` · 경계선 신규 semantic `border/medium`(Light `gray/450` #838D9B, bg/canvas 대비 3.1:1 · Dark `gray/d-border-strong`) 좌·상·우 · 자체 하단선 `Bottom line`(`border/strong` 1px) · `text/secondary`. 경계선은 inner shadow 3개로 그려 하단선 위로 걸치지 않음. 옅은 `border/default` 는 비활성(disabled)처럼 보여 제외
  - 탭 바(`MDI Tabs` 20곳) 하단선을 프레임 테두리 → 탭 뒤 `Baseline` 사각형(`border/strong` 1px)으로 바꿔 활성 탭 아래에서만 끊김
  - 색 외 단서(면 연결·굵기·테두리 진하기) 함께 사용 — WCAG 1.4.1 · 1.4.11
  - 확인 필요: 신규 `border/medium` 은 theme C(고대비) 전용 값이 없음 · 탭 3px 강조선은 간격 스케일 밖(선 두께) → design-rules 에 예외로 기록
