# ALL# 2.0 시안 3안 — PRD

이 하네스의 요구사항 원본은 **설계기준 문서**입니다.

- 원본: `design/00-spec/` 아래 `ALL# 2.0 시안3안 설계기준 및 고려사항` MD (사람이 넣는다)
- 원본을 고치면 이 파일의 "요약"도 함께 맞춘다 (캡처 증거 해시의 입력이다)

## 요약

- 대상: 공사·공단·지자체 출자·출연기관 행정 실무자용 ERP (데스크톱 1920×1080, 최소 1280)
- 비교 화면 3개: ① 홈 대시보드(T1) ② 인사현황(재직기준일)(T2) ③ 근무기준설정(T3 또는 T6)
- 컨셉 3안: A. KRDS + ALL# · B. 상업용 ERP + ALL# · C. 해외 ERP + ALL#
  - 컨셉 단계에서는 세 안 모두 같은 ALL# 블루와 같은 더미 데이터를 쓴다
- 컨셉 확정 후 색 테마 3안: Trust Blue · Calm Teal(기본안) · Graphite Indigo × light/dark
- 원칙 우선순위: 가독성 > 정보량 > 심미성
- 그리드: 행 28px · 헤더 30px (세 안 동일), DHTMLX Suite 9.4

## 레퍼런스 수집 방식

uibowl 등 유료 DB를 쓰지 않는다. 무료 경로 3가지만 쓴다 (`.claude/agents/reference-collector.md`).

1. 자체 자료 — AS-IS 화면, 의견접수, 마이크로인터랙션 예제 (`raw/internal/`)
2. 공개 디자인 시스템·데모 페이지 Playwright 캡처 (`npm run capture:refs`)
3. 로그인이 필요한 서비스는 사람이 수동 캡처 (`raw/manual/`)

예시 프로젝트(허들링 앱) PRD는 `docs/examples/huddling-PRD.md`에 보관.
