// popup.js – Power Hope Add‑on (rewritten v2, safe & validator‑friendly) // --------------------------------------------------------------- // Calculates electricity use, classifies by “Bargh‑e Omid”, shows // results in a table, and sends basic notifications. // ---------------------------------------------------------------

"use strict";

document.addEventListener("DOMContentLoaded", () => { const form       = document.getElementById("deviceForm"); const tbody      = document.querySelector("#resultTable tbody"); const resultBox  = document.getElementById("result"); const summaryEl  = document.getElementById("summary"); const adviceEl   = document.getElementById("advice");

form.addEventListener("submit", evt => { evt.preventDefault();

// 1) gather data ------------------------------------------------
const devices = [
  { n: "تلویزیون",   p: +v("tvPower"),    h: +v("tvHours")                 },
  { n: "یخچال",      p: +v("fridgePower"),h: +v("fridgeHours")              },
  { n: "لامپ LED",   p: +v("lampPower"),  h: +v("lampHours"), c:+v("lampCount")||1 },
  { n: "اتو",        p: +v("ironPower"),  h: +v("ironHours")                },
  { n: "بخاری برقی", p: +v("heaterPower"),h: +v("heaterHours")              }
];

// 2) reset table ------------------------------------------------
tbody.replaceChildren();
let totalDaily = 0;

// 3) compute + build rows safely --------------------------------
devices.forEach(d => {
  const daily = (d.n === "لامپ LED"
    ? d.p * d.h * d.c
    : d.p * d.h) / 1000;
  totalDaily += daily;

  const tr = document.createElement("tr");
  [d.n, d.p, d.h, daily.toFixed(3)].forEach(txt => {
    const td = document.createElement("td");
    td.textContent = txt;
    tr.appendChild(td);
  });
  tbody.appendChild(tr);
});

// 4) monthly + status -------------------------------------------
const monthly = totalDaily * 30;
let   status  = "";
if (monthly <= 100)      status = "کم‌مصرف - مشمول برق رایگان";
else if (monthly <= 300) status = "خوش‌مصرف - امکان تخفیف با کاهش مصرف";
else                     status = "پرمصرف - نیاز به اصلاح الگوی مصرف";

// 5) summary & advice -------------------------------------------
summaryEl.textContent = `مصرف تقریبی ماهانه: ${monthly.toFixed(2)} کیلووات‌ساعت. وضعیت شما: ${status}.`;

let adviceMsg = "";
if (status.startsWith("پرمصرف"))      adviceMsg = "توصیه: وسایل پرمصرف را کمتر استفاده کنید و در ساعات پیک مصرف کمتر برق مصرف نمایید.";
else if (status.startsWith("خوش‌مصرف")) adviceMsg = "توصیه: تلاش کنید مصرف را ۱۰٪ کاهش دهید تا از تخفیف‌ها بهره‌مند شوید.";
else                                     adviceMsg = "آفرین! مصرف شما در محدوده برق رایگان است.";

adviceEl.textContent = adviceMsg;
resultBox.hidden = false;

// 6) notifications ----------------------------------------------
notifyUser(monthly);

});

function v(id){ return document.getElementById(id).value; } });

// ------------------------------------------------------------------ // Notifications helper
// ------------------------------------------------------------------ function notifyUser(monthly){ if (Notification.permission !== "granted"){ Notification.requestPermission(); return; } const h = new Date().getHours(); let msg = ""; if (h>=5 && h<7){ msg = monthly>100 ? "صبح بخیر! امروز با مصرف کم شروع کنید." : "صبح بخیر! مصرف مناسب است."; } else if (h>=17 && h<19){ msg = monthly>100 ? "عصر بخیر! وسایل پرمصرف را خاموش کنید." : "عصر بخیر! مصرف مناسب است."; } if (msg){ new Notification("یادآوری مصرف برق",{body:msg,icon:"icons/icon48.png"}); } }

