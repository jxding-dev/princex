const pages = ['home', 'world', 'ascension', 'character', 'undead'];

// 임시 데이터 (실제 내용으로 교체)
const ascension = [
  { name: '캐릭터 1', desc: '캐릭터 1 소개 텍스트' },
  { name: '캐릭터 2', desc: '캐릭터 2 소개 텍스트' },
  { name: '캐릭터 3', desc: '캐릭터 3 소개 텍스트' },
  { name: '캐릭터 4', desc: '캐릭터 4 소개 텍스트' },
  { name: '캐릭터 5', desc: '캐릭터 5 소개 텍스트' },
];
const undead = [
  { name: '언데드 1', desc: '언데드 1 설명 텍스트' },
  { name: '언데드 2', desc: '언데드 2 설명 텍스트' },
  { name: '언데드 3', desc: '언데드 3 설명 텍스트' },
];

// 페이지 전환: 스크롤 스냅 + 메뉴 강조
const sections = ['home', 'world', 'ascension', 'undead'];
const main = document.querySelector('main');
const video = document.querySelector('.bg-video');

function setActive(id) {
  document.querySelectorAll('[data-nav]').forEach(a => a.classList.toggle('is-active', a.dataset.nav === id));
  document.querySelector('.gnb').classList.toggle('is-scrolled', id !== 'home');
  id === 'home' ? video.play().catch(() => {}) : video.pause();
}

function route() {
  const id = location.hash.slice(1);
  document.getElementById('character').classList.toggle('is-active', id === 'character');
  if (id === 'character') return setActive('ascension');
  if (sections.includes(id)) document.getElementById(id).scrollIntoView();
}
addEventListener('hashchange', route);

// 스크롤하면 현재 보이는 페이지에 맞춰 메뉴 강조
let current = 'home';
const observer = new IntersectionObserver(entries => entries.forEach(e => {
  if (!e.isIntersecting) return;
  // 세계관에 들어올 때: 위에서 오면 챕터 1, 아래에서 오면 마지막 챕터
  if (e.target.id === 'world') {
    if (current === 'home') setChapter(0);
    else if (current === 'ascension') setChapter(steps.length - 1);
  }
  if (e.target.id === 'world') lockUntil = performance.now() + 1200;
  current = e.target.id;
  setActive(e.target.id);
  history.replaceState(null, '', '#' + e.target.id);
}), { root: main, threshold: 0.6 });
sections.forEach(id => observer.observe(document.getElementById(id)));

// 화면에 들어온 페이지만 진입 애니메이션 재생
const reveal = new IntersectionObserver(entries => entries.forEach(e => {
  e.target.classList.toggle('in', e.isIntersecting);
}), { root: main, threshold: 0.35 });
sections.forEach(id => reveal.observe(document.getElementById(id)));

// 세계관: 다음 장면
const slides = document.querySelectorAll('.world-slide');
const steps = document.querySelectorAll('.step');
slides.forEach(s => s.style.setProperty('--bg-c', s.dataset.bg));
let chapter = 0;
function setChapter(i) {
  chapter = i;
  slides.forEach((s, n) => s.classList.toggle('is-active', n === i));
  steps.forEach((b, n) => {
    b.classList.toggle('is-active', n === i);
    b.querySelector('span').textContent = n === i ? '◆' : '◇';
  });
}
steps.forEach(st => st.addEventListener('click', () => setChapter(+st.dataset.step)));

// 세계관에서는 스크롤/스와이프/방향키로 챕터를 먼저 넘기고, 끝나면 다음 페이지로
const world = document.getElementById('world');
let lockUntil = 0;
function stepChapter(dir, e) {
  if (current !== 'world' || Math.abs(main.scrollTop - world.offsetTop) > 4) return;
  const now = performance.now();
  // 잠금 중이면 트랙패드 관성 스크롤을 삼키고, 입력이 이어지는 동안 잠금 연장
  if (now < lockUntil) {
    e.preventDefault();
    lockUntil = Math.max(lockUntil, now + 250);
    return;
  }
  const next = chapter + dir;
  if (next < 0 || next >= steps.length) return;
  e.preventDefault();
  lockUntil = now + (next === 0 || next === steps.length - 1 ? 1500 : 900);
  setChapter(next);
}
main.addEventListener('wheel', e => {
  if (Math.abs(e.deltaY) > 4) stepChapter(Math.sign(e.deltaY), e);
}, { passive: false });
let touchY = 0;
main.addEventListener('touchstart', e => { touchY = e.touches[0].clientY; }, { passive: true });
main.addEventListener('touchmove', e => {
  const dy = touchY - e.touches[0].clientY;
  if (Math.abs(dy) > 40) { stepChapter(Math.sign(dy), e); touchY = e.touches[0].clientY; }
}, { passive: false });
addEventListener('keydown', e => {
  if (['ArrowDown', 'PageDown', ' '].includes(e.key)) stepChapter(1, e);
  if (['ArrowUp', 'PageUp'].includes(e.key)) stepChapter(-1, e);
});

// 어센션: 박스 클릭 → 소개 페이지
document.querySelectorAll('.card').forEach(c => c.addEventListener('click', () => {
  const d = ascension[+c.dataset.char];
  document.getElementById('charName').textContent = d.name;
  document.getElementById('charDesc').textContent = d.desc;
  location.hash = '#character';
}));
document.getElementById('backBtn').addEventListener('click', () => { location.hash = '#ascension'; });

// 언데드: 화살표 / 썸네일
let cur = 0;
const thumbs = document.getElementById('thumbs');
undead.forEach((_, i) => {
  const li = document.createElement('li');
  li.textContent = i + 1;
  li.addEventListener('click', () => showUndead(i));
  thumbs.appendChild(li);
});
const undeadBox = document.querySelector('.undead');
let swapTimer;
function showUndead(i) {
  cur = (i + undead.length) % undead.length;
  thumbs.querySelectorAll('li').forEach((li, n) => li.classList.toggle('is-active', n === cur));
  undeadBox.classList.add('swap');
  clearTimeout(swapTimer);
  swapTimer = setTimeout(() => {
    document.getElementById('undeadName').textContent = undead[cur].name;
    document.getElementById('undeadDesc').textContent = undead[cur].desc;
    undeadBox.classList.remove('swap');
  }, 300);
}
document.querySelector('.arrow.prev').addEventListener('click', () => showUndead(cur - 1));
document.querySelector('.arrow.next').addEventListener('click', () => showUndead(cur + 1));

showUndead(0);
route();
