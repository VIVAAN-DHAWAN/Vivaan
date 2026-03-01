/* ============================================
   VIVAAN DHAWAN PORTFOLIO — SCRIPT
   ReactBits-inspired effects in vanilla JS:
   1. Click Spark
   2. Pill Nav (animated indicator)
   3. Glass Surface (mouse light)
   4. Chroma Grid (color overlay)
   5. Circular Gallery (3D carousel)
   6. Three.js Globe
   ============================================ */

/* ===== 1. CLICK SPARK ===== */
(function () {
    const canvas = document.getElementById('sparkCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let sparks = [];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class Spark {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4 + 2;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.life = 1;
            this.decay = Math.random() * 0.03 + 0.02;
            this.size = Math.random() * 3 + 1;
            this.hue = 265 + Math.random() * 30; // purple range
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += 0.05; // gravity
            this.life -= this.decay;
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = this.life;
            ctx.fillStyle = `hsl(${this.hue}, 80%, 65%)`;
            ctx.shadowColor = `hsl(${this.hue}, 90%, 60%)`;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    document.addEventListener('click', (e) => {
        for (let i = 0; i < 12; i++) {
            sparks.push(new Spark(e.clientX, e.clientY));
        }
    });

    function loop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        sparks = sparks.filter(s => s.life > 0);
        sparks.forEach(s => { s.update(); s.draw(); });
        requestAnimationFrame(loop);
    }
    loop();
})();

/* ===== 2. PILL NAV — ANIMATED INDICATOR ===== */
(function () {
    const wrap = document.querySelector('.pill-nav-wrap');
    const indicator = document.getElementById('pillIndicator');
    const links = document.querySelectorAll('.pill-link');
    if (!wrap || !indicator || !links.length) return;

    function moveIndicator(link) {
        const wrapRect = wrap.getBoundingClientRect();
        const linkRect = link.getBoundingClientRect();
        indicator.style.left = (linkRect.left - wrapRect.left) + 'px';
        indicator.style.width = linkRect.width + 'px';
    }

    // Set initial position
    const activeLink = wrap.querySelector('.pill-link.active');
    if (activeLink) {
        // Wait for fonts to load
        requestAnimationFrame(() => requestAnimationFrame(() => moveIndicator(activeLink)));
    }

    // Click handler
    links.forEach(link => {
        link.addEventListener('click', () => {
            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            moveIndicator(link);
        });
    });

    // Scroll spy — update active pill based on scroll position
    const sections = Array.from(links).map(l => document.getElementById(l.dataset.section)).filter(Boolean);
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(sec => {
            const top = sec.offsetTop - 200;
            if (window.scrollY >= top) current = sec.id;
        });
        if (current) {
            links.forEach(l => l.classList.remove('active'));
            const activeL = wrap.querySelector(`.pill-link[data-section="${current}"]`);
            if (activeL) {
                activeL.classList.add('active');
                moveIndicator(activeL);
            }
        }
    });

    // Recalculate on resize
    window.addEventListener('resize', () => {
        const act = wrap.querySelector('.pill-link.active');
        if (act) moveIndicator(act);
    });
})();

/* ===== 3. GLASS SURFACE — MOUSE LIGHT ===== */
(function () {
    document.querySelectorAll('.glass-surface').forEach(el => {
        el.addEventListener('mousemove', e => {
            const r = el.getBoundingClientRect();
            const x = ((e.clientX - r.left) / r.width) * 100;
            const y = ((e.clientY - r.top) / r.height) * 100;
            el.style.setProperty('--glass-x', x + '%');
            el.style.setProperty('--glass-y', y + '%');
        });
    });
})();

/* ===== 4. CHROMA GRID — COLOR OVERLAYS ===== */
(function () {
    document.querySelectorAll('.chroma-card').forEach(card => {
        const color = card.dataset.color || '#7B39FC';
        const overlay = card.querySelector('.chroma-overlay');
        if (overlay) {
            overlay.style.background = `radial-gradient(circle at var(--mx, 50%) var(--my, 50%), ${color}22 0%, transparent 70%)`;
        }
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            const mx = ((e.clientX - r.left) / r.width * 100) + '%';
            const my = ((e.clientY - r.top) / r.height * 100) + '%';
            card.style.setProperty('--mx', mx);
            card.style.setProperty('--my', my);
            if (overlay) {
                overlay.style.background = `radial-gradient(circle at ${mx} ${my}, ${color}33 0%, transparent 70%)`;
            }
        });
    });
})();

/* ===== 5. CIRCULAR GALLERY — 3D CAROUSEL ===== */
(function () {
    const gallery = document.getElementById('circularGallery');
    if (!gallery) return;
    const items = gallery.querySelectorAll('.cg-item');
    const count = items.length;
    let rotation = 0;
    const radius = 280;

    function positionItems(angle) {
        items.forEach((item, i) => {
            const theta = (i / count) * Math.PI * 2 + angle;
            const x = Math.sin(theta) * radius;
            const z = Math.cos(theta) * radius;
            const scale = (z + radius) / (2 * radius) * 0.5 + 0.5;
            const opacity = scale;
            item.style.transform = `translateX(${x}px) translateZ(${z}px) scale(${scale})`;
            item.style.opacity = opacity;
            item.style.zIndex = Math.round(scale * 100);
        });
    }

    positionItems(0);

    // Auto-rotate
    let autoRotate = setInterval(() => {
        rotation += 0.008;
        positionItems(rotation);
    }, 30);

    // Drag to rotate
    let dragging = false, startX = 0;
    gallery.addEventListener('mousedown', e => { dragging = true; startX = e.clientX; clearInterval(autoRotate); });
    window.addEventListener('mouseup', () => {
        dragging = false;
        autoRotate = setInterval(() => { rotation += 0.008; positionItems(rotation); }, 30);
    });
    window.addEventListener('mousemove', e => {
        if (!dragging) return;
        const dx = e.clientX - startX;
        startX = e.clientX;
        rotation += dx * 0.005;
        positionItems(rotation);
    });

    // Touch support
    gallery.addEventListener('touchstart', e => { dragging = true; startX = e.touches[0].clientX; clearInterval(autoRotate); });
    window.addEventListener('touchend', () => {
        dragging = false;
        autoRotate = setInterval(() => { rotation += 0.008; positionItems(rotation); }, 30);
    });
    window.addEventListener('touchmove', e => {
        if (!dragging) return;
        const dx = e.touches[0].clientX - startX;
        startX = e.touches[0].clientX;
        rotation += dx * 0.005;
        positionItems(rotation);
    });
})();

/* ===== 6. THREE.JS GLOBE ===== */
(function () {
    const canvas = document.getElementById('globeCanvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.z = 2.8;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const globe = new THREE.Mesh(
        new THREE.SphereGeometry(1.2, 60, 60),
        new THREE.MeshBasicMaterial({ color: 0x7B39FC, wireframe: true, transparent: true, opacity: 0.12 })
    );
    scene.add(globe);

    const core = new THREE.Mesh(
        new THREE.SphereGeometry(1.18, 60, 60),
        new THREE.MeshBasicMaterial({ color: 0x060010, transparent: true, opacity: 0.9 })
    );
    scene.add(core);

    const dotCount = 5000;
    const positions = new Float32Array(dotCount * 3);
    for (let i = 0; i < dotCount; i++) {
        const phi = Math.acos(2 * Math.random() - 1);
        const theta = 2 * Math.PI * Math.random();
        const r = 1.205;
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);
    }
    const dotGeo = new THREE.BufferGeometry();
    dotGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const dots = new THREE.Points(dotGeo, new THREE.PointsMaterial({ color: 0xAA77FF, size: 0.01, transparent: true, opacity: 0.6, sizeAttenuation: true }));
    scene.add(dots);

    const atmos = new THREE.Mesh(
        new THREE.SphereGeometry(1.28, 64, 64),
        new THREE.MeshBasicMaterial({ color: 0x9B59FC, transparent: true, opacity: 0.08, side: THREE.BackSide })
    );
    scene.add(atmos);

    const halo = new THREE.Mesh(
        new THREE.SphereGeometry(1.45, 64, 64),
        new THREE.MeshBasicMaterial({ color: 0x7B39FC, transparent: true, opacity: 0.04, side: THREE.BackSide })
    );
    scene.add(halo);

    const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.35, 0.008, 16, 200),
        new THREE.MeshBasicMaterial({ color: 0x9B59FC, transparent: true, opacity: 0.25 })
    );
    ring.rotation.x = Math.PI / 2.2;
    ring.rotation.z = 0.15;
    scene.add(ring);

    function animate() {
        requestAnimationFrame(animate);
        const s = 0.002;
        globe.rotation.y += s; core.rotation.y += s; dots.rotation.y += s;
        atmos.rotation.y += s * 0.5; halo.rotation.y += s * 0.3; ring.rotation.z += 0.0005;
        renderer.render(scene, camera);
    }
    animate();

    function onResize() {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    }
    window.addEventListener('resize', onResize);
})();

/* ===== UI INTERACTIONS ===== */
document.addEventListener('DOMContentLoaded', () => {
    // Scroll reveal
    const revealEls = document.querySelectorAll('.sec-title, .sec-sub, .sec-body, .chroma-card, .glass-panel, .handles, .cg-item');
    revealEls.forEach(el => el.classList.add('reveal'));
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.1 });
    revealEls.forEach(el => obs.observe(el));

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            e.preventDefault();
            const t = document.querySelector(a.getAttribute('href'));
            if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    // Navbar scroll
    const nav = document.getElementById('navbar');
    window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 60));

    // Hamburger
    const ham = document.getElementById('hamburger');
    if (ham) ham.addEventListener('click', () => nav.classList.toggle('open'));
});
