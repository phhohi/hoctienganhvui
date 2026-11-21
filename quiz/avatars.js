/* Quiz thi đua — 8 animal avatars drawn as small inline SVGs (original simple faces). */
(function () {
  function eyes(y, gap, c) {
    c = c || '#1d2a3a';
    return '<circle cx="' + (50 - gap) + '" cy="' + y + '" r="5" fill="' + c + '"/><circle cx="' + (50 + gap) + '" cy="' + y + '" r="5" fill="' + c + '"/>' +
      '<circle cx="' + (51.5 - gap) + '" cy="' + (y - 1.5) + '" r="1.6" fill="#fff"/><circle cx="' + (51.5 + gap) + '" cy="' + (y - 1.5) + '" r="1.6" fill="#fff"/>';
  }
  function smile(y) { return '<path d="M43 ' + y + 'q7 6 14 0" fill="none" stroke="#1d2a3a" stroke-width="3" stroke-linecap="round"/>'; }
  function cheeks(y) { return '<circle cx="31" cy="' + y + '" r="5" fill="#ff9aa8" opacity=".6"/><circle cx="69" cy="' + y + '" r="5" fill="#ff9aa8" opacity=".6"/>'; }

  var A = {
    meo: { name: 'Cat', svg:
      '<path d="M22 40L26 12L44 28Z M78 40L74 12L56 28Z" fill="#f2a541"/><path d="M27 33L29 19L38 28Z M73 33L71 19L62 28Z" fill="#ffd9a8"/>' +
      '<circle cx="50" cy="56" r="32" fill="#f2a541"/>' + eyes(52, 12) + '<path d="M46 62h8l-4 4z" fill="#e0607a"/>' + smile(66) + cheeks(64) +
      '<path d="M18 60h16M18 66h16M66 60h16M66 66h16" stroke="#8a5a1a" stroke-width="2" stroke-linecap="round"/>' },
    cho: { name: 'Dog', svg:
      '<ellipse cx="22" cy="48" rx="11" ry="22" fill="#8a5a3b"/><ellipse cx="78" cy="48" rx="11" ry="22" fill="#8a5a3b"/>' +
      '<circle cx="50" cy="54" r="30" fill="#d9a066"/><ellipse cx="50" cy="66" rx="15" ry="11" fill="#f3d6b0"/>' + eyes(50, 11) +
      '<ellipse cx="50" cy="61" rx="6" ry="4.5" fill="#1d2a3a"/>' + smile(68) },
    tho: { name: 'Rabbit', svg:
      '<ellipse cx="36" cy="22" rx="8" ry="22" fill="#eef0f5"/><ellipse cx="64" cy="22" rx="8" ry="22" fill="#eef0f5"/>' +
      '<ellipse cx="36" cy="24" rx="4" ry="15" fill="#ffb3c1"/><ellipse cx="64" cy="24" rx="4" ry="15" fill="#ffb3c1"/>' +
      '<circle cx="50" cy="60" r="28" fill="#eef0f5" stroke="#c9cfdb" stroke-width="2"/>' + eyes(56, 11) +
      '<path d="M46 64h8l-4 4z" fill="#e0607a"/>' + smile(69) + cheeks(66) },
    gau: { name: 'Bear', svg:
      '<circle cx="24" cy="30" r="12" fill="#7a4f2f"/><circle cx="76" cy="30" r="12" fill="#7a4f2f"/><circle cx="24" cy="30" r="6" fill="#c08a5c"/><circle cx="76" cy="30" r="6" fill="#c08a5c"/>' +
      '<circle cx="50" cy="55" r="31" fill="#7a4f2f"/><ellipse cx="50" cy="66" rx="14" ry="11" fill="#c08a5c"/>' + eyes(50, 12) +
      '<ellipse cx="50" cy="61" rx="5.5" ry="4" fill="#1d2a3a"/>' + smile(68) },
    cao: { name: 'Fox', svg:
      '<path d="M20 44L24 10L46 30Z M80 44L76 10L54 30Z" fill="#e8692a"/><path d="M26 34L27 20L38 30Z M74 34L73 20L62 30Z" fill="#3a2a22"/>' +
      '<path d="M18 46Q50 14 82 46Q80 80 50 90Q20 80 18 46Z" fill="#e8692a"/><path d="M26 58Q50 70 74 58Q66 86 50 90Q34 86 26 58Z" fill="#fff4ea"/>' +
      eyes(50, 13) + '<ellipse cx="50" cy="72" rx="5" ry="3.8" fill="#1d2a3a"/>' },
    panda: { name: 'Panda', svg:
      '<circle cx="24" cy="28" r="12" fill="#1d2a3a"/><circle cx="76" cy="28" r="12" fill="#1d2a3a"/>' +
      '<circle cx="50" cy="55" r="31" fill="#fff" stroke="#c9cfdb" stroke-width="2"/>' +
      '<ellipse cx="37" cy="52" rx="9" ry="11" fill="#1d2a3a" transform="rotate(-20 37 52)"/><ellipse cx="63" cy="52" rx="9" ry="11" fill="#1d2a3a" transform="rotate(20 63 52)"/>' +
      '<circle cx="38" cy="51" r="4" fill="#fff"/><circle cx="62" cy="51" r="4" fill="#fff"/>' +
      '<ellipse cx="50" cy="64" rx="5" ry="3.5" fill="#1d2a3a"/>' + smile(70) },
    ech: { name: 'Frog', svg:
      '<circle cx="32" cy="32" r="14" fill="#5cbf4a"/><circle cx="68" cy="32" r="14" fill="#5cbf4a"/>' +
      '<ellipse cx="50" cy="60" rx="36" ry="28" fill="#5cbf4a"/>' +
      '<circle cx="32" cy="32" r="9" fill="#fff"/><circle cx="68" cy="32" r="9" fill="#fff"/><circle cx="33" cy="33" r="5" fill="#1d2a3a"/><circle cx="67" cy="33" r="5" fill="#1d2a3a"/>' +
      '<path d="M32 64q18 14 36 0" fill="none" stroke="#1d2a3a" stroke-width="3" stroke-linecap="round"/>' + cheeks(60) },
    ga: { name: 'Chick', svg:
      '<path d="M44 20q6-12 12 0q-6-4-12 0z" fill="#f2b705"/>' +
      '<circle cx="50" cy="56" r="32" fill="#ffd93d"/>' + eyes(50, 12) +
      '<path d="M42 60L58 60L50 70Z" fill="#f28c28"/>' + cheeks(62) }
  };
  var ids = Object.keys(A);
  function svg(id, size) {
    var a = A[id] || A[ids[0]];
    return '<svg class="ava" viewBox="0 0 100 100" width="' + (size || 48) + '" height="' + (size || 48) + '" role="img" aria-label="' + a.name + '">' +
      '<circle cx="50" cy="50" r="49" fill="hsl(' + (ids.indexOf(id) * 45) + ' 70% 92%)"/>' + a.svg + '</svg>';
  }
  window.QuizAvatars = { ids: ids, name: function (id) { return (A[id] || A[ids[0]]).name }, svg: svg };
})();
