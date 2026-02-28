// NAV
const nav = document.getElementById('nav');
const burger = document.getElementById('burger');
const navMid = document.getElementById('navMid');

window.addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 20));

burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    navMid.classList.toggle('open');
});

navMid.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
        burger.classList.remove('open');
        navMid.classList.remove('open');
    });
});

// SMOOTH SCROLL
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        e.preventDefault();
        const t = document.querySelector(a.getAttribute('href'));
        if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

// CMD TABS
document.querySelectorAll('.cmd-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const cat = btn.dataset.cat;
        document.querySelectorAll('.cmd-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.cmd-panel').forEach(p => p.classList.toggle('active', p.dataset.cat === cat));
    });
});

// STATS
function fmt(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toLocaleString('de-DE');
}

function countUp(el, target) {
    const dur = 1500;
    const start = performance.now();
    function tick(now) {
        const p = Math.min((now - start) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(Math.floor(target * ease));
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = fmt(target);
    }
    requestAnimationFrame(tick);
}

async function loadStats() {
    try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        if (data.servers > 0) {
            countUp(document.getElementById('hServers'), data.servers);
            countUp(document.getElementById('sServers'), data.servers);
            countUp(document.getElementById('hUsers'), data.users);
            countUp(document.getElementById('sUsers'), data.users);
        }
    } catch (e) {
        console.warn('Stats unavailable:', e);
    }
}

document.getElementById('refreshBtn').addEventListener('click', function() {
    this.querySelector('i').style.animation = 'spin .6s linear';
    loadStats();
    setTimeout(() => this.querySelector('i').style.animation = '', 700);
});

const spinCSS = document.createElement('style');
spinCSS.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
document.head.appendChild(spinCSS);

// SCROLL REVEAL
const reveal = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.style.opacity = '1';
            e.target.style.transform = 'translateY(0)';
            reveal.unobserve(e.target);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.card, .sys-block, .faq-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = 'opacity .4s ease, transform .4s ease';
    reveal.observe(el);
});

// TERMINAL TYPING
function typeTerminal() {
    const lines = document.querySelectorAll('.t-line');
    lines.forEach((line, i) => {
        line.style.opacity = '0';
        setTimeout(() => {
            line.style.transition = 'opacity .3s';
            line.style.opacity = '1';
        }, i * 200 + 500);
    });
}

const termObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            typeTerminal();
            termObs.unobserve(e.target);
        }
    });
}, { threshold: 0.3 });
termObs.observe(document.querySelector('.terminal'));

// INIT
document.addEventListener('DOMContentLoaded', loadStats);
setInterval(loadStats, 300000);