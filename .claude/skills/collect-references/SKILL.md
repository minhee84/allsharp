---
name: collect-references
description: 무료 레퍼런스 수집 (자체 AS-IS 자료 + 공개 디자인 시스템 Playwright 캡처 + 수동 캡처). Phase 1의 첫 단계.
argument-hint: [설계기준 파일 경로]
context: fork
agent: reference-collector
background: false
---

# /collect-references

설계기준을 바탕으로 컨셉 3안(A KRDS · B 상업용 ERP · C 해외 ERP)별 레퍼런스를 무료 경로로 수집한다.

**요청**: $ARGUMENTS

> 이 스킬은 `reference-collector` 서브에이전트에서 실행된다 (프론트매터 `agent:` 로 고정).
> 역할 경계·중단 조건은 `.claude/agents/reference-collector.md` 에 있다.
> 분석은 하지 않는다 — `reference-analyzer`가 이어받는다.

## 인자

- **설계기준 파일 경로** (선택): 없으면 `design/00-spec/` 아래 MD 를 쓴다.

## 산출물

```
design/01-references/
├── sources.json            (사용자 승인한 수집 목록 · 커밋)
└── raw/
    ├── internal/           (AS-IS · 사람이 넣음 · 커밋 안 함)
    ├── web/                (capture:refs 결과 · 커밋 안 함)
    ├── manual/             (로그인 필요 화면 · 사람이 넣음 · 커밋 안 함)
    ├── sources.log.json    (출처·캡처 시각 · 커밋)
    └── README.md           (수집 리포트 · 커밋)
```

## 목표

- 컨셉별 3장 이상 + AS-IS 1장 이상 (`npm run check:references` 가 검사)
- 권장: 컨셉별 5장, 화면 유형(dashboard · data-grid · form) 고르게

## 다음 단계

- Yes → `/analyze-references`
- No → 여기서 중단, 나중에 재개 가능
