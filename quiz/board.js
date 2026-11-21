/* Quiz thi đua — shared leaderboard client (Google Apps Script web app).
   GET  <url>?grade=lop-3            -> {ok:true, top:[{name,avatar,score,correct,streak,date}]}
   POST <url> body=JSON (text/plain) -> {ok:true, rank:1-10|0, top:[...]}
   text/plain avoids a CORS preflight, which Apps Script cannot answer. */
(function () {
  var TIMEOUT = 12000;
  function url() { return (window.QUIZ_CONFIG && window.QUIZ_CONFIG.scriptUrl || '').trim(); }
  function withTimeout(p) {
    return Promise.race([p, new Promise(function (_, rej) { setTimeout(function () { rej(new Error('timeout')) }, TIMEOUT) })]);
  }
  function parse(r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }
  function check(d) { if (!d || !d.ok) throw new Error((d && d.error) || 'bad response'); return d; }

  window.QuizBoard = {
    configured: function () { return !!url(); },
    load: function (grade) {
      if (!url()) return Promise.reject(new Error('not configured'));
      return withTimeout(fetch(url() + '?grade=' + encodeURIComponent(grade), { redirect: 'follow' })).then(parse).then(check);
    },
    submit: function (entry) {
      if (!url()) return Promise.reject(new Error('not configured'));
      return withTimeout(fetch(url(), {
        method: 'POST', redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(entry)
      })).then(parse).then(check);
    }
  };
})();
