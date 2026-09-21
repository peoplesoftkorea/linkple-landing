/* ==========================================================================
   Linkple 랜딩 — 인터랙션
   1) 모바일 메뉴 토글  2) 스크롤 리빌  3) CTA 모달(접근성 포함)
   ========================================================================== */
(function () {
  "use strict";

  /* JS 활성 표시 — CSS가 이때만 리빌 초기 숨김을 적용(no-JS는 콘텐츠 그대로 노출) */
  document.documentElement.classList.add("js");

  /* ---------- 1) 모바일 메뉴 토글 ---------- */
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("navMenu");

  function closeMenu() {
    menu.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "메뉴 열기");
  }
  function openMenu() {
    menu.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "메뉴 닫기");
  }
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      open ? closeMenu() : openMenu();
    });
    // 메뉴 링크 클릭 시 자동 닫힘(모바일)
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
  }

  /* ---------- 2) 스크롤 리빌 (IntersectionObserver) ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    // 폴백: 그냥 보이게
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- 3) CTA 모달 ---------- */
  var form = document.getElementById("waitlistForm");
  var modal = document.getElementById("modal");
  var lastFocused = null;

  function openModal() {
    lastFocused = document.activeElement;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    var focusTarget = modal.querySelector("[autofocus], button");
    if (focusTarget) focusTarget.focus();
    document.addEventListener("keydown", onKeydown);
  }
  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.removeEventListener("keydown", onKeydown);
    if (lastFocused) lastFocused.focus();
  }
  function onKeydown(e) {
    if (e.key === "Escape") closeModal();
  }

  if (form && modal) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = document.getElementById("email");
      // 간단한 유효성 검사(브라우저 기본 + 확인)
      if (email && !email.checkValidity()) {
        email.reportValidity();
        return;
      }
      openModal();
      form.reset();
    });
    modal.querySelectorAll("[data-close]").forEach(function (el) {
      el.addEventListener("click", closeModal);
    });
  }

  /* ---------- 현재 연도 (푸터, 있으면) ---------- */
  var yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
