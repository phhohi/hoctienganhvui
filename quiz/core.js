/* Quiz thi đua — pure logic shared by the quiz page and the tests.
   No DOM access here, so every rule (name cleanup, scoring, power-ups) can be tested in Node. */
(function (root) {
  var QUESTIONS = 45;            // questions per quiz
  var TIME_LIMIT = 20;           // seconds per question
  var BASE = 100;                // points for a correct answer
  var SPEED_MAX = 50;            // max speed bonus
  var GRANT_EVERY = 10;          // power-ups granted after every 10 questions
  var GRANT_COUNT = 3;           // 3 of the 7 power-ups per grant
  var NAME_MAX = 20;

  var POWERUPS = [
    { id: 'double', name: 'Nhân đôi', desc: 'Nhân đôi điểm câu này.' },
    { id: 'fifty', name: '50/50', desc: 'Bỏ bớt đáp án sai, còn 2 đáp án.' },
    { id: 'shield', name: 'Khiên', desc: 'Trả lời sai vẫn giữ chuỗi.' },
    { id: 'skip', name: 'Bỏ qua', desc: 'Bỏ qua câu này, không mất chuỗi.' },
    { id: 'time', name: 'Thêm giờ', desc: 'Cộng thêm 10 giây.' },
    { id: 'hint', name: 'Gợi ý', desc: 'Hiện chữ cái đầu của đáp án.' },
    { id: 'retry', name: 'Trả lời lại', desc: 'Sai lần đầu được chọn lại.' }
  ];

  /* Vietnamese -> unaccented; drop anything that is not A-Z, a-z, 0-9 or space. */
  function toAscii(s) {
    s = String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'D')
      .replace(/[^A-Za-z0-9 ]/g, '').replace(/ {2,}/g, ' ');
    return s.replace(/^ +/, '').slice(0, NAME_MAX);
  }
  /* Final name check: 2-20 chars, allowed set only, no leading/trailing space. */
  function validName(s) {
    return typeof s === 'string' && /^[A-Za-z0-9](?:[A-Za-z0-9 ]{0,18}[A-Za-z0-9])?$/.test(s) && s.length >= 2;
  }

  /* Streak 1 -> x1, +0.2 per extra correct answer in a row, capped at x3. */
  function multiplier(streak) {
    if (streak < 1) return 1;
    return Math.min(3, Math.round((1 + 0.2 * (streak - 1)) * 10) / 10);
  }
  function speedBonus(timeLeft) {
    var t = Math.max(0, Math.min(TIME_LIMIT, timeLeft));
    return Math.round(SPEED_MAX * t / TIME_LIMIT);
  }
  /* Points for one correct answer. streak = streak count including this answer. */
  function questionScore(timeLeft, streak, doubled) {
    var s = Math.round((BASE + speedBonus(timeLeft)) * multiplier(streak));
    return doubled ? s * 2 : s;
  }
  /* Highest total a real game can reach: every answer instant, unbroken streak,
     and every granted power-up spent as "Nhân đôi" on a max-multiplier question. */
  function maxScore(n) {
    n = n || QUESTIONS;
    var total = 0;
    for (var k = 1; k <= n; k++) total += questionScore(TIME_LIMIT, k, false);
    var grants = Math.floor((n - 1) / GRANT_EVERY) * GRANT_COUNT;
    return total + grants * questionScore(TIME_LIMIT, 99, false);
  }

  function shuffle(a, rng) {
    rng = rng || Math.random; a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function pickQuestions(pool, n, rng) { return shuffle(pool, rng).slice(0, Math.min(n || QUESTIONS, pool.length)); }
  /* After answering question number `answered` (1-based), does the player get power-ups? */
  function grantDue(answered, total) { return answered % GRANT_EVERY === 0 && answered < (total || QUESTIONS); }
  function grantPowerups(rng) { return shuffle(POWERUPS.map(function (p) { return p.id }), rng).slice(0, GRANT_COUNT); }

  var api = {
    QUESTIONS: QUESTIONS, TIME_LIMIT: TIME_LIMIT, NAME_MAX: NAME_MAX, POWERUPS: POWERUPS,
    toAscii: toAscii, validName: validName, multiplier: multiplier, speedBonus: speedBonus,
    questionScore: questionScore, maxScore: maxScore, shuffle: shuffle, pickQuestions: pickQuestions,
    grantDue: grantDue, grantPowerups: grantPowerups
  };
  if (typeof module === 'object' && module.exports) module.exports = api; else root.QuizCore = api;
})(this);
