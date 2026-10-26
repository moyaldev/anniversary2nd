/* =========================================================
   TO THE MOON & BACK — ANNIVERSARY WEBSITE
   Personalize the values in CONFIG first.
   ========================================================= */

const CONFIG = {
  yourName: "Yusuf",
  partnerName: "Amira",
  // Format: YYYY-MM-DD. Replace with your real anniversary date.
  anniversaryDate: "2024-10-26",
  // Five editable quiz questions. `correct` is the zero-based answer index.
  quiz: [
    {
      question: "Where did our story begin?",
      answers: ["At school", "Through a friend", "Somewhere unexpected", "Our own little secret"],
      correct: 2
    },
    {
      question: "What makes our relationship special?",
      answers: ["Our little moments", "Our inside jokes", "Our memories", "All of them"],
      correct: 3
    },
    {
      question: "What would I choose for our next date?",
      answers: ["A quiet night together", "An adventure", "A movie date", "Anything, as long as we're together"],
      correct: 3
    },
    {
      question: "What's my favorite memory of us?",
      answers: ["Our first meeting", "Our first date", "A random ordinary day", "The moment we laughed together"],
      correct: 2
    },
    {
      question: "One more year together means…",
      answers: ["More memories", "More adventures", "More reasons to love", "All of the above"],
      correct: 3
    }
  ]
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function setPersonalContent() {
  $$("[data-your-name]").forEach(el => el.textContent = CONFIG.yourName);
  $$("[data-partner-name]").forEach(el => el.textContent = CONFIG.partnerName);

  const date = parseAnniversaryDate(CONFIG.anniversaryDate);
  $$("[data-anniversary-year]").forEach(el => {
    el.textContent = Number.isNaN(date.getTime()) ? "—" : date.getFullYear();
  });
}

function parseAnniversaryDate(dateString) {
  // Parse as local time to avoid UTC date shifts.
  const parts = dateString.split("-").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return new Date(NaN);
  return new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0);
}

function getAnniversaryParts(start, now) {
  if (Number.isNaN(start.getTime()) || start > now) return null;

  let years = now.getFullYear() - start.getFullYear();
  let anniversaryThisYear = new Date(
    now.getFullYear(), start.getMonth(), start.getDate(),
    start.getHours(), start.getMinutes(), start.getSeconds()
  );

  if (anniversaryThisYear > now) years--;

  const yearAnchor = new Date(
    start.getFullYear() + years, start.getMonth(), start.getDate(),
    start.getHours(), start.getMinutes(), start.getSeconds()
  );

  let months = (now.getFullYear() - yearAnchor.getFullYear()) * 12
    + (now.getMonth() - yearAnchor.getMonth());

  let monthAnchor = addMonthsClamped(yearAnchor, months);
  if (monthAnchor > now) {
    months--;
    monthAnchor = addMonthsClamped(yearAnchor, months);
  }

  const diffMs = now - monthAnchor;
  const days = Math.floor(diffMs / 86400000);
  const hours = Math.floor((diffMs % 86400000) / 3600000);
  const minutes = Math.floor((diffMs % 3600000) / 60000);
  const seconds = Math.floor((diffMs % 60000) / 1000);
  return { years, months, days, hours, minutes, seconds };
}

function addMonthsClamped(date, months) {
  const result = new Date(date);
  const originalDay = result.getDate();
  result.setDate(1);
  result.setMonth(result.getMonth() + months);
  const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(originalDay, lastDay));
  return result;
}

function updateCounter() {
  const start = parseAnniversaryDate(CONFIG.anniversaryDate);
  const now = new Date();
  const parts = getAnniversaryParts(start, now);
  const elapsed = Math.max(0, now - start);
  const totalDays = Number.isNaN(start.getTime()) || start > now
    ? "—"
    : Math.floor(elapsed / 86400000).toLocaleString();

  if (!parts) {
    $("#years").textContent = "—";
    ["months", "days", "hours", "minutes", "seconds"].forEach(id => $("#" + id).textContent = "—");
    $(".counter-caption").textContent = "Set your anniversary date in script.js";
    return;
  }

  $("#years").textContent = parts.years;
  $("#months").textContent = String(parts.months).padStart(2, "0");
  $("#days").textContent = String(parts.days).padStart(2, "0");
  $("#hours").textContent = String(parts.hours).padStart(2, "0");
  $("#minutes").textContent = String(parts.minutes).padStart(2, "0");
  $("#seconds").textContent = String(parts.seconds).padStart(2, "0");
  $(".counter-caption").textContent = `We've been together for ${totalDays} days`;
}

// Reveal elements when they enter the viewport.
function initRevealAnimations() {
  const elements = $$(".reveal");
  if (!("IntersectionObserver" in window)) {
    elements.forEach(el => el.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  elements.forEach(el => observer.observe(el));
}

// Opening button gently takes the visitor to the anniversary section.
$("#openUniverse").addEventListener("click", () => {
  $("#anniversary").scrollIntoView({ behavior: "smooth" });
});

// Mobile navigation.
const menuToggle = $("#menuToggle");
const navMenu = $("#navMenu");
menuToggle.addEventListener("click", () => {
  const open = navMenu.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(open));
});
$$(".nav-menu a").forEach(link => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

// Music controls. Add a licensed audio file at assets/music.mp3.
const music = $("#backgroundMusic");
const musicToggle = $("#musicToggle");
const musicIcon = $("#musicIcon");
musicToggle.addEventListener("click", async () => {
  if (music.paused) {
    try {
      await music.play();
      musicIcon.textContent = "♫";
      musicIcon.classList.add("is-playing");
      musicToggle.setAttribute("aria-label", "Jeda musik");
    } catch (error) {
      musicToggle.setAttribute("title", "Tambahkan file assets/music.mp3 untuk mengaktifkan musik");
      alert("Musik belum tersedia. Tambahkan file musik berlisensi ke folder assets dengan nama music.mp3.");
    }
  } else {
    music.pause();
    musicIcon.classList.remove("is-playing");
    musicToggle.setAttribute("aria-label", "Putar musik");
  }
});
music.addEventListener("ended", () => musicIcon.classList.remove("is-playing"));
music.addEventListener("pause", () => musicIcon.classList.remove("is-playing"));

// Love letter modal.
const letterModal = $("#letterModal");
const envelopeButton = $("#openLetter");
function openLetter() {
  letterModal.classList.add("is-open");
  letterModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  envelopeButton.classList.add("is-open");
  $(".modal-close", letterModal).focus();
}
function closeLetter() {
  letterModal.classList.remove("is-open");
  letterModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  envelopeButton.classList.remove("is-open");
  envelopeButton.focus();
}
envelopeButton.addEventListener("click", openLetter);
$$("[data-close-letter]").forEach(button => button.addEventListener("click", closeLetter));
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && letterModal.classList.contains("is-open")) closeLetter();
});

// Quiz: update questions, choices, progress, and friendly result.
let quizIndex = 0;
let selectedAnswers = [];
const quizContent = $("#quizContent");
const quizResult = $("#quizResult");
const quizQuestion = $("#quizQuestion");
const quizAnswers = $("#quizAnswers");
const quizFeedback = $("#quizFeedback");
const quizNext = $("#quizNext");

function renderQuiz() {
  const question = CONFIG.quiz[quizIndex];
  if (!question) {
    showQuizResult();
    return;
  }

  quizContent.classList.remove("hidden");
  quizResult.classList.add("hidden");
  $("#quizProgressText").textContent = `QUESTION ${String(quizIndex + 1).padStart(2, "0")} / ${String(CONFIG.quiz.length).padStart(2, "0")}`;
  $("#quizProgress").style.width = `${((quizIndex + 1) / CONFIG.quiz.length) * 100}%`;
  quizQuestion.textContent = question.question;
  quizAnswers.innerHTML = "";
  quizFeedback.textContent = "";
  quizNext.disabled = selectedAnswers[quizIndex] === undefined;
  quizNext.innerHTML = quizIndex === CONFIG.quiz.length - 1
    ? 'See result <span>→</span>'
    : 'Next question <span>→</span>';

  question.answers.forEach((answer, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "quiz-answer" + (selectedAnswers[quizIndex] === index ? " selected" : "");
    button.setAttribute("aria-pressed", String(selectedAnswers[quizIndex] === index));

    const letter = document.createElement("span");
    letter.className = "answer-letter";
    letter.textContent = String.fromCharCode(65 + index);
    const label = document.createElement("span");
    label.textContent = answer;
    button.append(letter, label);

    button.addEventListener("click", () => {
      selectedAnswers[quizIndex] = index;
      $$(".quiz-answer", quizAnswers).forEach(item => {
        const isSelected = item === button;
        item.classList.toggle("selected", isSelected);
        item.setAttribute("aria-pressed", String(isSelected));
      });
      quizNext.disabled = false;
      quizFeedback.textContent = "A little memory, just for us. ♡";
    });
    quizAnswers.appendChild(button);
  });
}

function showQuizResult() {
  quizContent.classList.add("hidden");
  quizResult.classList.remove("hidden");
  $("#quizProgressText").textContent = "OUR LITTLE QUIZ · COMPLETE";
  $("#quizProgress").style.width = "100%";
  $("#quizResultText").textContent = "The best part of our story isn't getting every answer right. It's having a story that belongs to us.";
}

quizNext.addEventListener("click", () => {
  if (selectedAnswers[quizIndex] === undefined) return;
  if (quizIndex < CONFIG.quiz.length - 1) {
    quizIndex++;
    renderQuiz();
  } else {
    showQuizResult();
  }
});
$("#quizReplay").addEventListener("click", () => {
  quizIndex = 0;
  selectedAnswers = [];
  renderQuiz();
});
renderQuiz();

// Surprise reveal and tiny star burst.
$("#surpriseButton").addEventListener("click", () => {
  const reveal = $("#surpriseReveal");
  const alreadyVisible = reveal.classList.contains("is-visible");
  if (alreadyVisible) {
    reveal.classList.remove("is-visible");
    reveal.setAttribute("aria-hidden", "true");
    $("#surpriseButton").innerHTML = "<span>One Last Thing...</span><span>✧</span>";
    return;
  }

  reveal.classList.add("is-visible");
  reveal.setAttribute("aria-hidden", "false");
  $("#surpriseButton").innerHTML = "<span>Keep this forever</span><span>♥</span>";
  createStarBurst();
  window.setTimeout(() => reveal.scrollIntoView({ behavior: "smooth", block: "center" }), 150);
});

function createStarBurst() {
  const layer = $("#confettiLayer");
  layer.innerHTML = "";
  const symbols = ["✦", "✧", "♥", "·", "✧", "✦"];
  for (let i = 0; i < 28; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    piece.style.left = `${45 + Math.random() * 10}%`;
    piece.style.setProperty("--x", `${(Math.random() - .5) * 650}px`);
    piece.style.setProperty("--y", `${(Math.random() - .65) * 520}px`);
    piece.style.animationDelay = `${Math.random() * .35}s`;
    piece.style.fontSize = `${10 + Math.random() * 16}px`;
    layer.appendChild(piece);
  }
  window.setTimeout(() => { layer.innerHTML = ""; }, 2500);
}

// Closing action: revisit the letter section.
$("#readAgain").addEventListener("click", () => {
  $("#letter").scrollIntoView({ behavior: "smooth" });
});

// Set active navigation link while scrolling.
const sections = $$("main section[id]");
if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        $$(".nav-menu a").forEach(link => {
          link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      }
    });
  }, { rootMargin: "-35% 0px -55% 0px" });
  sections.forEach(section => sectionObserver.observe(section));
}

setPersonalContent();
updateCounter();
window.setInterval(updateCounter, 1000);
initRevealAnimations();
