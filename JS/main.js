// --- LOGIC CHO SPLASH SCREEN ---
window.addEventListener('load', () => {
    const splashScreen = document.getElementById('splash-screen');
    const splashLogo = document.getElementById('splash-logo');
    const splashExpander = document.getElementById('splash-expander'); // Thêm
    const mainContent = document.getElementById('main-content');
    const spinner = document.getElementById('splash-spinner');
    const scrollBtn = document.getElementById('scroll-to-form');

    // Đợi 2 giây sau khi mọi thứ tải xong
    setTimeout(() => {
        // Dừng vòng xoay
        spinner.style.animation = 'none';

        // Kích hoạt tất cả các lớp exit
        // CSS transition-delay sẽ xử lý thứ tự
        splashLogo.classList.add('exit-shrink');
        splashExpander.classList.add('exit-expand');
        splashScreen.classList.add('exit-fade');
        mainContent.classList.add('visible');

        // Sau khi hiệu ứng transition kết thúc, ẩn hoàn toàn splash screen
        splashScreen.addEventListener('transitionend', (e) => {
            // Chỉ bắt sự kiện 'opacity' để tránh bị kích hoạt bởi transform
            if (e.propertyName === 'opacity') {
                splashScreen.style.display = 'none';

                // Animate scroll button now that splash has fully exited
                if (scrollBtn) {
                    scrollBtn.classList.add('animate-expand');
                }

                // Small pop-up attached to the Music Space informing about the new audio space
                try {
                    const mount = document.body; 
                    const existing = document.querySelector('.music-modal-overlay');
                    if (!existing) {
                        const overlay = document.createElement('div');
                        overlay.className = 'music-modal-overlay';
                        overlay.setAttribute('role', 'dialog');
                        overlay.setAttribute('aria-modal', 'true');
                        overlay.innerHTML = `
                            <div class="music-modal" role="document">
                                <h2 class="music-modal-title">MUSIC SPACE đã có !</h2>
                                <p class="music-modal-desc">Trải nghiệm không gian âm nhạc trong mùa Noel này.</p>
                                <div class="music-modal-actions">
                                    <button class="music-modal-btn" type="button">Trải Nghiệm Ngay</button>
                                </div>
                            </div>
                        `;
                        mount.appendChild(overlay);

                        // show with transition
                        requestAnimationFrame(() => overlay.classList.add('show'));

                        const actBtn = overlay.querySelector('.music-modal-btn');
                        actBtn.addEventListener('click', () => {
                            // trigger existing player Play button (this is a user gesture)
                            const playBtn = document.querySelector('#music-space .ms-play');
                            if (playBtn) {
                                try { playBtn.click(); } catch (e) { console.warn(e); }
                            } else {
                                // fallback message if player not ready
                                showMessage('Đang chuẩn bị Music Space...', 'info');
                            }

                            // close modal
                            overlay.classList.remove('show');
                            overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
                        });
                    }
                } catch (err) {
                    console.warn('Music popup creation failed', err);
                }
            }
        });
        // No per-section background anymore; background handled at body level

    }, 2000); // 2 giây
});


// --- PHẦN JAVASCRIPT ĐỂ GỬI DATA VỀ GOOGLE SHEET ---

// BƯỚC 6: Dán URL Web App của bạn vào đây
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzfH61O-62OZnn5A2M_R14HLQsYlHDWC_21KrR38ZNIN0q1ou49G16SURNNsB_BIqvf/exec';

const form = document.getElementById('contact-form');
const submitButton = document.getElementById('submit-button');
// Setup option-button groups (gender and membership)
(() => {
    const optionButtons = document.querySelectorAll('.option-button');
    optionButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const name = btn.dataset.name;
            const value = btn.dataset.value;
            if (!name) return;

            // deactivate siblings with same data-name
            document.querySelectorAll(`.option-button[data-name="${name}"]`).forEach(sib => sib.classList.remove('active'));
            btn.classList.add('active');

            // set hidden input value
            const hidden = document.getElementById(name);
            if (hidden) hidden.value = value;
        });
    });
})();

// Validation helper
function validateForm() {
    // clear previous invalid states
    document.querySelectorAll('.form-input, .option-group').forEach(el => el.classList.remove('invalid'));

    const Ten = document.getElementById('Ten');
    const NamSinh = document.getElementById('NamSinh');
    const GioiTinh = document.getElementById('GioiTinh');
    const ThanhVien = document.getElementById('ThanhVien');
    const Email = document.getElementById('Email');
    const SoDienThoai = document.getElementById('SoDienThoai');

    if (!Ten || !Ten.value.trim()) {
        Ten.classList.add('invalid');
        Ten.focus();
        showMessage('Vui lòng nhập Họ và Tên', 'error');
        return false;
    }

    const year = parseInt(NamSinh.value, 10);
    const currentYear = new Date().getFullYear();
    if (isNaN(year) || year < 1900 || year > currentYear) {
        NamSinh.classList.add('invalid');
        NamSinh.focus();
        showMessage('Vui lòng nhập Năm sinh hợp lệ', 'error');
        return false;
    }

    if (!GioiTinh || !GioiTinh.value) {
        // mark option-group invalid
        const group = document.querySelector('.option-button[data-name="GioiTinh"]')?.parentElement;
        if (group) group.classList.add('invalid');
        showMessage('Vui lòng chọn Giới tính', 'error');
        return false;
    }

    if (!ThanhVien || !ThanhVien.value) {
        const group = document.querySelector('.option-button[data-name="ThanhVien"]')?.parentElement;
        if (group) group.classList.add('invalid');
        showMessage('Vui lòng chọn trạng thái thành viên', 'error');
        return false;
    }

    if (!Email || !/^[\w.%+-]+@gmail\.com$/i.test(Email.value.trim())) {
        Email.classList.add('invalid');
        Email.focus();
        showMessage('Vui lòng nhập email Gmail hợp lệ', 'error');
        return false;
    }

    if (!SoDienThoai || !/^\d{10}$/.test(SoDienThoai.value.trim())) {
        SoDienThoai.classList.add('invalid');
        SoDienThoai.focus();
        showMessage('Số điện thoại phải đúng 10 chữ số', 'error');
        return false;
    }

    return true;
}

form.addEventListener('submit', function (e) {
    e.preventDefault(); // Ngăn form gửi theo cách truyền thống

    if (!validateForm()) return;

    // Vô hiệu hóa nút và hiển thị trạng thái đang gửi
    submitButton.disabled = true;
    submitButton.textContent = 'Đang gửi...';

    const formData = new FormData(form);

    // Gửi dữ liệu đến Google Apps Script
    fetch(SCRIPT_URL, {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.result === 'success') {
                // Gửi thành công
                showMessage('Gửi thông tin thành công!', 'success');
                form.reset(); // Xóa rỗng form
                // reset option buttons active states
                document.querySelectorAll('.option-button.active').forEach(b => b.classList.remove('active'));
            } else {
                // Có lỗi xảy ra
                console.error('Error from Apps Script:', data.error);
                showMessage('Gửi thất bại. Vui lòng thử lại.', 'error');
            }
        })
        .catch(error => {
            // Lỗi mạng hoặc fetch
            console.error('Fetch Error:', error);
            showMessage('Lỗi kết nối. Vui lòng thử lại.', 'error');
        })
        .finally(() => {
            // Kích hoạt lại nút
            submitButton.disabled = false;
            submitButton.textContent = 'Gửi Thông Tin';
        });
});

// Hàm hiển thị thông báo kiểu stacked glass (top-down)
function showMessage(message, type = 'info', timeout = 3500) {
    // Ensure notifications container exists
    let container = document.getElementById('notifications');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notifications';
        container.className = 'notifications';
        container.setAttribute('aria-live', 'polite');
        container.setAttribute('aria-atomic', 'true');
        document.body.appendChild(container);
    }

    // Create notification card
    const card = document.createElement('div');
    card.className = `notification ${type}`;

    const icon = document.createElement('div');
    icon.className = 'icon';
    if (type === 'success') icon.innerHTML = '<span class="material-symbols-outlined">check_circle</span>';
    else if (type === 'error') icon.innerHTML = '<span class="material-symbols-outlined">error</span>';
    else icon.innerHTML = '<span class="material-symbols-outlined">info</span>';

    const content = document.createElement('div');
    content.className = 'content';
    content.textContent = message;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-btn';
    closeBtn.setAttribute('aria-label', 'Đóng thông báo');
    closeBtn.innerHTML = '<span class="material-symbols-outlined">close</span>';
    closeBtn.addEventListener('click', () => dismiss(card));

    card.appendChild(icon);
    card.appendChild(content);
    card.appendChild(closeBtn);

    // Prepend to show newest on top (top-down stacking)
    container.prepend(card);

    // Allow CSS transition to play
    requestAnimationFrame(() => requestAnimationFrame(() => card.classList.add('show')));

    const auto = setTimeout(() => dismiss(card), timeout);

    function dismiss(el) {
        if (!el) return;
        el.classList.remove('show');
        el.addEventListener('transitionend', () => {
            if (el.parentElement) el.remove();
        }, { once: true });
        clearTimeout(auto);
    }
}

/* COUNTDOWN LOGIC */
(() => {
    // Adjust target date/time here (YYYY, M-1, D, H, M, S)
    const TARGET = new Date(2025, 11, 24, 20, 0, 0); // Dec 24, 2025 20:00:00 (example)
    const countdownTimeEl = document.getElementById('countdown-time');
    const countdownStatusEl = document.getElementById('countdown-status');

    if (!countdownTimeEl || !countdownStatusEl) return;

    function updateCountdown() {
        const now = new Date();
        const diff = TARGET - now;

        if (diff <= 0) {
            countdownTimeEl.textContent = 'Sự kiện đang diễn ra';
            countdownStatusEl.textContent = 'Đã bắt đầu';
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        countdownTimeEl.textContent = `${days} ngày ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        // Status message logic
        if (days >= 7) {
            countdownStatusEl.textContent = 'Sắp diễn ra';
        } else if (days >= 1) {
            countdownStatusEl.textContent = `Còn ${days} ngày`;
        } else {
            countdownStatusEl.textContent = 'Sắp bắt đầu';
        }
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
})();

// Scroll button click behavior (smooth scroll to form)
(() => {
    const btn = document.getElementById('scroll-to-form');
    const form = document.getElementById('contact-form');
    if (!btn || !form) return;
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
})();

/* MUSIC SPACE - audio player logic */
(function () {
    const MUSIC_DIR = './DATA/MUSIC/'; // folder where tracks should live
    const container = document.getElementById('music-space');
    if (!container) return; // no player in DOM

    const btnPlay = container.querySelector('.ms-play');
    const btnPrev = container.querySelector('.ms-prev');
    const btnNext = container.querySelector('.ms-next');
    const titleEl = container.querySelector('.ms-title');
    const statusEl = container.querySelector('.ms-status');
    const progressBar = container.querySelector('.ms-progress-bar');

    let playlist = [];
    let current = 0;
    const audio = new Audio();
    audio.preload = 'auto';

    // Try to load playlist.json from MUSIC_DIR. Expected: ["song1.mp3","song2.mp3"] or [{"file":"x.mp3","title":"..."},...]
    async function loadPlaylist() {
        try {
            const res = await fetch(MUSIC_DIR + 'playlist.json', { cache: 'no-cache' });
            console.log('Fetching playlist from', MUSIC_DIR + 'playlist.json', res);
            if (!res.ok) throw new Error('No playlist.json');
            const data = await res.json();
            if (!Array.isArray(data) || data.length === 0) throw new Error('Empty playlist');
            // Normalize entries
            playlist = data.map(item => {
                if (typeof item === 'string') return { file: item, title: item };
                return { file: item.file, title: item.title || item.file };
            });
            statusEl.textContent = `${playlist.length} track(s)`;
            titleEl.textContent = playlist[0].title || 'Track 1';
        } catch (err) {
            // No playlist.json — inform user how to add files
            playlist = [];
            statusEl.textContent = 'No tracks. Add files to /DATA/MUSIC or create playlist.json';
            titleEl.textContent = 'Music Space';
            console.info('Music Space: playlist.json not found or empty in', MUSIC_DIR);
        }
    }

    function getTrackUrl(entry) {
        // If entry.file is an absolute url, use it; else prefix folder
        try {
            const u = new URL(entry.file);
            return entry.file; // absolute
        } catch (_) {
            return MUSIC_DIR + entry.file;
        }
    }

    function updatePlayButton() {
        if (audio.paused) btnPlay.innerHTML = '<span class="material-symbols-outlined">play_arrow</span>';
        else btnPlay.innerHTML = '<span class="material-symbols-outlined">pause</span>';
    }

    function loadTrack(idx /*, autoplay ignored to avoid autoplay attempts */) {
        if (!playlist || playlist.length === 0) return;
        current = (idx + playlist.length) % playlist.length;
        const entry = playlist[current];
        audio.src = getTrackUrl(entry);
        titleEl.textContent = entry.title || entry.file;
        statusEl.textContent = `Track ${current + 1} / ${playlist.length}`;
        progressBar.style.width = '0%';
        // NOTE: autoplay attempts removed to comply with browser autoplay policies.
        // Playback will only start on explicit user gesture (Play button).
        updatePlayButton();
    }

    btnPlay.addEventListener('click', () => {
        if (!playlist || playlist.length === 0) {
            showMessage('Không có bài nào. Thêm tệp vào /DATA/MUSIC hoặc tạo playlist.json', 'info');
            return;
        }
        if (audio.paused) {
            audio.play().catch(() => showMessage('Vui lòng nhấn Play lần nữa để cho phép trình duyệt phát nhạc', 'info'));
        } else audio.pause();
        updatePlayButton();
    });

    btnPrev.addEventListener('click', () => {
        if (!playlist || playlist.length === 0) return showMessage('Không có bài nào để phát', 'info');
        loadTrack(current - 1, true);
    });

    btnNext.addEventListener('click', () => {
        if (!playlist || playlist.length === 0) return showMessage('Không có bài nào để phát', 'info');
        loadTrack(current + 1, true);
    });

    audio.addEventListener('timeupdate', () => {
        if (!audio.duration || Number.isNaN(audio.duration)) return;
        const pct = (audio.currentTime / audio.duration) * 100;
        progressBar.style.width = pct + '%';
    });

    audio.addEventListener('play', updatePlayButton);
    audio.addEventListener('pause', updatePlayButton);

    audio.addEventListener('ended', () => {
        // auto next: load next track then attempt to play it.
        if (playlist && playlist.length > 0) {
            loadTrack(current + 1);
            // Attempt to play the newly loaded track. If the browser blocks
            // autoplay (no recent user gesture), catch the rejection and
            // prompt the user to press Play.
            audio.play().catch(() => {
                statusEl.textContent = 'Click play to start';
                updatePlayButton();
            });
        }
    });

    // Initialize
    loadPlaylist().then(() => {
        if (playlist && playlist.length > 0) {
            loadTrack(0, false);
        }
        // Removed automatic 'tryPlayOnUserGesture' listeners — playback will
        // only start when the user explicitly presses the Play button.
    });

    // (No global exposure) keep scope internal to avoid unintended external control
})();