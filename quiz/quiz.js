/* Quiz thi đua — screens: start (leaderboard + name + avatar) -> 45 questions -> result.
   Rules live in core.js (QuizCore); leaderboard I/O in board.js (QuizBoard). */
(function () {
  var C = window.QuizCore, AV = window.QuizAvatars, B = window.QuizBoard;
  var app = document.getElementById('app');
  var GRADE = document.body.getAttribute('data-grade');
  var LABEL = document.body.getAttribute('data-label');
  var POOL = window.QUIZ_POOL || [];
  var PW = {}; C.POWERUPS.forEach(function (p) { PW[p.id] = p });

  var player = { name: '', avatar: AV.ids[0] };
  try { player.name = C.toAscii(localStorage.getItem('quiz-name') || ''); player.avatar = localStorage.getItem('quiz-ava') || player.avatar; } catch (e) {}
  if (AV.ids.indexOf(player.avatar) < 0) player.avatar = AV.ids[0];

  var G;            // game state
  var tickId = null, sound = true, AC = null;

  function $(s) { return app.querySelector(s) }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] }) }
  function tone(f, d, t) {
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      var o = AC.createOscillator(), g = AC.createGain(), n = AC.currentTime + t;
      o.type = 'sine'; o.frequency.value = f; g.gain.setValueAtTime(.001, n);
      g.gain.exponentialRampToValueAtTime(.18, n + .02); g.gain.exponentialRampToValueAtTime(.001, n + d);
      o.connect(g); g.connect(AC.destination); o.start(n); o.stop(n + d + .05);
    } catch (e) {}
  }
  function sfx(kind) {
    if (!sound) return;
    if (kind === 'ok') { tone(660, .15, 0); tone(880, .25, .14) }
    else if (kind === 'bad') tone(220, .3, 0);
    else if (kind === 'gift') { tone(523, .12, 0); tone(659, .12, .12); tone(784, .3, .24) }
  }
  function nav() {
    return '<nav class="topnav" aria-label="Chuyển trang"><a class="home" href="../index.html#' + GRADE + '">⌂ Trang chủ</a></nav>';
  }
  function header(extra) {
    return nav() + '<header><span class="unit">Quiz</span><h1>Quiz thi đua · ' + esc(LABEL) + '</h1>' + (extra || '') + '</header>';
  }

  /* ---------- leaderboard ---------- */
  function fmtDate(s) { var d = new Date(s); return isNaN(d) ? '' : d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear() }
  function podium(top, meRank) {
    var h = '';
    for (var i = 0; i < 3; i++) {
      var r = top && top[i];
      h += r
        ? '<div class="pod r' + (i + 1) + (meRank === i + 1 ? ' me' : '') + '"><span class="rk">' + (i + 1) + '</span>' + AV.svg(r.avatar, 52) +
          '<b>' + esc(r.name) + '</b><span class="pts">' + Number(r.score).toLocaleString('vi-VN') + '</span><small>' + esc(fmtDate(r.date)) + '</small></div>'
        : '<div class="pod r' + (i + 1) + ' empty"><span class="rk">' + (i + 1) + '</span><b>Còn trống</b></div>';
    }
    return '<div class="podium">' + h + '</div>';
  }
  function boardBox(id) { return '<section class="board" id="' + id + '"><h2>Bảng vinh danh</h2>' + podium(null) + '<p class="bnote">Đang tải bảng vinh danh…</p></section>' }
  function fillBoard(el, top, meRank, note) {
    if (!el) return;
    el.innerHTML = '<h2>Bảng vinh danh</h2>' + podium(top, meRank) + (note ? '<p class="bnote">' + note + '</p>' : '');
  }
  function loadBoard(id) {
    var el = document.getElementById(id);
    if (!B.configured()) { fillBoard(el, null, 0, 'Bảng vinh danh chưa được kết nối. Thầy cô cần dán link vào quiz/config.js.'); return }
    B.load(GRADE).then(function (d) { fillBoard(document.getElementById(id), d.top, 0, '') })
      .catch(function () { fillBoard(document.getElementById(id), null, 0, 'Không tải được bảng vinh danh. Kiểm tra mạng rồi tải lại trang.') });
  }

  /* ---------- start screen ---------- */
  function start() {
    stopTimer();
    var avas = AV.ids.map(function (id) {
      return '<button type="button" data-ava="' + id + '" aria-pressed="' + (id === player.avatar) + '">' + AV.svg(id, 56) + esc(AV.name(id)) + '</button>';
    }).join('');
    app.innerHTML = header() +
      '<div class="card center">' + boardBox('board') + '</div>' +
      '<div class="card center"><p class="kicker">Thông tin người chơi</p>' +
      '<div class="field"><label for="nm">Tên của em</label>' +
      '<input id="nm" maxlength="' + C.NAME_MAX + '" autocomplete="off" spellcheck="false" placeholder="Ví dụ: Nguyen Van An" value="' + esc(player.name) + '">' +
      '<span class="help" id="nmh">Chỉ dùng chữ không dấu, số và dấu cách (2–20 ký tự). Chữ có dấu sẽ tự đổi thành không dấu.</span></div>' +
      '<div class="field"><label>Chọn nhân vật</label><div class="avas">' + avas + '</div></div>' +
      '<ul class="rules"><li>' + C.QUESTIONS + ' câu, mỗi câu ' + C.TIME_LIMIT + ' giây.</li>' +
      '<li>Trả lời đúng liên tiếp để tăng chuỗi: điểm nhân tới ×3. Trả lời nhanh được thêm điểm.</li>' +
      '<li>Sau câu 10, 20, 30, 40: nhận 3 bổ trợ ngẫu nhiên. Mỗi câu dùng tối đa 1 bổ trợ.</li></ul>' +
      '<button class="btn" id="go">Bắt đầu thi</button></div>';
    var inp = $('#nm');
    function sync() {
      var clean = C.toAscii(inp.value);
      if (clean !== inp.value) inp.value = clean;
      player.name = clean.trim();
      $('#go').disabled = !C.validName(player.name);
    }
    inp.addEventListener('input', sync);
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !$('#go').disabled) $('#go').click() });
    sync();
    app.querySelectorAll('[data-ava]').forEach(function (b) {
      b.onclick = function () {
        player.avatar = b.getAttribute('data-ava');
        app.querySelectorAll('[data-ava]').forEach(function (x) { x.setAttribute('aria-pressed', x === b) });
      };
    });
    $('#go').onclick = function () {
      try { localStorage.setItem('quiz-name', player.name); localStorage.setItem('quiz-ava', player.avatar) } catch (e) {}
      tone(1, .01, 0);
      begin();
    };
    loadBoard('board');
  }

  /* ---------- game ---------- */
  function begin() {
    G = { qs: C.pickQuestions(POOL, C.QUESTIONS), qi: 0, score: 0, streak: 0, best: 0, correct: 0, wrong: [], inv: {}, submitted: false };
    ask();
  }
  function invCount() { var n = 0; for (var k in G.inv) n += G.inv[k]; return n }
  function hud() {
    var m = C.multiplier(G.streak + 1);
    return nav() + '<div class="hud"><span class="who">' + AV.svg(player.avatar, 40) + '<span>' + esc(player.name) + '</span></span>' +
      '<span class="streak' + (G.streak >= 3 ? ' hot' : '') + '" id="stk">Chuỗi ' + G.streak + ' · ×' + m + '</span>' +
      '<span class="pill" id="sc">' + G.score.toLocaleString('vi-VN') + ' điểm</span>' +
      '<button class="snd" id="snd" aria-label="Bật tắt âm thanh">' + (sound ? 'Âm' : 'Tắt') + '</button></div>';
  }
  function trayHtml() {
    var h = C.POWERUPS.filter(function (p) { return G.inv[p.id] }).map(function (p) {
      return '<button class="pw" data-pw="' + p.id + '" title="' + esc(p.desc) + '">' + esc(p.name) + (G.inv[p.id] > 1 ? ' ×' + G.inv[p.id] : '') + '<small>' + esc(p.desc) + '</small></button>';
    }).join('');
    return h || '<span class="none">Chưa có bổ trợ. Trả lời đủ 10 câu để nhận.</span>';
  }
  function ask() {
    if (G.qi >= G.qs.length) return end();
    var q = G.qs[G.qi];
    G.cur = { q: q, opts: C.shuffle(q.o), answer: q.o[0], done: false, used: null, armed: {}, tries: 0, limit: C.TIME_LIMIT, t0: performance.now() };
    app.innerHTML = hud() +
      '<div class="card"><p class="kicker">Câu ' + (G.qi + 1) + ' / ' + G.qs.length + ' · ' + esc(q.u) + '</p>' +
      '<div class="timer"><div class="bar" id="tb"><i style="width:100%"></i></div><span class="secs" id="ts">' + C.TIME_LIMIT + '</span></div>' +
      '<p class="prompt">' + esc(q.p) + '</p>' + (q.x ? '<p class="ctx">' + esc(q.x) + '</p>' : '') + (q.v ? window.QuizVis(q.v) : '') +
      '<div id="hint"></div><div class="opts" id="opts">' +
      G.cur.opts.map(function (o, i) { return '<button class="opt" data-i="' + i + '">' + esc(o) + '</button>' }).join('') + '</div></div>' +
      '<div class="armed" id="armed"></div>' +
      '<div class="tray" id="tray" aria-label="Bổ trợ">' + trayHtml() + '</div>' +
      '<div class="fb" id="fb" role="status" aria-live="polite">Chọn đáp án đúng.</div>' +
      '<div class="nav"><span class="grow"></span><button class="btn" id="next" hidden>Câu tiếp ›</button></div>';
    $('#snd').onclick = function () { sound = !sound; $('#snd').textContent = sound ? 'Âm' : 'Tắt' };
    app.querySelectorAll('.opt').forEach(function (b) { b.onclick = function () { choose(b) } });
    app.querySelectorAll('[data-pw]').forEach(function (b) { b.onclick = function () { usePower(b.getAttribute('data-pw')) } });
    $('#next').onclick = next;
    startTimer();
  }
  function timeLeft() { return G.cur.limit - (performance.now() - G.cur.t0) / 1000 }
  function startTimer() {
    stopTimer();
    tickId = setInterval(function () {
      if (!G || !G.cur || G.cur.done) return stopTimer();
      var t = Math.max(0, timeLeft());
      var bar = $('#tb'), s = $('#ts');
      if (bar) { bar.firstChild.style.width = (100 * t / G.cur.limit) + '%'; bar.classList.toggle('low', t <= 5) }
      if (s) s.textContent = Math.ceil(t);
      if (t <= 0) finish(false, null, true);
    }, 100);
  }
  function stopTimer() { if (tickId) { clearInterval(tickId); tickId = null } }

  function choose(btn) {
    var c = G.cur; if (c.done) return;
    var pick = c.opts[+btn.getAttribute('data-i')];
    if (pick === c.answer) { btn.classList.add('ok'); return finish(true, pick) }
    btn.classList.add('bad'); btn.disabled = true; sfx('bad');
    if (c.armed.retry && c.tries === 0) {
      c.tries++; c.armed.retry = false; showArmed();
      $('#fb').className = 'fb bad'; $('#fb').innerHTML = '<b>Chưa đúng!</b>Bổ trợ Trả lời lại: em được chọn thêm 1 lần.';
      return;
    }
    finish(false, pick);
  }
  function finish(ok, pick, timeout) {
    var c = G.cur; if (c.done) return;
    c.done = true; stopTimer();
    var left = timeLeft(), fb = $('#fb'), msg;
    app.querySelectorAll('.opt').forEach(function (b) {
      b.disabled = true;
      if (c.opts[+b.getAttribute('data-i')] === c.answer) b.classList.add('ok');
    });
    if (ok) {
      G.streak++; G.best = Math.max(G.best, G.streak); G.correct++;
      var pts = C.questionScore(left, G.streak, !!c.armed.double);
      G.score += pts; sfx('ok');
      fb.className = 'fb ok';
      fb.innerHTML = '<b>Đúng rồi! <span class="gain">+' + pts + '</span></b>' + (c.armed.double ? 'Đã nhân đôi điểm. ' : '') + esc(c.q.e);
    } else {
      G.wrong.push({ q: c.q, pick: pick, timeout: !!timeout });
      if (timeout) sfx('bad');
      var kept = !!c.armed.shield;
      if (!kept) G.streak = 0;
      fb.className = 'fb bad';
      msg = (timeout ? '<b>Hết giờ!</b>' : '<b>Chưa đúng!</b>') + 'Đáp án: ' + esc(c.answer) + '. ' + esc(c.q.e) +
        (kept ? ' Khiên đã giữ chuỗi cho em.' : '');
      fb.innerHTML = msg;
    }
    refreshHud(); disableTray(); showNext();
  }
  function refreshHud() {
    var s = $('#sc'), k = $('#stk');
    if (s) s.textContent = G.score.toLocaleString('vi-VN') + ' điểm';
    if (k) { k.textContent = 'Chuỗi ' + G.streak + ' · ×' + C.multiplier(G.streak + 1); k.classList.toggle('hot', G.streak >= 3) }
  }
  function disableTray() { app.querySelectorAll('[data-pw]').forEach(function (b) { b.disabled = true }) }
  function showNext() { var n = $('#next'); n.hidden = false; n.textContent = G.qi + 1 >= G.qs.length ? 'Xem kết quả ›' : 'Câu tiếp ›'; n.focus() }
  function showArmed() {
    var c = G.cur, names = [];
    ['double', 'shield', 'retry'].forEach(function (k) { if (c.armed[k]) names.push(PW[k].name) });
    $('#armed').innerHTML = names.map(function (n) { return '<span>Đang bật: ' + esc(n) + '</span>' }).join('');
  }
  function usePower(id) {
    var c = G.cur; if (c.done || c.used || !G.inv[id]) return;
    if (id === 'fifty') {
      var wrong = []; app.querySelectorAll('.opt').forEach(function (b) {
        if (!b.disabled && c.opts[+b.getAttribute('data-i')] !== c.answer) wrong.push(b);
      });
      if (wrong.length < 2) return;                      // nothing worth removing
      C.shuffle(wrong).slice(0, wrong.length - 1).forEach(function (b) { b.classList.add('gone'); b.disabled = true });
    } else if (id === 'time') {
      c.limit += 10;
    } else if (id === 'hint') {
      $('#hint').innerHTML = '<div class="hint">Gợi ý: đáp án bắt đầu bằng chữ <b>' + esc(c.answer.charAt(0)) + '</b> và có ' + c.answer.length + ' ký tự.</div>';
    } else if (id === 'skip') {
      G.inv[id]--; c.used = id; c.done = true; stopTimer();
      app.querySelectorAll('.opt').forEach(function (b) { b.disabled = true });
      $('#fb').className = 'fb'; $('#fb').innerHTML = '<b>Đã bỏ qua câu này.</b>Chuỗi của em được giữ nguyên.';
      disableTray(); showNext(); return;
    } else {
      c.armed[id] = true; showArmed();
    }
    G.inv[id]--; c.used = id;
    $('#tray').innerHTML = trayHtml();
    app.querySelectorAll('[data-pw]').forEach(function (b) { b.disabled = true });
  }
  function next() {
    G.qi++;
    if (C.grantDue(G.qi, G.qs.length)) return grant();
    ask();
  }
  function grant() {
    var got = C.grantPowerups();
    got.forEach(function (id) { G.inv[id] = (G.inv[id] || 0) + 1 });
    sfx('gift');
    app.innerHTML = hud() + '<div class="card center"><p class="kicker">Hoàn thành ' + G.qi + ' câu</p>' +
      '<p class="prompt">Em nhận được 3 bổ trợ mới!</p><div class="grant">' +
      got.map(function (id) { return '<div><b>' + esc(PW[id].name) + '</b>' + esc(PW[id].desc) + '</div>' }).join('') + '</div>' +
      '<p class="ctx">Em đang có ' + invCount() + ' bổ trợ. Bấm vào bổ trợ ở dưới câu hỏi để dùng.</p>' +
      '<button class="btn" id="cont">Tiếp tục ›</button></div>';
    $('#snd').onclick = function () { sound = !sound; $('#snd').textContent = sound ? 'Âm' : 'Tắt' };
    $('#cont').onclick = ask; $('#cont').focus();
  }

  /* ---------- result ---------- */
  function end() {
    stopTimer();
    var n = G.qs.length;
    var wrongs = G.wrong.map(function (w) {
      return '<li>' + esc(w.q.p) + (w.q.v ? window.QuizVis(w.q.v) : '') + '<br><span class="a">Đáp án: ' + esc(w.q.o[0]) + '</span>' +
        (w.timeout ? ' <small>(hết giờ)</small>' : ' <span class="y">· Em chọn: ' + esc(w.pick) + '</span>') + '</li>';
    }).join('');
    app.innerHTML = hud() + '<div class="card center"><p class="kicker">Hoàn thành</p>' +
      AV.svg(player.avatar, 72) + '<div class="big">' + G.score.toLocaleString('vi-VN') + '</div><p class="ctx">điểm</p>' +
      '<div class="stats"><div><b>' + G.correct + '/' + n + '</b><span>câu đúng</span></div><div><b>' + G.best + '</b><span>chuỗi dài nhất</span></div>' +
      '<div><b>' + G.wrong.length + '</b><span>câu sai</span></div></div>' +
      '<div class="save" id="save" role="status" aria-live="polite">' + (B.configured() ? 'Đang lưu điểm lên bảng vinh danh…' : 'Bảng vinh danh chưa được kết nối nên điểm không được lưu.') + '</div>' +
      '<div class="nav" style="width:100%"><button class="btn alt" id="again">Chơi lại</button><span class="grow"></span><a class="btn" href="../index.html#' + GRADE + '" style="text-decoration:none;display:inline-flex;align-items:center">Trang chủ</a></div></div>' +
      '<div class="card center">' + boardBox('board2') + '</div>' +
      (wrongs ? '<div class="card"><p class="kicker">Xem lại câu sai</p><ol class="wrongs">' + wrongs + '</ol></div>' : '');
    $('#snd').onclick = function () { sound = !sound; $('#snd').textContent = sound ? 'Âm' : 'Tắt' };
    $('#again').onclick = start;
    sfx('gift');
    if (!B.configured()) { fillBoard(document.getElementById('board2'), null, 0, 'Bảng vinh danh chưa được kết nối.'); return }
    if (G.submitted) return;
    G.submitted = true;
    B.submit({ grade: GRADE, name: player.name, avatar: player.avatar, score: G.score, correct: G.correct, streak: G.best, total: n })
      .then(function (d) {
        var s = document.getElementById('save'); if (!s) return;
        var r = d.rank | 0;
        s.className = 'save ok';
        s.textContent = r >= 1 && r <= 3 ? 'Chúc mừng! Em đứng hạng ' + r + ' trên bảng vinh danh!'
          : r > 3 ? 'Đã lưu điểm. Em đứng hạng ' + r + ', cố thêm chút nữa để vào top 3 nhé!'
          : 'Đã ghi nhận. Điểm này chưa vào top 10, chơi lại để phá kỷ lục nhé!';
        fillBoard(document.getElementById('board2'), d.top, r, '');
      })
      .catch(function () {
        var s = document.getElementById('save'); if (s) { s.className = 'save bad'; s.textContent = 'Chưa lưu được điểm (lỗi mạng). Kết quả vẫn hiện ở đây.' }
        loadBoard('board2');
      });
  }

  start();
})();
