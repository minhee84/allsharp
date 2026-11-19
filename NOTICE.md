# NOTICE

이 저장소는 [figmatutor-info/designflowharness](https://github.com/figmatutor-info/designflowharness)
(MIT License, 커밋 `bd10c29`, 2026-09-20)를 바탕으로 ALL# 2.0 시안 작업에 맞게 수정했습니다.

## 원본에서 바꾼 것

- Phase 1 레퍼런스 수집: uibowl MCP → 무료 수집(자체 자료 + Playwright 공개 페이지 캡처 + 수동 캡처)
  - `.claude/agents/reference-collector.md`, `.claude/skills/collect-references/SKILL.md`
  - `scripts/capture-refs.mjs`, `scripts/lib/reference-rules.mjs`, `design/01-references/sources.example.json`
  - 게이트 1 조건: 컨셉(A·B·C)별 3장 + AS-IS 1장 + 출처 기록
- 예시 PRD를 `docs/examples/huddling-PRD.md`로 이동, 루트 `PRD.md`는 ALL# 요약

- Phase 2b 컨셉 시안 3안(HTML) 추가: `concept-designer`, `/design-concepts`, `scripts/check-concepts.mjs`, `scripts/lib/concept-rules.mjs`
- 프로토타입(요청 시) 추가: `prototype-builder`, `/build-prototype`, `scripts/check-prototype.mjs`
- `design/00-spec/`: screens.json(4화면) · concept-matrix.json · fixed-conditions.md · local-sources.json
- 게이트 2 화면 수: 5개 이상 → screens.json 목록과 일치

## 아직 원본 그대로인 것 (다음 단계에서 변경 예정)

- 모바일 390×844 전제 (verify-design-rules, figma-audit, check-phase)
- design-rules §G 모바일 특화, 대표 화면 2안 비교, §I 캐릭터 이미지 슬롯
- `design/assets/characters/` 예시 이미지 (기존 회귀 테스트가 참조)

## 원본 라이선스

원본 `package.json`에 MIT로 표기되어 있으며, 그 조건을 따릅니다.
