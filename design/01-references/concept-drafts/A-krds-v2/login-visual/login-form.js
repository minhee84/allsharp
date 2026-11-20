// 로그인 폼 — Figma 7:2(A안) 문구·구성 그대로. 세 안 공통.
(function () {
  const BI = "../../../../assets/characters/allsharp-bi.svg";
  const BI_WHITE = "../../../../assets/characters/allsharp-bi-white.svg"; // 다크 배경용
  const html = `
  <div class="topbar">
    <div class="seg" role="group" aria-label="화면 모드">
      <button type="button" data-theme-btn="light" aria-pressed="true"><i data-lucide="sun"></i>라이트</button>
      <button type="button" data-theme-btn="dark" aria-pressed="false"><i data-lucide="moon"></i>다크</button>
    </div>
    <button type="button" class="ghost"><i data-lucide="type"></i>글자 크기 보통</button>
  </div>
  <div class="center">
    <form class="form" onsubmit="return false" autocomplete="off">
      <img class="bi bi-light" src="${BI}" alt="ALL#(올샵)">
      <img class="bi bi-dark" src="${BI_WHITE}" alt="ALL#(올샵)">
      <h1>로그인</h1>
      <p class="desc">소속 기관을 선택하고 업무 계정으로 로그인하세요.</p>
      <div class="field">
        <label for="f-org">기관</label>
        <div class="control">
          <select id="f-org"><option>충남도립대학교</option></select>
          <span class="suffix deco"><i data-lucide="chevron-down"></i></span>
        </div>
      </div>
      <div class="field">
        <label for="f-id">아이디</label>
        <div class="control"><input id="f-id" value="admin03"></div>
      </div>
      <div class="field">
        <label for="f-pw">비밀번호</label>
        <div class="control">
          <input id="f-pw" type="password" value="password12">
          <button type="button" class="suffix" id="f-eye" aria-label="비밀번호 보기"><i data-lucide="eye-off"></i></button>
        </div>
        <p class="hint" id="f-caps" role="status"><i data-lucide="triangle-alert"></i>Caps Lock이 켜져 있습니다.</p>
      </div>
      <div class="row">
        <label class="check"><input type="checkbox" checked>아이디 저장</label>
        <a href="#">비밀번호 재설정</a>
      </div>
      <button class="btn-primary" type="submit"><i data-lucide="log-in"></i>로그인</button>
      <div class="helps">
        <a href="#"><i data-lucide="book-open"></i>매뉴얼</a>
        <a href="#"><i data-lucide="headphones"></i>지원요청</a>
        <a href="#"><i data-lucide="monitor"></i>원격지원</a>
      </div>
      <p class="notice"><i data-lucide="info"></i>5회 연속 실패 시 계정이 잠깁니다. Chrome·Edge 최신 버전을 권장하며, 공용 PC에서는 로그아웃 후 브라우저를 닫아 주세요.</p>
    </form>
  </div>
  <div class="footer"><strong>개인정보처리방침</strong><span>이용약관</span><span>© 2026 ALL# 2.0</span></div>`;

  const side = document.querySelector(".form-side");
  side.innerHTML = html;

  // 테마
  const setTheme = (t) => {
    document.documentElement.dataset.theme = t;
    side.querySelectorAll("[data-theme-btn]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.themeBtn === t));
    window.dispatchEvent(new CustomEvent("themechange", { detail: t }));
  };
  side.querySelectorAll("[data-theme-btn]").forEach((b) => b.addEventListener("click", () => setTheme(b.dataset.themeBtn)));
  // 다크 버전 HTML 은 <html data-theme="dark"> 로 시작한다
  if (document.documentElement.dataset.theme === "dark") setTheme("dark");

  // Caps Lock
  const pw = side.querySelector("#f-pw"), caps = side.querySelector("#f-caps");
  const capsCheck = (e) => caps.classList.toggle("on", !!(e.getModifierState && e.getModifierState("CapsLock")));
  pw.addEventListener("keydown", capsCheck); pw.addEventListener("keyup", capsCheck);
  pw.addEventListener("blur", () => caps.classList.remove("on"));

  // 비밀번호 보기
  const eye = side.querySelector("#f-eye");
  eye.addEventListener("click", () => {
    const show = pw.type === "password";
    pw.type = show ? "text" : "password";
    eye.setAttribute("aria-label", show ? "비밀번호 숨기기" : "비밀번호 보기");
    eye.innerHTML = `<i data-lucide="${show ? "eye" : "eye-off"}"></i>`;
    window.lucide && lucide.createIcons();
  });

  // 폼 입력 중 여부 → 비주얼이 움직임을 줄이는 데 쓴다
  side.addEventListener("focusin", (e) => { if (e.target.matches("input,select")) window.dispatchEvent(new CustomEvent("formfocus", { detail: true })); });
  side.addEventListener("focusout", () => setTimeout(() => {
    if (!side.contains(document.activeElement) || !document.activeElement.matches("input,select"))
      window.dispatchEvent(new CustomEvent("formfocus", { detail: false }));
  }, 0));
})();
