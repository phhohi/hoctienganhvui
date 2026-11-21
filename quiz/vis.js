/* Picture helper copied from the lesson pages by build_quiz.py. */
(function(){
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function star(cx,cy,r,f){var p=[];for(var i=0;i<10;i++){var a=Math.PI/5*i-Math.PI/2,R=i%2?r*.382:r;p.push((cx+R*Math.cos(a)).toFixed(2)+','+(cy+R*Math.sin(a)).toFixed(2))}return'<polygon points="'+p.join(' ')+'" fill="'+f+'"/>'}
var jack='<rect width="60" height="40" fill="#012169"/><path d="M0 0L60 40M60 0L0 40" stroke="#fff" stroke-width="8"/><path d="M0 0L60 40M60 0L0 40" stroke="#C8102E" stroke-width="3"/><path d="M30 0V40M0 20H60" stroke="#fff" stroke-width="13"/><path d="M30 0V40M0 20H60" stroke="#C8102E" stroke-width="8"/>';
function stripes(n,h,a,b){var s='';for(var i=0;i<n;i++)s+='<rect y="'+(i*h)+'" width="60" height="'+(h+.05)+'" fill="'+(i%2?b:a)+'"/>';return s}
var FL={
vn:'<rect width="60" height="40" fill="#DA251D"/>'+star(30,21,12,'#FFFF00'),
gb:jack,
us:stripes(13,40/13,'#B22234','#fff')+'<rect width="26" height="21.5" fill="#3C3B6E"/>'+(function(){var s='';for(var r=0;r<5;r++)for(var c=0;c<6;c++)s+='<circle cx="'+(2.5+c*4.2)+'" cy="'+(2.5+r*4)+'" r=".9" fill="#fff"/>';return s})(),
au:'<rect width="60" height="40" fill="#012169"/><svg x="0" y="0" width="30" height="20" viewBox="0 0 60 40" preserveAspectRatio="none">'+jack+'</svg>'+star(15,30,5,'#fff')+star(45,8,2.4,'#fff')+star(52,18,2.4,'#fff')+star(38,19,2.4,'#fff')+star(45,32,2.4,'#fff'),
jp:'<rect width="60" height="40" fill="#fff"/><circle cx="30" cy="20" r="12" fill="#BC002D"/>',
sg:'<rect width="60" height="20" fill="#EF3340"/><rect y="20" width="60" height="20" fill="#fff"/><circle cx="13" cy="10" r="6.5" fill="#fff"/><circle cx="15.5" cy="10" r="6.5" fill="#EF3340"/>'+[0,1,2,3,4].map(function(i){var a=i*Math.PI*2/5-Math.PI/2;return star(23+4.3*Math.cos(a),10+4.3*Math.sin(a),1.6,'#fff')}).join(''),
my:stripes(14,40/14,'#CC0001','#fff')+'<rect width="30" height="22.9" fill="#010066"/><circle cx="12" cy="11.4" r="7" fill="#FC0"/><circle cx="14" cy="11.4" r="5.6" fill="#010066"/>'+star(21,11.4,4,'#FC0'),
th:'<rect width="60" height="40" fill="#A51931"/><rect y="6.67" width="60" height="26.67" fill="#F4F5F8"/><rect y="13.33" width="60" height="13.34" fill="#2D2A4A"/>'
};
function vis(v){if(!v)return'';var h='';
if(v.k==='flag')h='<svg viewBox="0 0 60 40" role="img" aria-label="flag">'+FL[v.c]+'</svg>';
else if(v.k==='clock'){var p=v.t.split(' ');h='<div class="clock"><span>'+esc(p[0])+'</span><small>'+esc(p[1]||'')+'</small></div>'}
else if(v.k==='cal')h='<div class="cal"><b>'+esc(v.d)+'</b><span>'+esc(v.n)+'</span></div>';
else if(v.k==='sw')h='<div class="sws">'+Array(v.n||1).fill(0).map(function(){return'<i style="background:'+v.c+'"></i>'}).join('')+'</div>';
else if(v.k==='tag')h='<div class="tagv">'+esc(v.t)+'</div>';
else if(v.k==='table'){h='<div class="scroll"><table class="tbl"><tr>'+v.h.map(function(x){return'<th>'+esc(x)+'</th>'}).join('')+'</tr>'+v.r.map(function(r){return'<tr>'+r.map(function(x){return'<td>'+esc(x)+'</td>'}).join('')+'</tr>'}).join('')+'</table></div>'}
return'<div class="vis">'+h+'</div>'}
window.QuizVis=vis;
})();
