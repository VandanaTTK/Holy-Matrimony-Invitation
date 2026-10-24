/**
 * Christian Wedding Invitation - Interactive Engine
 * Handles envelope opening, ambient music playback, countdown timer,
 * falling petals/sparkles canvas, calendar generator, and RSVP modal.
 */

document.addEventListener('DOMContentLoaded', () => {
    initEnvelopeGateway();
    initAudioController();
    initCountdown();
    initPetalsParticles();
    initCalendarDownload();
    initRsvpModal();
});

/* ==========================================================================
   1. Envelope Gateway & Music Autoplay Trigger
   ========================================================================== */
function initEnvelopeGateway() {
    const gateway = document.getElementById('envelopeGateway');
    const envelopeWrapper = document.getElementById('envelopeWrapper');
    const openBtn = document.getElementById('openInvitationBtn');

    if (!gateway) return;

    const triggerOpen = () => {
        if (envelopeWrapper.classList.contains('opening')) return;

        envelopeWrapper.classList.add('opening');

        // Start romantic wedding music upon user gesture
        if (window.weddingMusic) {
            window.weddingMusic.play();
        }

        // Animate out gateway after flap opens
        setTimeout(() => {
            gateway.classList.add('opened');
            showToast('🎶 Playing wedding melody');
        }, 850);
    };

    if (envelopeWrapper) {
        envelopeWrapper.addEventListener('click', triggerOpen);
    }
    if (openBtn) {
        openBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            triggerOpen();
        });
    }
}

/* ==========================================================================
   2. Floating Audio Controller
   ========================================================================== */
function initAudioController() {
    const controller = document.getElementById('musicController');
    const label = document.getElementById('musicLabel');

    if (!controller) return;

    controller.addEventListener('click', () => {
        if (!window.weddingMusic) return;
        window.weddingMusic.toggle();
    });

    window.addEventListener('wedding-music-status', (e) => {
        const isPlaying = e.detail.isPlaying;
        if (isPlaying) {
            controller.classList.add('playing');
            if (label) label.textContent = 'Music On';
        } else {
            controller.classList.remove('playing');
            if (label) label.textContent = 'Music Off';
        }
    });
}

/* ==========================================================================
   3. Live Wedding Countdown Timer (24-11-2026 at 10:30 AM)
   ========================================================================== */
function initCountdown() {
    const daysEl = document.getElementById('countDays');
    const hoursEl = document.getElementById('countHours');
    const minsEl = document.getElementById('countMins');
    const secsEl = document.getElementById('countSecs');

    if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

    // Wedding date: November 24, 2026 at 10:30 AM
    const targetDate = new Date(2026, 10, 24, 10, 30, 0).getTime();

    function update() {
        const now = new Date().getTime();
        const difference = targetDate - now;

        if (difference <= 0) {
            daysEl.textContent = '00';
            hoursEl.textContent = '00';
            minsEl.textContent = '00';
            secsEl.textContent = '00';
            return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        daysEl.textContent = String(days).padStart(2, '0');
        hoursEl.textContent = String(hours).padStart(2, '0');
        minsEl.textContent = String(minutes).padStart(2, '0');
        secsEl.textContent = String(seconds).padStart(2, '0');
    }

    update();
    setInterval(update, 1000);
}

/* ==========================================================================
   4. Ethereal Falling Rose Petals & Golden Sparkles
   ========================================================================== */
function initPetalsParticles() {
    const canvas = document.getElementById('particlesCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const count = 28; // Subtle, elegant performance-friendly count

    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 8 + 6,
            speedY: Math.random() * 0.8 + 0.4,
            speedX: Math.random() * 0.6 - 0.3,
            rotation: Math.random() * 360,
            rotationSpeed: Math.random() * 1.5 - 0.75,
            opacity: Math.random() * 0.45 + 0.25,
            isSparkle: Math.random() > 0.65
        });
    }

    function render() {
        ctx.clearRect(0, 0, width, height);

        particles.forEach(p => {
            p.y += p.speedY;
            p.x += Math.sin(p.y * 0.01) * 0.5 + p.speedX;
            p.rotation += p.rotationSpeed;

            if (p.y > height + 20) {
                p.y = -20;
                p.x = Math.random() * width;
            }
            if (p.x > width + 20) p.x = -20;
            if (p.x < -20) p.x = width + 20;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.globalAlpha = p.opacity;

            if (p.isSparkle) {
                // Golden sparkle star
                ctx.fillStyle = '#d4af37';
                ctx.beginPath();
                ctx.arc(0, 0, p.size * 0.25, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Soft delicate rose petal
                ctx.fillStyle = '#f3cfcf';
                ctx.beginPath();
                ctx.ellipse(0, 0, p.size * 0.8, p.size * 0.5, 0, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        });

        requestAnimationFrame(render);
    }

    render();
}

/* ==========================================================================
   5. "Add to Calendar" ICS Generator & Google Calendar
   ========================================================================== */
function initCalendarDownload() {
    const calendarBtn = document.getElementById('addToCalendarBtn');
    if (!calendarBtn) return;

    calendarBtn.addEventListener('click', (e) => {
        e.preventDefault();

        // November 24, 2026: 10:30 AM to 1:30 PM (UTC standard +5:30 or generic standard)
        // Format: YYYYMMDDTHHMMSS
        const icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Christian Wedding Invitation//EN',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            'BEGIN:VEVENT',
            'SUMMARY:Holy Matrimony: David & Sarah Wedding',
            'DESCRIPTION:Solemnisation of Holy Matrimony uniting David and Sarah in Christ. We request your prayers and presence.',
            'LOCATION:St. Mary\'s Cathedral, Church Street',
            'DTSTART:20261124T050000Z',
            'DTEND:20261124T080000Z',
            'STATUS:CONFIRMED',
            'END:VEVENT',
            'END:VCALENDAR'
        ].join('\r\n');

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute('download', 'david_sarah_wedding_24_11_2026.ics');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast('📅 Added to your calendar');
    });
}

/* ==========================================================================
   6. RSVP / Blessings Modal (No Food Details)
   ========================================================================== */
function initRsvpModal() {
    const openRsvpBtn = document.getElementById('openRsvpBtn');
    const modal = document.getElementById('rsvpModal');
    const closeBtn = document.getElementById('closeModalBtn');
    const form = document.getElementById('rsvpForm');

    if (!modal) return;

    const openModal = () => modal.classList.add('active');
    const closeModal = () => modal.classList.remove('active');

    if (openRsvpBtn) openRsvpBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const guestName = document.getElementById('guestName')?.value || 'Guest';
            const attendance = document.getElementById('guestAttendance')?.value;
            const message = document.getElementById('guestMessage')?.value;

            // Save RSVP locally
            const rsvpData = {
                guestName,
                attendance,
                message,
                timestamp: new Date().toISOString()
            };
            const currentList = JSON.parse(localStorage.getItem('wedding_rsvps') || '[]');
            currentList.push(rsvpData);
            localStorage.setItem('wedding_rsvps', JSON.stringify(currentList));

            closeModal();
            form.reset();
            showToast('🕊️ Thank you for your prayers and blessings!');
        });
    }
}

/* ==========================================================================
   Toast Notification Helper
   ========================================================================== */
function showToast(message) {
    let toast = document.getElementById('siteToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'siteToast';
        toast.className = 'toast-notification';
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add('active');

    setTimeout(() => {
        toast.classList.remove('active');
    }, 3500);
}
