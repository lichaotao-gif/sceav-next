/* ═══════════════════════════════════════════════════
   0. Hero Banner Carousel
═══════════════════════════════════════════════════ */
(function () {
  const track   = document.getElementById("carousel-track");
  const dots    = document.querySelectorAll(".carousel-dot");
  const btnPrev = document.getElementById("carousel-prev");
  const btnNext = document.getElementById("carousel-next");
  if (!track) return;

  const total = track.children.length;
  let current = 0;
  let autoTimer = null;

  function goTo(idx) {
    current = (idx + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle("active", i === current));
  }

  function startAuto() {
    autoTimer = setInterval(() => goTo(current + 1), 5000);
  }
  function resetAuto() {
    clearInterval(autoTimer);
    startAuto();
  }

  btnPrev?.addEventListener("click", () => { goTo(current - 1); resetAuto(); });
  btnNext?.addEventListener("click", () => { goTo(current + 1); resetAuto(); });

  dots.forEach(dot => {
    dot.addEventListener("click", () => { goTo(+dot.dataset.slide); resetAuto(); });
  });

  // Touch / swipe support
  let startX = 0;
  track.addEventListener("touchstart", e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener("touchend", e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 42) { goTo(dx < 0 ? current + 1 : current - 1); resetAuto(); }
  });

  startAuto();
})();

/* ═══════════════════════════════════════════════════
   1. Scroll-aware header
═══════════════════════════════════════════════════ */
const header = document.querySelector("[data-header]");

function updateHeader() {
  header.classList.toggle("is-scrolled", window.scrollY > 56);
}
window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

/* ═══════════════════════════════════════════════════
   2. Parallax on hero poster
═══════════════════════════════════════════════════ */
const parallaxItems = document.querySelectorAll("[data-parallax]");
function updateParallax() {
  if (window.innerWidth <= 768) return;
  const y = window.scrollY;
  parallaxItems.forEach(el => {
    const speed = Number(el.dataset.parallax || 0);
    el.style.transform = `translate3d(0, ${y * speed}px, 0)`;
  });
}
window.addEventListener("scroll", updateParallax, { passive: true });

/* ═══════════════════════════════════════════════════
   3. Scroll reveal
═══════════════════════════════════════════════════ */
const revealEls = document.querySelectorAll(".reveal");
const revealObs = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObs.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.08, rootMargin: "0px 0px -36px 0px" }
);
revealEls.forEach(el => revealObs.observe(el));

/* ═══════════════════════════════════════════════════
   4. Mobile menu
═══════════════════════════════════════════════════ */
const mobileMenu   = document.querySelector("[data-mobile-menu]");
const menuToggle   = document.querySelector("[data-menu-toggle]");
const menuCloseEls = document.querySelectorAll("[data-menu-close]");

menuToggle?.addEventListener("click", () => {
  const open = mobileMenu.hidden;
  mobileMenu.hidden = !open;
  document.body.style.overflow = open ? "hidden" : "";
});

menuCloseEls.forEach(el => el.addEventListener("click", () => {
  mobileMenu.hidden = true;
  document.body.style.overflow = "";
}));

/* ═══════════════════════════════════════════════════
   5. Login modal
═══════════════════════════════════════════════════ */
const loginModal   = document.getElementById("login-modal");
const loginOpenEls = document.querySelectorAll("[data-login-open]");
const loginCloseEl = document.querySelector("[data-login-close]");

function openLoginModal() {
  loginModal.hidden = false;
  document.body.style.overflow = "hidden";
}
function closeLoginModal() {
  loginModal.hidden = true;
  document.body.style.overflow = "";
}

loginOpenEls.forEach(el => el.addEventListener("click", openLoginModal));
loginCloseEl?.addEventListener("click", closeLoginModal);
loginModal?.addEventListener("click", e => {
  if (e.target === loginModal) closeLoginModal();
});

/* ─── Login tabs ─── */
const tabs = document.querySelectorAll(".login-tab");
const panes = {
  phone:   document.getElementById("pane-phone"),
  account: document.getElementById("pane-account"),
};

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    const key = tab.dataset.tab;
    Object.keys(panes).forEach(k => { panes[k].hidden = k !== key; });
  });
});

/* ─── Send-code countdown ─── */
const sendCodeBtn = document.getElementById("send-code-btn");
let cdTimer = null;

sendCodeBtn?.addEventListener("click", () => {
  const phone = document.getElementById("input-phone").value.trim();
  if (!/^1\d{10}$/.test(phone)) {
    alert("请输入正确的手机号");
    return;
  }
  let seconds = 60;
  sendCodeBtn.disabled = true;
  sendCodeBtn.textContent = `${seconds}s 后重发`;
  cdTimer = setInterval(() => {
    seconds--;
    if (seconds <= 0) {
      clearInterval(cdTimer);
      sendCodeBtn.disabled = false;
      sendCodeBtn.textContent = "获取验证码";
    } else {
      sendCodeBtn.textContent = `${seconds}s 后重发`;
    }
  }, 1000);
});

/* ─── Login submit (mock) ─── */
const loginSubmit = document.getElementById("login-submit");
loginSubmit?.addEventListener("click", () => {
  // 这里只做前端 mock，后端接入时替换为真实 API
  const activeTab = document.querySelector(".login-tab.active")?.dataset.tab;
  let valid = false;
  let username = "用户";

  if (activeTab === "phone") {
    const phone = document.getElementById("input-phone").value.trim();
    const code  = document.getElementById("input-code").value.trim();
    if (/^1\d{10}$/.test(phone) && code.length >= 4) {
      valid = true;
      username = phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
    } else {
      alert("请填写手机号和验证码");
    }
  } else {
    const account  = document.getElementById("input-account").value.trim();
    const password = document.getElementById("input-password").value;
    if (account && password.length >= 6) {
      valid = true;
      username = account;
    } else {
      alert("请填写账号和密码（密码至少6位）");
    }
  }

  if (valid) {
    setLoggedIn(username);
    closeLoginModal();
  }
});

/* ═══════════════════════════════════════════════════
   6. Auth state helpers
═══════════════════════════════════════════════════ */
const loginBtn  = document.getElementById("login-btn");
const userMenu  = document.getElementById("user-menu");
const userNameEl  = document.getElementById("user-name");
const userAvatarEl = document.getElementById("user-avatar");

function setLoggedIn(name) {
  // Persist across page refresh (mock only)
  sessionStorage.setItem("sceav_user", name);
  loginBtn.hidden  = true;
  userMenu.hidden  = false;
  userNameEl.textContent   = name;
  // Avatar: first char of name
  userAvatarEl.textContent = name.charAt(0).toUpperCase() || "我";
}

function setLoggedOut() {
  sessionStorage.removeItem("sceav_user");
  loginBtn.hidden = false;
  userMenu.hidden = true;
}

// Restore session on load
const savedUser = sessionStorage.getItem("sceav_user");
if (savedUser) setLoggedIn(savedUser);

// Logout
document.querySelector("[data-logout]")?.addEventListener("click", () => {
  setLoggedOut();
  closeUserDropdown();
});

/* ─── User dropdown toggle ─── */
const userDropdown = document.getElementById("user-dropdown");
const userToggle   = document.querySelector("[data-user-toggle]");

function openUserDropdown()  { userDropdown.hidden = false; }
function closeUserDropdown() { userDropdown.hidden = true;  }

userToggle?.addEventListener("click", e => {
  e.stopPropagation();
  userDropdown.hidden ? openUserDropdown() : closeUserDropdown();
});

document.addEventListener("click", e => {
  if (!userMenu?.contains(e.target)) closeUserDropdown();
});

/* ═══════════════════════════════════════════════════
   7. Events filter tabs
═══════════════════════════════════════════════════ */
const efTabs = document.querySelectorAll(".ef-tab");
const eventCards = document.querySelectorAll(".event-card");

efTabs.forEach(tab => {
  tab.addEventListener("click", () => {
    efTabs.forEach(t => t.classList.remove("ef-tab--active"));
    tab.classList.add("ef-tab--active");
    const filter = tab.dataset.ef;
    eventCards.forEach(card => {
      const match = filter === "all" || card.dataset.status === filter;
      card.style.display = match ? "" : "none";
    });
  });
});

/* ═══════════════════════════════════════════════════
   8. Timeline scroll animation
═══════════════════════════════════════════════════ */
const tlWrap = document.querySelector(".tl-wrap");
if (tlWrap) {
  const tlObs = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("tl-animate");
          tlObs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  tlObs.observe(tlWrap);
}
