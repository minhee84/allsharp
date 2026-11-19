# 수집 레퍼런스

**수집일:** 2026-11-19
**설계기준:** `PRD.md` 요약 (원본 설계기준 MD는 아직 `design/00-spec/`에 없음)
**총 수집:** figma 16장 · web 0장 · manual 0장 · internal 0장
**컨셉별:** A 4 · B 4 · C 2 · 공통 6

이미지 파일은 커밋하지 않는다 (`.gitignore`). 다시 받으려면 `sources.json`의 `figma` 항목을 Figma MCP로 내보낸다.

## Figma 원본

| 파일 | 링크 | 용도 |
|---|---|---|
| ALL# 2.0 UI/UX 리뉴얼 · 레퍼런스 보드 | `oWDrnexiwnDqEUn3Tg7gdT` (보드 `3:9`, 컨셉 A4 시트 `29:2`~`29:479`) | 레퍼런스 이미지 15장 + 컨셉별 7축 분석 |
| KRDS v1.0.0 (Community) | `GsE0cb9nUMj0h9BFuEQbEl` | KRDS 컴포넌트 원본 (현재 Tab만) |
| ALL# 2.0 컨셉 시안 1안 (KRDS + ALL#) | `27dbVkkdAtsHXsHNCoI51x` | **시안** — 레퍼런스 아님. `../concept-drafts/A-krds/`에 3화면 저장 |

## 컨셉별

### A · KRDS + ALL#
| 파일 | 원 출처 | 패턴 | 보려는 것 |
|---|---|---|---|
| figma/A-krds-display-settings-other.png | KRDS v1.0.0 Figma | other | 글자 크기 5단계, 화면 모드 3종, 모달 형태 |
| figma/A-krds-typography-other.png | KRDS Figma — 타이포그래피 | other | 타입 스케일, 행간 150%, 굵기 2단계 |
| figma/A-krds-table-data-grid.png | KRDS Figma — Table(표) | data-grid | 헤더 면 색, 가로 구분선만 사용 |
| figma/A-krds-tab-shell.png | KRDS v1.0.0 Community — Tab | shell | line/fill · primary/secondary 탭 |

### B · 상업용 ERP + ALL#
| 파일 | 원 출처 | 패턴 | 보려는 것 |
|---|---|---|---|
| figma/B-toss-tds-keyvisual-other.png | 앱인토스 TDS | other | 색·타이포 톤 |
| figma/B-dribbble-glass-dashboard-dashboard.png | Dribbble — Glassmorphism Dashboard (Leon Abramovic) | dashboard | 글래스 적용 범위 |
| figma/B-ms365-copilot-glass-other.png | Microsoft Design | other | 글래스 배경 |
| figma/B-flex-modal-form.png | flex 헬프센터 | form | 모달·폼 형태 |

### C · 해외 ERP + ALL#
| 파일 | 원 출처 | 패턴 | 보려는 것 |
|---|---|---|---|
| figma/C-fiori-horizon-worklist-data-grid.png | SAP Community | data-grid | 워크리스트 밀도, 툴바 |
| figma/C-ms365-dashboard-dashboard.png | Microsoft Design | dashboard | 대시보드 구성 |

### 공통 · 그리드·차트
| 파일 | 원 출처 | 패턴 |
|---|---|---|
| figma/common-mercury-dashboard-dashboard.png | Mercury Demo | dashboard |
| figma/common-mercury-transactions-data-grid.png | Mercury Demo | data-grid |
| figma/common-attio-records-data-grid.png | Attio | data-grid |
| figma/common-mercury-insights-chart.png | Mercury Demo | chart |
| figma/common-tremor-charts-chart.png | Tremor | chart |
| figma/common-tremor-microviz-chart.png | Tremor (**출처 확인 필요** — 보드에 이 이미지의 출처 표기 없음) | chart |

## 게이트 1 부족분

- **C 컨셉 1장 더 필요** (현재 2장). 후보: Fiori 오브젝트 페이지·폼, Fluent 2 데이터 그리드, Dynamics 365 목록 화면
- **AS-IS 1장 이상 필요** — `internal/`에 ALL# 현재 화면 (개인정보 마스킹)
- `sources.json`의 web 항목 9개는 아직 미승인·미확인 (클라우드 세션에서 해당 사이트 접속 불가)
- manual 요청: `B-amaranth-dashboard-dashboard.png`, `A-krds-form-form.png` (KRDS 폼은 KRDS Figma 키트에서 받을 수도 있음)
