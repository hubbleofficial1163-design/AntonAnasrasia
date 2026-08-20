// ==============================================
// СВАДЕБНЫЙ САЙТ - АНТОН & АНАСТАСИЯ
// Интеграция с Google Sheets
// ==============================================

(function() {
    // ========== КОНФИГУРАЦИЯ ==========
    // ⚠️ ЗАМЕНИТЕ ЭТОТ URL НА ВАШ URL ИЗ APPS SCRIPT ⚠️
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzZ2UpM7w_-m0f98yOk0WKAruQ6BPvuG1C67DhpLq8QD7hDJrbs1bAjvkS6ysw9T7Z2/exec';
    
    let isSubmitting = false;
    
    // ========== БАЗОВЫЕ СТИЛИ АНИМАЦИЙ ==========
    const coreStyles = document.createElement('style');
    coreStyles.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        @keyframes rotateText {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(coreStyles);
    
    // ========== УНИВЕРСАЛЬНОЕ МОДАЛЬНОЕ ОКНО ==========
    function showModal(title, message, isError = false) {
        const existingModal = document.getElementById('customModal');
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.id = 'customModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        `;

        const icon = isError ? '✕' : '✓';
        const iconColor = isError ? '#c62828' : '#2e7d32';
        const bgIconColor = isError ? '#ffebee' : '#e8f5e9';
        const borderColor = isError ? '#c62828' : '#2e7d32';

        modal.innerHTML = `
            <div style="
                background: #ffffff;
                border-radius: 16px;
                padding: 32px 40px;
                max-width: 380px;
                width: 90%;
                text-align: center;
                box-shadow: 0 20px 35px rgba(0, 0, 0, 0.15);
                animation: slideUp 0.3s ease;
                border-top: 3px solid ${borderColor};
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            ">
                <div style="
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: ${bgIconColor};
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px auto;
                ">
                    <div style="
                        font-size: 32px;
                        font-weight: 400;
                        color: ${iconColor};
                        line-height: 1;
                    ">${icon}</div>
                </div>
                <h3 style="
                    font-size: 24px;
                    font-weight: 500;
                    color: #1a1a1a;
                    margin-bottom: 12px;
                    letter-spacing: -0.3px;
                ">${title}</h3>
                <p style="
                    font-size: 16px;
                    color: #555555;
                    margin-bottom: 28px;
                    line-height: 1.5;
                ">${message}</p>
                <button onclick="this.closest('#customModal').remove()" style="
                    background: #f5f5f5;
                    color: #333333;
                    border: none;
                    padding: 12px 32px;
                    border-radius: 40px;
                    font-family: inherit;
                    font-size: 15px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                " onmouseover="this.style.background='#e8e8e8'" onmouseout="this.style.background='#f5f5f5'">
                    Закрыть
                </button>
            </div>
        `;

        document.body.appendChild(modal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        if (!isError) {
            setTimeout(() => {
                if (modal.parentElement) modal.remove();
            }, 4000);
        }
    }
    
    // ========== МОДАЛЬНОЕ ОКНО ЗАГРУЗКИ ==========
    function showLoadingModal() {
        const existingLoading = document.getElementById('loadingModal');
        if (existingLoading) existingLoading.remove();
        
        const loadingModal = document.createElement('div');
        loadingModal.id = 'loadingModal';
        loadingModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(3px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        `;
        loadingModal.innerHTML = `
            <div style="
                background: white;
                border-radius: 16px;
                padding: 32px 40px;
                text-align: center;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            ">
                <div style="
                    width: 50px;
                    height: 50px;
                    border: 3px solid #e0e0e0;
                    border-top-color: #5c151b;
                    border-radius: 50%;
                    margin: 0 auto 20px;
                    animation: spin 1s linear infinite;
                "></div>
                <p style="
                    font-size: 15px;
                    color: #5c151b;
                    margin: 0;
                    font-weight: 500;
                ">Отправка ответа...</p>
            </div>
        `;
        document.body.appendChild(loadingModal);
        return loadingModal;
    }
    
    // ========== ОТПРАВКА В GOOGLE SHEETS ==========
    async function sendToGoogleSheets(formData) {
        const formBody = new URLSearchParams();
        formBody.append('name', formData.name);
        formBody.append('guests', formData.guests);
        formBody.append('attendance', formData.attendance);
        if (formData.alcohol) formBody.append('alcohol', formData.alcohol);
        if (formData.food) formBody.append('food', formData.food);
        
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formBody.toString()
        });
        
        const result = await response.json();
        return result;
    }
    
    // ========== ТАЙМЕР ==========
    function updateCountdown() {
        const weddingDate = new Date('2026-11-11T15:30:00').getTime();
        const now = new Date().getTime();
        const diff = weddingDate - now;
        
        if (diff > 0) {
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            const daysEl = document.getElementById('days');
            const hoursEl = document.getElementById('hours');
            const minutesEl = document.getElementById('minutes');
            const secondsEl = document.getElementById('seconds');
            
            if (daysEl) daysEl.textContent = days.toString();
            if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
            if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, '0');
            if (secondsEl) secondsEl.textContent = seconds.toString().padStart(2, '0');
        }
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
    
    // ========== МУЗЫКАЛЬНЫЙ ПЛЕЕР ==========
    function initMusicPlayer() {
        const playButton = document.getElementById('playButton');
        const weddingMusic = document.getElementById('weddingMusic');
        const circlePlayer = document.querySelector('.circle-player');
        
        if (!playButton || !weddingMusic || !circlePlayer) return;
        
        let isPlaying = false;
        
        playButton.addEventListener('click', function() {
            if (isPlaying) {
                weddingMusic.pause();
                weddingMusic.currentTime = 0;
                playButton.classList.remove('playing');
                circlePlayer.classList.remove('music-playing');
                isPlaying = false;
            } else {
                weddingMusic.play()
                    .then(() => {
                        playButton.classList.add('playing');
                        circlePlayer.classList.add('music-playing');
                        isPlaying = true;
                    })
                    .catch(error => {
                        console.log('Для воспроизведения нажмите еще раз');
                        playButton.classList.add('playing');
                        circlePlayer.classList.add('music-playing');
                        isPlaying = true;
                    });
            }
        });
        
        document.addEventListener('visibilitychange', function() {
            if (document.hidden && isPlaying) {
                weddingMusic.pause();
                weddingMusic.currentTime = 0;
                isPlaying = false;
                playButton.classList.remove('playing');
                circlePlayer.classList.remove('music-playing');
            }
        });
    }
    
    // ========== ИНИЦИАЛИЗАЦИЯ ФОРМЫ ==========
    function initRSVPForm() {
        const form = document.querySelector('.rsvp-form');
        if (!form) {
            console.error('❌ Форма .rsvp-form не найдена!');
            return;
        }
        
        console.log('✅ Форма найдена, инициализация...');
        
        const nameInput = form.querySelector('input[type="text"]');
        const guestsSelect = form.querySelector('.form-select');
        const attendanceRadios = form.querySelectorAll('input[name="attendance"]');
        const alcoholSelect = document.getElementById('alcoholSelect');
        const foodSelect = document.getElementById('foodSelect');
        const submitBtn = form.querySelector('.submit-button');
        
        // Убираем старый обработчик
        form.onsubmit = null;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (isSubmitting) return;
            
            const name = nameInput ? nameInput.value.trim() : '';
            const guests = guestsSelect ? guestsSelect.value : '1';
            
            let attendance = null;
            attendanceRadios.forEach(radio => {
                if (radio.checked) attendance = radio.value;
            });
            
            const alcohol = alcoholSelect ? alcoholSelect.value : '';
            const food = foodSelect ? foodSelect.value : '';
            
            // Валидация
            if (!name) {
                showModal('Ошибка', 'Пожалуйста, введите ваше имя', true);
                if (nameInput) nameInput.focus();
                return;
            }
            
            if (!attendance) {
                showModal('Ошибка', 'Пожалуйста, выберите вариант присутствия', true);
                return;
            }
            
            // Блокируем кнопку
            isSubmitting = true;
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Отправка...';
            }
            
            const loadingModal = showLoadingModal();
            
            try {
                const formData = { 
                    name: name, 
                    guests: guests,
                    attendance: attendance,
                    alcohol: alcohol,
                    food: food
                };
                
                const result = await sendToGoogleSheets(formData);
                
                loadingModal.remove();
                
                if (result.result === 'success') {
                    let responseMessage = '';
                    if (attendance === 'yes') {
                        responseMessage = `Спасибо, ${name}! Будем ждать вас на нашей свадьбе 11 ноября 2026 года! 🎉`;
                    } else {
                        responseMessage = `Спасибо за ответ, ${name}! Очень жаль, что вы не сможете быть с нами.`;
                    }
                    
                    showModal('Ответ отправлен!', responseMessage, false);
                    
                    // Очищаем форму
                    if (nameInput) nameInput.value = '';
                    if (guestsSelect) guestsSelect.value = '';
                    attendanceRadios.forEach(radio => radio.checked = false);
                    if (alcoholSelect) alcoholSelect.value = '';
                    if (foodSelect) foodSelect.value = '';
                    
                    if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
                } else {
                    throw new Error(result.message || 'Ошибка отправки');
                }
            } catch (error) {
                loadingModal.remove();
                showModal('Ошибка', error.message || 'Произошла ошибка при отправке. Пожалуйста, попробуйте ещё раз.', true);
            } finally {
                isSubmitting = false;
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Подтвердить';
                }
            }
        });
    }
    
    // ========== ЗАПУСК ==========
    document.addEventListener('DOMContentLoaded', function() {
        // Таймер
        updateCountdown();
        setInterval(updateCountdown, 1000);
        
        // Музыкальный плеер
        initMusicPlayer();
        
        // Форма
        initRSVPForm();
        
        console.log('✅ Форма RSVP готова к отправке в Google Sheets');
        console.log('📊 URL скрипта:', SCRIPT_URL);
    });
    
})();
