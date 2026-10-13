/* Блик — демо-сайт (vuegen). Без зависимостей. */

// Контакты клиента: заменить на реальные перед запуском
const CONTACTS = {
  whatsapp: "79000000000",     // номер без плюса
  telegram: "blik_detailing"   // имя пользователя без @
};

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- 1. Блик на надписи и на кузове ---------- */
(function () {
  const hero = document.getElementById("hero");
  const wordmark = document.getElementById("wordmark");
  const row = wordmark.querySelector(".wordmark__row");
    const carSvg = document.getElementById("car-svg");

  function setSpot(x, y) {
    wordmark.style.setProperty("--mx", x + "px");
    wordmark.style.setProperty("--my", y + "px");
  }

  function setSheen(frac) {
    carSvg.style.setProperty("--sx", (frac * 100).toFixed(1) + "%");
  }

  // Положение блика по доле ширины надписи
  function followFraction(f, y) {
    const w = row.offsetWidth;
    const h = row.offsetHeight;
    setSpot(f * w, y * h);
    setSheen(0.06 + Math.max(0, Math.min(1, f)) * 0.88);
  }

  followFraction(0.28, 0.32);
  if (reduceMotion) return;

  let auto = true;
  let looping = false;

  function tick(t) {
    if (!auto) { looping = false; return; }
    const f = 0.5 + 0.62 * Math.sin(t / 1700);
    followFraction(f, 0.3);
    requestAnimationFrame(tick);
  }
  function startAuto() {
    auto = true;
    if (!looping) { looping = true; requestAnimationFrame(tick); }
  }
  startAuto();

  hero.addEventListener("pointermove", function (e) {
    if (e.pointerType === "touch") return;
    auto = false;
    const r = row.getBoundingClientRect();
    setSpot(e.clientX - r.left, e.clientY - r.top);
    const c = carSvg.getBoundingClientRect();
    setSheen(Math.max(0, Math.min(1, (e.clientX - c.left) / c.width)));
  });
  hero.addEventListener("pointerleave", startAuto);
})();

/* ---------- 2. До и после ---------- */
(function () {
  const ba = document.getElementById("ba");
  const range = document.getElementById("ba-range");
  let queued = false;
  function update() { ba.style.setProperty("--pos", range.value + "%"); queued = false; }
  range.addEventListener("input", function () {
    if (!queued) { queued = true; requestAnimationFrame(update); }
  });
  update();
})();

/* ---------- 3. Услуги ---------- */
(function () {
  const items = [
    {
      title: "Полировка кузова",
      text: "Убираем паутину царапин, голограммы и следы мойки. Лак снимаем только там, где это нужно, и контролируем толщину прибором.",
      time: "1–2 дня", price: "от 15 000 ₽", gloss: 90, guard: 25
    },
    {
      title: "Керамическое покрытие",
      text: "Твёрдый слой поверх лака. Грязь хуже липнет, вода собирается в капли, а цвет выглядит глубже. Наносим после полировки.",
      time: "2 дня", price: "от 25 000 ₽", gloss: 95, guard: 80
    },
    {
      title: "Защитная плёнка",
      text: "Прозрачный полиуретан на капот, бамперы, пороги и зеркала. Принимает на себя щебень и сколы, которые иначе остались бы на лаке.",
      time: "3–5 дней", price: "от 60 000 ₽", gloss: 80, guard: 100
    },
    {
      title: "Химчистка салона",
      text: "Разбираем сиденья и потолок, чистим ткань и кожу, убираем запахи. Кожу после чистки пропитываем защитным составом.",
      time: "1 день", price: "от 12 000 ₽", gloss: 40, guard: 55
    },
    {
      title: "Детейлинг-мойка",
      text: "Бесконтактная мойка, очистка от битума и металлической пыли, сушка и защитный состав. Подходит как регулярный уход.",
      time: "3–4 часа", price: "от 3 500 ₽", gloss: 60, guard: 30
    }
  ];

  const buttons = Array.from(document.querySelectorAll(".svc-btn"));
  const $ = function (id) { return document.getElementById(id); };

  function show(i) {
    const s = items[i];
    buttons.forEach(function (b, k) {
      const on = k === i;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
    $("svc-title").textContent = s.title;
    $("svc-text").textContent = s.text;
    $("svc-time").textContent = s.time;
    $("svc-price").textContent = s.price;
    $("m-gloss").style.setProperty("--w", s.gloss + "%");
    $("m-guard").style.setProperty("--w", s.guard + "%");
  }

  buttons.forEach(function (b) {
    const i = Number(b.dataset.i);
    b.addEventListener("click", function () { show(i); });
    b.addEventListener("focus", function () { show(i); });
    b.addEventListener("mouseenter", function () {
      if (window.matchMedia("(hover: hover)").matches) show(i);
    });
  });
})();

/* ---------- 4. Выбор пакета подставляет услугу в форму ---------- */
document.querySelectorAll("[data-pick]").forEach(function (a) {
  a.addEventListener("click", function () {
    const select = document.getElementById("f-service");
    const name = a.dataset.pick;
    Array.from(select.options).forEach(function (o) {
      if (o.text === name) select.value = o.value;
    });
  });
});

/* ---------- 5. Форма записи: открывает чат с готовым текстом ---------- */
(function () {
  const form = document.getElementById("form");
  const error = document.getElementById("form-error");
  const note = document.getElementById("form-note");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const car = String(data.get("car") || "").trim();
    const service = String(data.get("service") || "");

    if (!name || !car) {
      error.hidden = false;
      note.hidden = true;
      (name ? form.elements.car : form.elements.name).focus();
      return;
    }
    error.hidden = true;

    const text = "Здравствуйте! Меня зовут " + name + ". Автомобиль: " + car +
      ". Интересует: " + service + ". Хочу записаться на осмотр.";
    const channel = e.submitter && e.submitter.dataset.channel;

    if (channel === "tg") {
      // В личные чаты Telegram нельзя передать текст ссылкой, поэтому копируем его
      if (navigator.clipboard) navigator.clipboard.writeText(text).catch(function () {});
      note.textContent = "Текст заявки скопирован. Вставьте его в чат Telegram.";
      note.hidden = false;
      window.open("https://t.me/" + CONTACTS.telegram, "_blank", "noopener");
    } else {
      note.hidden = true;
      window.open("https://wa.me/" + CONTACTS.whatsapp + "?text=" + encodeURIComponent(text), "_blank", "noopener");
    }
  });
})();
