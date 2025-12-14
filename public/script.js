const BACKEND_URL = '';
const FRONTEND_IMG_PATH = '/images/signature/';

const bgm = new Audio('./sounds/bgm2.mp3');
const sfxClick = new Audio('./sounds/click2.mp3')
const sfxType = new Audio('./sounds/Typing.mp3')
const sfxBaby = new Audio('./sounds/baby.mp3')
bgm.loop = true;
bgm.volume = 0;
sfxClick.volume = 1;
sfxType.volume = 0.4;
sfxType.loop = true;
sfxBaby.volume = 0.4;
sfxBaby.loop = false;

let hasStartedMusic = false;
let myDecision = 'support';
let voteRefreshInterval = null;

function fetchAndDisplayVotes() {
    fetch(`${BACKEND_URL}/api/vote-stats`)
        .then(function (response) {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(function (data) {
            // 確保 ID 與 HTML 對應
            const elSupport = document.getElementById('vote-support');
            const elOppose = document.getElementById('vote-number-oppose');
            const elPause = document.getElementById('vote-pause');
            const elTotal = document.getElementById('vote-total');

            if (elSupport) elSupport.textContent = data.support || 0;

            if (document.getElementById('vote-number-oppose')) {
                document.getElementById('vote-number-oppose').textContent = data.oppose || 0;
            } else if (document.getElementById('vote-oppose')) {
                document.getElementById('vote-oppose').textContent = data.oppose || 0;
            }

            if (elPause) elPause.textContent = data.pause || 0;
            if (elTotal) elTotal.textContent = data.total || 0;

            console.log('投票統計更新:', data);

            if (typeof updateLiveVisuals === 'function') {
                updateLiveVisuals(data);
            }
        })
        .catch(function (error) {
            console.error('更新投票失敗:', error);
        });
}

function startLiveVoteRefresh(intervalTime = 5000) {
    fetchAndDisplayVotes();

    if (voteRefreshInterval) {
        clearInterval(voteRefreshInterval);
    }
    voteRefreshInterval = setInterval(fetchAndDisplayVotes, intervalTime);
}
function stopLiveVoteRefresh() {
    if (voteRefreshInterval) {
        clearInterval(voteRefreshInterval);
        voteRefreshInterval = null;
        console.log("實時投票刷新已停止。");
    }
}

function playClickSfx() {
    try {
        sfxClick.pause();
        sfxClick.currentTime = 0;
        sfxClick.play().catch(error => {
            if (error.name !== 'AbortError') {
                console.error("點擊音效播放失敗:", error);
            }
        });
    } catch (e) {
        console.warn("點擊音效播放時發生同步錯誤:", e);
    }
}

function fadeInBgm(targetVolume = 0.5, duration = 2000) {
    bgm.play().then(() => {
        if (bgm.volume >= targetVolume && bgm.volume !== 1) {
            return;
        }

        const interval = 50;
        const step = targetVolume / (duration / interval);
        const fadeTimer = setInterval(() => {
            if (bgm.volume === 1 && targetVolume < 1) {
                clearInterval(fadeTimer);
                return;
            }

            if (bgm.volume + step < targetVolume) {
                bgm.volume += step;
            } else {
                bgm.volume = targetVolume;
                clearInterval(fadeTimer);
            }
        }, interval);
    })
}

function playTypingSound(duration) {
    sfxType.currentTime = 0;
    sfxType.play();

    setTimeout(() => {
        sfxType.pause();
    }, duration);
}

function initTypeWriters() {
    const writers = document.querySelectorAll('.TypeWriter span');

    writers.forEach(span => {
        const text = span.textContent;
        const charCount = text.length;

        let widthScore = 0;

        for (let char of text) {
            if (char.match(/[\u4e00-\u9fa5]|[\u3000-\u303f]|[\uff00-\uffef]/)) {
                widthScore += 2;
            } else {
                widthScore += 1.5;
            }
        }

        const finalWidth = Math.round(widthScore);

        span.style.setProperty('--steps', charCount);
        span.style.setProperty('--width', finalWidth + 'ch');
        span.style.setProperty('--duration', (charCount * 0.15) + 's');

        console.log(`charCount = ${charCount}`)
        console.log(`finalWidth = ${finalWidth}`)
    });
}



document.addEventListener('DOMContentLoaded', initTypeWriters);

function fadeOutBgm(duration = 2000) {
    const interval = 50;
    const step = bgm.volume / (duration / interval);

    const fadeTimer = setInterval(() => {
        if (bgm.volume - step > 0) {
            bgm.volume -= step;
        } else {
            bgm.volume = 0;
            bgm.pause();
            bgm.currentTime = 0;
            clearInterval(fadeTimer);
        }
    }, interval);
}

function handleTouchOrClick(e) {
    if (e.currentTarget.getAttribute('data-handled')) return;
    e.currentTarget.setAttribute('data-handled', 'true');

    if (e.type === 'touchstart') {
        e.preventDefault();
    }
}



const startBtn = document.querySelector('.start-button');
const menu = document.querySelector('.menu');
const firstScene = document.querySelector('.FirstScene');
const allChangeBtns = document.querySelectorAll('.change-button');
const typeWriter = document.querySelectorAll('.TypeWriter')
const continueBtn = document.querySelectorAll('.continue-button');
const choiceBlock = document.querySelectorAll('.choice-block');


// 初始狀態
window.addEventListener('load', () => {
    //場景初始化
    firstScene.style.display = 'none';

    //s1
    typeWriter.forEach(t => t.style.display = 'none');
    typeWriter.forEach(btn => btn.style.opacity = 0);
    continueBtn.forEach(btn => btn.style.display = 'none');
    continueBtn.forEach(btn => btn.style.opacity = 0);
    choiceBlock.forEach(block => block.style.display = 'none');
    choiceBlock.forEach(block => block.style.opacity = 0);
    allChangeBtns.forEach(btn => btn.style.pointerEvents = 'auto');
    //allChangeBtns.forEach(btn => btn.style.display = 'none');
    //allChangeBtns.forEach(btn => btn.style.opacity = 0);

    menu.style.display = 'none';

    /*
        //p5js參數初始化（這些要搬到後端，然後寄數據到這個檔案）
        params.speed = 0.005;
        params.amp = 80;            // 波浪振幅(高度)：數值越大浪越高 (30 ~ 100)
        params.density = 0.01;      // 波浪密度(頻率)：數值越大越碎 (0.005 ~ 0.02)
        params.layerGap = 60;       // 線條間距：數值越小越密集 (10 ~ 30)
        params.curveRes = 20;       // 線條解析度：數值越小線條越平滑但較耗效能 (10 ~ 50)
        params.trail = 5;           // 殘影強度：0(長殘影) ~ 100(無殘影)
        params.bgColor = [210, 80, 20, 100]; // 背景色 HSB (H, S, B, A)
        params.lineColor = [200, 60, 90]; // 線條色 HSB (H, S, B)
    */


    const TextClick = document.querySelector('.text-click');
    TextClick.style.display = 'flex';
    requestAnimationFrame(() => TextClick.style.opacity = 1);

});

//點擊螢幕
document.body.addEventListener('click', () => {
    playClickSfx();

    if (!hasStartedMusic) {
        hasStartedMusic = true;
        fadeInBgm(0.5, 3000);
    }

    const TextClick = document.querySelector('.text-click');
    TextClick.style.opacity = 0;

    setTimeout(() => {
        TextClick.style.display = 'none';
        menu.style.display = 'flex';
        menu.style.opacity = '0';
        menu.style.transform = 'scale(1.5)';
        startBtn.style.pointerEvents = 'none';
    }, 500);


    setTimeout(() => {
        menu.style.transform = 'scale(1)';
        menu.style.opacity = '1';
    }, 2000);

    setTimeout(() => {
        menu.style.filter = 'blur(0)';
    }, 3000);

    setTimeout(() => {
        startBtn.style.pointerEvents = 'auto';
    }, 5000);

}, { once: true });



//點 START
startBtn.addEventListener('click', function () {
    playClickSfx();
    startBtn.style.pointerEvents = 'none';
    setTimeout(() => {
        menu.style.filter = 'blur(2)';
        menu.style.transform = 'scale(2)';
    }, 1000);

    setTimeout(() => {
        startBtn.style.opacity = '0';
        menu.style.opacity = '0';
    }, 1000);

    setTimeout(() => {
        startBtn.style.display = 'none';
        menu.style.display = 'none';

        /* for (let i = 0; i < 10; i++) {
             setTimeout(() => {
                 params.speed += 0.005;
             }, 200 * i);
         }*/
    }, 2000);

    firstScene.style.display = 'flex';
    setTimeout(() => {
        firstScene.classList.add('active');
    }, 2000);

    setTimeout(() => {
        const TextOne = document.querySelector('.TypeWriter[data-id="1"]');
        const jobBtn = document.querySelector('.continue-button[data-action="whatjob"]')
        TextOne.style.display = 'flex';
        TextOne.style.opacity = 1;
        TextOne.classList.add('start-typing');
        playTypingSound(6000);
        jobBtn.style.display = 'flex';
    }, 3000);

    setTimeout(() => {
        const jobBtn = document.querySelector('.continue-button[data-action="whatjob"]')
        jobBtn.style.pointerEvents = 'auto';
        jobBtn.style.opacity = 1;
    }, 11000);
});

continueBtn.forEach(btn => {
    btn.addEventListener('click', (e) => {
        playClickSfx();

        const clickedElement = e.currentTarget.closest('.continue-button');
        if (!clickedElement) return;
        const action = clickedElement.dataset.action;
        if (action != 'clear') {
            btn.style.pointerEvents = 'none';
        }
        //什麼工作？
        if (action === 'whatjob') {
            const TextOne = document.querySelector('.TypeWriter[data-id="1"]');
            const TextTwo = document.querySelector('.TypeWriter[data-id="2"]');
            const choiceBlock = document.querySelector('.choice-block');
            const innerBtns = choiceBlock.querySelectorAll('.continue-button');
            const thisBtn = clickedElement;

            fadeOutCurrent([TextOne, thisBtn]);

            setTimeout(() => {
                TextOne.style.display = 'none';
                thisBtn.style.display = 'none';

                TextTwo.style.display = 'flex';
                void TextTwo.offsetWidth;
                TextTwo.style.opacity = 1;
                TextTwo.classList.add('start-typing');
                playTypingSound(3000);
                choiceBlock.style.display = 'flex';
                innerBtns.forEach(btn => {
                    btn.style.display = 'flex';
                })
            }, 1500);

            setTimeout(() => {
                choiceBlock.style.opacity = 1;
                innerBtns.forEach(btn => {
                    btn.style.pointerEvents = 'auto';
                    btn.style.opacity = 1;
                });
            }, 5500);
        }
        //我願意
        else if (action === 'agree') {
            const TextTwo = document.querySelector('.TypeWriter[data-id="2"]');
            const choiceBlock = document.querySelector('.choice-block');
            const TextFive = document.querySelector('.TypeWriter[data-id="5"]');
            const okBtn = document.querySelector('.continue-button[data-action="ok"]');

            TextTwo.style.opacity = 0;
            choiceBlock.style.opacity = 0;

            setTimeout(() => {
                TextTwo.style.display = 'none';
                choiceBlock.style.display = 'none';
            }, 2000);

            setTimeout(() => {
                TextFive.style.display = 'flex';
                void TextFive.offsetWidth;
                TextFive.style.opacity = 1;
                TextFive.classList.add('start-typing');
                playTypingSound(3000);
                okBtn.style.display = 'flex';
            }, 3000);

            setTimeout(() => {
                okBtn.style.pointerEvents = 'auto';
                okBtn.style.opacity = 1;
            }, 6500)
        }


        //我再想想
        else if (action === 'disagree') {
            const TextTwo = document.querySelector('.TypeWriter[data-id="2"]');
            const choiceBlock = document.querySelector('.choice-block');
            const TextThree = document.querySelector('.TypeWriter[data-id="3"]');
            const thenBtn = document.querySelector('.continue-button[data-action="then"]');

            fadeOutCurrent([TextTwo, choiceBlock]);

            setTimeout(() => {
                if (TextTwo) TextTwo.style.display = 'none';
                if (choiceBlock) choiceBlock.style.display = 'none';

                if (TextThree) {
                    TextThree.style.display = 'flex';
                    void TextThree.offsetWidth;
                    TextThree.style.opacity = 1;
                    TextThree.classList.add('start-typing');
                    playTypingSound(6000);
                    thenBtn.style.display = 'flex';
                }
            }, 1500);

            setTimeout(() => {
                thenBtn.style.pointerEvents = 'auto';
                thenBtn.style.opacity = 1;
            }, 9000);
        }

        //所以呢？
        else if (action === 'then') {
            const TextThree = document.querySelector('.TypeWriter[data-id="3"]');
            const thenBtn = document.querySelector('.continue-button[data-action="then"]');
            const TextFour = document.querySelector('.TypeWriter[data-id="4"]');
            const agree2Btn = document.querySelector('.continue-button[data-action="agreeTwo"]');

            fadeOutCurrent([TextThree, thenBtn]);

            setTimeout(() => {
                TextThree.style.display = 'none';
                thenBtn.style.display = 'none';
            }, 2000);

            setTimeout(() => {
                TextFour.style.display = 'flex';
                void TextFour.offsetWidth;
                TextFour.style.opacity = 1;
                TextFour.classList.add('start-typing');
                playTypingSound(3000);
                agree2Btn.style.display = 'flex';
            }, 3000);

            setTimeout(() => {
                agree2Btn.style.pointerEvents = 'auto';
                agree2Btn.style.opacity = 1;
            }, 6500);
        }

        //我願意2
        else if (action === 'agreeTwo') {
            const TextFour = document.querySelector('.TypeWriter[data-id="4"]');
            const agree2Btn = document.querySelector('.continue-button[data-action="agreeTwo"]');
            const TextFive = document.querySelector('.TypeWriter[data-id="5"]');
            const okBtn = document.querySelector('.continue-button[data-action="ok"]');

            TextFour.style.opacity = 0;
            agree2Btn.style.opacity = 0;

            setTimeout(() => {
                TextFour.style.display = 'none';
                agree2Btn.style.display = 'none';
            }, 2000);

            setTimeout(() => {
                TextFive.style.display = 'flex';
                void TextFive.offsetWidth;
                TextFive.style.opacity = 1;
                TextFive.classList.add('start-typing');
                playTypingSound(3000);
                okBtn.style.display = 'flex';
            }, 3000);

            setTimeout(() => {
                okBtn.style.pointerEvents = 'auto';
                okBtn.style.opacity = 1;
            }, 6500)
        }

        //好的
        else if (action === 'ok') {
            const TextFive = document.querySelector('.TypeWriter[data-id="5"]');
            const sigContainer = document.getElementById('signature-container');
            const TextContact = document.querySelector('.contact[data-id="1"]');
            const okBtn = document.querySelector('.continue-button[data-action="ok"]');
            const sigBtn = document.querySelector('.sig-buttons');

            const confirmBtn = document.getElementById('confirm-sign-btn');
            const clearBtn = document.getElementById('clear-btn');

            if (TextFive) TextFive.style.opacity = 0;
            if (okBtn) okBtn.style.opacity = 0;

            setTimeout(() => {
                if (TextFive) TextFive.style.display = 'none';
                if (okBtn) okBtn.style.display = 'none';
                TextContact.style.display = 'block';
                sigContainer.style.display = 'flex';
                sigBtn.style.display = 'flex';
                confirmBtn.style.display = 'block';
                clearBtn.style.display = 'block';
            }, 2000);

            setTimeout(() => {
                TextContact.style.opacity = 1;
                sigContainer.style.opacity = 1;
                sigBtn.style.opacity = 1;
                confirmBtn.style.opacity = 1;
                clearBtn.style.opacity = 1;
                confirmBtn.style.pointerEvents = 'auto';
                clearBtn.style.pointerEvents = 'auto';
            }, 3500);
        }

        //確認
        else if (action === 'confirm') {
            const TextContact = document.querySelector('.contact');
            const sigBtn = document.querySelector('.sig-buttons');
            const confirmBtn = document.getElementById('confirm-sign-btn');
            const clearBtn = document.getElementById('clear-btn');
            const TextTwoOne = document.querySelector('.TypeWriter[data-id="21"]')
            const okBtnTwoOne = document.querySelector('.continue-button[data-action="two-one-btn"]')


            if (TextContact) TextContact.style.opacity = 0;
            if (sigBtn) sigBtn.style.opacity = 0;
            if (confirmBtn) confirmBtn.style.opacity = 0;
            if (clearBtn) clearBtn.style.opacity = 0;

            setTimeout(() => {
                if (TextContact) TextContact.style.display = 'none';
                if (sigBtn) sigBtn.style.display = 'none';
                if (confirmBtn) confirmBtn.style.display = 'none';
                if (clearBtn) clearBtn.style.display = 'none';
                goToScene('SecondScene');
            }, 2000);

            setTimeout(() => {
                TextTwoOne.style.display = 'flex';
                void TextTwoOne.offsetWidth;
                TextTwoOne.style.opacity = 1;
                TextTwoOne.classList.add('start-typing');
                playTypingSound(3000);
                okBtnTwoOne.style.display = 'flex';
            }, 5000);

            setTimeout(() => {
                okBtnTwoOne.style.pointerEvents = 'auto';
                okBtnTwoOne.style.opacity = 1;

            }, 9000)

        }

        //第二幕
        else if (action === 'two-one-btn') {
            const TextTwoOne = document.querySelector('.TypeWriter[data-id="21"]')
            const okBtnTwoOne = document.querySelector('.continue-button[data-action="two-one-btn"]')
            const TextTwoTwo = document.querySelector('.TypeWriter[data-id="22"]')
            const TextTwoThree = document.querySelector('.TypeWriter[data-id="23"]')
            const okBtnTwoTwo = document.querySelector('.continue-button[data-action="two-two-btn"]')
            const TextTwoFour = document.querySelector('.normal[data-id="24"]')
            const InjectionHint = document.getElementById('injection-hint')


            if (TextTwoOne) TextTwoOne.style.opacity = 0;
            if (okBtnTwoOne) okBtnTwoOne.style.opacity = 0;

            setTimeout(() => {
                TextTwoOne.style.display = 'none';
                okBtnTwoOne.style.display = 'none';
            }, 2000);

            setTimeout(() => {
                TextTwoTwo.style.display = 'flex';
                void TextTwoTwo.offsetWidth;
                TextTwoTwo.style.opacity = 1;
                TextTwoTwo.classList.add('start-typing');
                playTypingSound(6000);
            }, 4000);

            setTimeout(() => {
                TextTwoTwo.style.opacity = 0;
            }, 15000);
            setTimeout(() => {
                TextTwoTwo.style.display = 'none';
            }, 17000);

            setTimeout(() => {
                InjectionHint.style.display = 'flex';
                requestAnimationFrame(() => InjectionHint.style.opacity = 0.5);
                setInjectionMode(true);
            }, 18000);

            setTimeout(() => {
                requestAnimationFrame(() => InjectionHint.style.opacity = 0);
            }, 25000);

            setTimeout(() => {
                InjectionHint.style.display = 'none';
            }, 27000);

            setTimeout(() => {
                TextTwoThree.style.display = 'flex';
                void TextTwoThree.offsetWidth;
                TextTwoThree.style.opacity = 1;
                TextTwoThree.style.color = 'red';
                TextTwoThree.classList.add('start-typing');
                playTypingSound(6000);
            }, 28000);

            setTimeout(() => {
                setInjectionMode(false);
                if (TextTwoThree) TextTwoThree.style.opacity = 0;
            }, 40000);

            setTimeout(() => {
                TextTwoThree.style.display = 'none';
                TextTwoFour.style.display = 'flex';
                requestAnimationFrame(() => TextTwoFour.style.opacity = 1);
                okBtnTwoTwo.style.display = 'flex';
            }, 42000);

            setTimeout(() => {
                okBtnTwoTwo.style.pointerEvents = 'auto';
                okBtnTwoTwo.style.opacity = 1;
            }, 45000);
        }
        else if (action === 'two-two-btn') {
            const TextTwoFour = document.querySelector('.normal[data-id="24"]')
            const okBtnTwoTwo = document.querySelector('.continue-button[data-action="two-two-btn"]')
            const TextTwoFive = document.querySelector('.TypeWriter[data-id="25"]')
            const okBtnTwoThree = document.querySelector('.continue-button[data-action="two-three-btn"]')

            if (TextTwoFour) TextTwoFour.style.opacity = 0;
            if (okBtnTwoTwo) okBtnTwoTwo.style.opacity = 0;

            setTimeout(() => {
                TextTwoFour.style.display = 'none';
                okBtnTwoTwo.style.display = 'none';
            }, 2000);

            setTimeout(() => {
                TextTwoFive.style.display = 'flex';
                void TextTwoFive.offsetWidth;
                TextTwoFive.style.opacity = 1;
                TextTwoFive.classList.add('start-typing');
                playTypingSound(6000);
                okBtnTwoThree.style.display = 'flex';
            }, 3000);


            setTimeout(() => {
                okBtnTwoThree.style.pointerEvents = 'auto';
                okBtnTwoThree.style.opacity = 1;
            }, 10000);
        }

        else if (action === 'two-three-btn') {
            const TextTwoFive = document.querySelector('.TypeWriter[data-id="25"]')
            const okBtnTwoThree = document.querySelector('.continue-button[data-action="two-three-btn"]')
            const TextTwoSix = document.querySelector('.TypeWriter[data-id="26"]')
            const TextTwoSeven = document.querySelector('.normal[data-id="27"]')
            const okBtnTwoFour = document.querySelector('.continue-button[data-action="two-four-btn"]')
            const BloodPressureHint = document.getElementById('blood-pressure-hint')

            if (TextTwoFive) TextTwoFive.style.opacity = 0;
            if (okBtnTwoThree) okBtnTwoThree.style.opacity = 0;

            setTimeout(() => {
                TextTwoFive.style.display = 'none';
                okBtnTwoThree.style.display = 'none';
            }, 2000);

            setTimeout(() => {
                setMeasuringMode(true)
                BloodPressureHint.style.display = 'flex';
                requestAnimationFrame(() => BloodPressureHint.style.opacity = 0.5);
            }, 3000);

            setTimeout(() => {
                requestAnimationFrame(() => BloodPressureHint.style.opacity = 0);
            }, 10000);

            setTimeout(() => {
                BloodPressureHint.style.display = 'none';
                TextTwoSix.style.display = 'flex';
                void TextTwoSix.offsetWidth;
                TextTwoSix.style.opacity = 1;
                TextTwoSix.style.color = 'red';
                TextTwoSix.classList.add('start-typing');
                playTypingSound(6000);
            }, 12000);


            setTimeout(() => {
                TextTwoSix.style.opacity = 0;
            }, 25000);


            setTimeout(() => {
                TextTwoSix.style.display = 'none';
                TextTwoSeven.style.display = 'flex'
            }, 28000);

            setTimeout(() => {
                requestAnimationFrame(() => TextTwoSeven.style.opacity = 1);
                setMeasuringMode(false)
                okBtnTwoFour.style.display = 'flex'
            }, 30000);

            setTimeout(() => {
                okBtnTwoFour.style.pointerEvents = 'auto';
                okBtnTwoFour.style.opacity = 1;
            }, 33000);
        }

        else if (action === 'two-four-btn') {
            const TextTwoSeven = document.querySelector('.normal[data-id="27"]')
            const okBtnTwoFour = document.querySelector('.continue-button[data-action="two-four-btn"]')
            const TextTwoEight = document.querySelector('.TypeWriter[data-id="28"]')
            const okBtnTwoFive = document.querySelector('.continue-button[data-action="two-five-btn"]')

            if (TextTwoSeven) TextTwoSeven.style.opacity = 0;
            if (okBtnTwoFour) okBtnTwoFour.style.opacity = 0;

            setTimeout(() => {
                TextTwoSeven.style.display = 'none';
                okBtnTwoFour.style.display = 'none';
            }, 2000);

            setTimeout(() => {
                TextTwoEight.style.display = 'flex';
                void TextTwoEight.offsetWidth;
                TextTwoEight.style.opacity = 1;
                TextTwoEight.classList.add('start-typing');
                playTypingSound(9000);
            }, 3000);

            setTimeout(() => {
                okBtnTwoFive.style.display = 'flex';
                okBtnTwoFive.style.pointerEvents = 'auto';
                requestAnimationFrame(() => okBtnTwoFive.style.opacity = 1);
            }, 15000);
        }

        else if (action === 'two-five-btn') {
            const TextTwoEight = document.querySelector('.TypeWriter[data-id="28"]')
            const okBtnTwoFive = document.querySelector('.continue-button[data-action="two-five-btn"]')
            const TextTwoNine = document.querySelector('.TypeWriter[data-id="29"]')
            const TextTwoNineOne = document.querySelector('.normal[data-id="291"]')
            const okBtnTwoSix = document.querySelector('.continue-button[data-action="two-six-btn"]')
            const hint = document.getElementById('embryo-hint');

            if (TextTwoEight) TextTwoEight.style.opacity = 0;
            if (okBtnTwoFive) okBtnTwoFive.style.opacity = 0;

            setTimeout(() => {
                TextTwoEight.style.display = 'none';
                okBtnTwoFive.style.display = 'none';
                hint.style.display = 'flex';
                requestAnimationFrame(() => hint.style.opacity = 0.5);
            }, 2000);

            setTimeout(() => {
                setEmbryoMode(true);
            }, 3000);

            setTimeout(() => {
                requestAnimationFrame(() => hint.style.opacity = 0);
            }, 10000);

            setTimeout(() => {
                hint.style.display = 'none';
                TextTwoNine.style.display = 'flex';
                void TextTwoNine.offsetWidth;
                TextTwoNine.style.opacity = 1;
                TextTwoNine.style.color = 'red';
                TextTwoNine.classList.add('start-typing');
                playTypingSound(9000);
            }, 12000);

            setTimeout(() => {
                TextTwoNine.style.opacity = 0;
            }, 25000);

            setTimeout(() => {
                TextTwoNine.style.display = 'none';
                TextTwoNineOne.style.display = 'flex';
            }, 28000);

            setTimeout(() => {
                TextTwoNineOne.style.opacity = 1;

                setEmbryoMode(false);
                okBtnTwoSix.style.display = 'flex'
            }, 30000);

            setTimeout(() => {
                okBtnTwoSix.style.pointerEvents = 'auto';
                okBtnTwoSix.style.opacity = 1;
            }, 33000);

        }

        else if (action === 'two-six-btn') {
            const TextTwoNineOne = document.querySelector('.normal[data-id="291"]')
            const okBtnTwoSix = document.querySelector('.continue-button[data-action="two-six-btn"]')

            const TextThreeOne = document.querySelector('.TypeWriter[data-id="31"]')
            const okBtnThreeOne = document.querySelector('.continue-button[data-action="three-one-btn"]')

            if (TextTwoNineOne) TextTwoNineOne.style.opacity = 0;
            if (okBtnTwoSix) okBtnTwoSix.style.opacity = 0;

            setTimeout(() => {
                goToScene('ThirdScene');
                TextTwoNineOne.style.display = 'none';
                okBtnTwoSix.style.display = 'none';

                sfxBaby.pause();
                sfxBaby.currentTime = 0;
                sfxBaby.play();
            }, 2000)

            setTimeout(() => {
                TextThreeOne.style.display = 'flex';
                void TextThreeOne.offsetWidth;
                TextThreeOne.style.opacity = 1;
                TextThreeOne.classList.add('start-typing');
                playTypingSound(3000);

                okBtnThreeOne.style.display = 'flex';
            }, 7000)

            setTimeout(() => {

                okBtnThreeOne.style.pointerEvents = 'auto';
                okBtnThreeOne.style.opacity = 1;
            }, 11000)
        }

        //第三幕
        else if (action === 'three-one-btn') {
            const TextThreeOne = document.querySelector('.TypeWriter[data-id="31"]')
            const okBtnThreeOne = document.querySelector('.continue-button[data-action="three-one-btn"]')

            const TextThreeTwo = document.querySelector('.TypeWriter[data-id="32"]')
            const okBtnThreeTwo = document.querySelector('.continue-button[data-action="three-two-btn"]')

            if (TextThreeOne) TextThreeOne.style.opacity = 0;
            if (okBtnThreeOne) okBtnThreeOne.style.opacity = 0;


            setTimeout(() => {
                TextThreeOne.style.display = 'none';
                okBtnThreeOne.style.display = 'none';
                TextThreeTwo.style.display = 'flex';
                void TextThreeTwo.offsetWidth;
                TextThreeTwo.style.opacity = 1;
                TextThreeTwo.classList.add('start-typing');
                playTypingSound(9000);

                okBtnThreeTwo.style.display = 'flex';
            }, 2000)

            setTimeout(() => {
                okBtnThreeTwo.style.pointerEvents = 'auto';
                okBtnThreeTwo.style.opacity = 1;
            }, 14000)
        }

        else if (action === "three-two-btn") {
            const TextThreeTwo = document.querySelector('.TypeWriter[data-id="32"]')
            const okBtnThreeTwo = document.querySelector('.continue-button[data-action="three-two-btn"]')
            const BabyHint = document.getElementById('baby-hint')
            const TextThreeFour = document.querySelector('.TypeWriter[data-id="34"]')
            const TextThreeFive = document.querySelector('.TypeWriter[data-id="35"]')
            const TextContact = document.querySelector('.contact[data-id="3"]');
            const okBtnThreeThree = document.querySelector('.continue-button[data-action="three-three-btn"]')
            const sigPreview = document.getElementById('signature-preview');
            const savedSig = localStorage.getItem('userSignature');
            sigPreview.src = savedSig;

            if (TextThreeTwo) TextThreeTwo.style.opacity = 0;
            if (okBtnThreeTwo) okBtnThreeTwo.style.opacity = 0;

            setTimeout(() => {
                TextThreeTwo.style.display = 'none';
                okBtnThreeTwo.style.display = 'none';
                setBabyMode(true);
                BabyHint.style.display = 'flex';
            }, 2000)

            setTimeout(() => {
                BabyHint.style.opacity = 0.5;
            }, 4000)

            setTimeout(() => {
                BabyHint.style.opacity = 0;
            }, 8000)

            setTimeout(() => {
                BabyHint.style.display = 'none';
                TextThreeFour.style.display = 'flex';
                void TextThreeFour.offsetWidth;
                TextThreeFour.style.opacity = 1;
                TextThreeFour.style.color = 'red';
                TextThreeFour.classList.add('start-typing');
                playTypingSound(6000);
            }, 12000)

            setTimeout(() => {
                requestAnimationFrame(() => TextThreeFour.style.opacity = 0);
                TextThreeFour.style.display = 'none';
            }, 22000)

            setTimeout(() => {
                TextThreeFive.style.display = 'flex';
                void TextThreeFive.offsetWidth;
                TextThreeFive.style.opacity = 1;
                TextThreeFive.style.color = 'red';
                TextThreeFive.classList.add('start-typing');
                playTypingSound(3000);

            }, 26000)

            setTimeout(() => {
                requestAnimationFrame(() => TextThreeFive.style.opacity = 0);
                setBabyMode(false);
            }, 32000)

            setTimeout(() => {
                TextThreeFive.style.display = 'none';
            }, 34000)


            setTimeout(() => {
                TextContact.style.display = 'flex';
                okBtnThreeThree.style.display = 'flex';
                requestAnimationFrame(() => TextContact.style.opacity = 1);
                requestAnimationFrame(() => okBtnThreeThree.style.opacity = 1);
                okBtnThreeThree.style.pointerEvents = 'auto';
                sigPreview.style.display = 'block';
            }, 38000)

            setTimeout(() => {
                sigPreview.style.opacity = 1;
            }, 40000)

        }

        else if (action === 'three-three-btn') {
            const TextContact = document.querySelector('.contact[data-id="3"]');
            const okBtnThreeThree = document.querySelector('.continue-button[data-action="three-three-btn"]')
            const TextFourOne = document.querySelector('.TypeWriter[data-id="41"]');
            const okBtn = document.querySelector('.continue-button[data-action="four-one-btn"]')
            const sigPreview = document.getElementById('signature-preview');
            const savedSig = localStorage.getItem('userSignature');

            if (TextContact) TextContact.style.opacity = 0;
            if (okBtnThreeThree) okBtnThreeThree.style.opacity = 0;
            if (sigPreview) sigPreview.style.opacity = 0;


            setTimeout(() => {
                TextContact.style.display = 'none';
                okBtnThreeThree.style.display = 'none';
                sigPreview.style.display = 'none';
            }, 2000)

            setTimeout(() => {
                goToScene('FourthScene');
                TextFourOne.style.display = 'flex';
                void TextFourOne.offsetWidth;
                TextFourOne.style.opacity = 1;
                TextFourOne.classList.add('start-typing');
                playTypingSound(3000);
                okBtn.style.display = 'flex';
            }, 5000);

            setTimeout(() => {
                okBtn.style.pointerEvents = 'auto';
                okBtn.style.opacity = 1;
            }, 9000)

        }

        //第四幕
        //好痛苦
        else if (action === 'four-one-btn') {
            const TextFourOne = document.querySelector('.TypeWriter[data-id="41"]');
            const okBtnFourOne = document.querySelector('.continue-button[data-action="four-one-btn"]')
            const TextFourTwo = document.querySelector('.TypeWriter[data-id="42"]');
            const okBtnFourTwo = document.querySelector('.continue-button[data-action="four-two-btn"]')


            if (TextFourOne) TextFourOne.style.opacity = 0;
            if (okBtnFourOne) okBtnFourOne.style.opacity = 0;

            setTimeout(() => {
                if (TextFourOne) TextFourOne.style.display = 'none';
                if (okBtnFourOne) okBtnFourOne.style.display = 'none';

                if (TextFourTwo) {
                    TextFourTwo.style.display = 'flex';
                    void TextFourTwo.offsetWidth;
                    TextFourTwo.style.opacity = 1;
                    TextFourTwo.classList.add('start-typing');
                    playTypingSound(3000);
                    okBtnFourTwo.style.display = 'flex';
                }
            }, 2000);

            setTimeout(() => {
                if (okBtnFourTwo) {
                    okBtnFourTwo.style.pointerEvents = 'auto';
                    requestAnimationFrame(() => okBtnFourTwo.style.opacity = 1);
                }
            }, 6000);

        }

        //我準備好了
        else if (action === 'four-two-btn') {
            const TextFourTwo = document.querySelector('.TypeWriter[data-id="42"]');
            const okBtnFourTwo = document.querySelector('.continue-button[data-action="four-two-btn"]')
            const FinalDecision = document.querySelector('.final-decision');
            const TextFourThree = document.querySelector('.TypeWriter[data-id="43"]');
            const okBtnFourThree = document.querySelector('.continue-button[data-action="four-three-btn"]')
            const okBtnFourFour = document.querySelector('.continue-button[data-action="four-four-btn"]')
            const okBtnFourFive = document.querySelector('.continue-button[data-action="four-five-btn"]')

            TextFourTwo.style.opacity = 0;
            okBtnFourTwo.style.opacity = 0;

            setTimeout(() => {
                if (TextFourTwo) TextFourTwo.style.display = 'none';
                if (okBtnFourTwo) okBtnFourTwo.style.display = 'none';

                if (FinalDecision) {
                    FinalDecision.style.display = 'flex';
                    requestAnimationFrame(() => FinalDecision.style.opacity = 1);
                }

                if (TextFourThree) {
                    TextFourThree.style.display = 'flex';
                    void TextFourThree.offsetWidth;
                    TextFourThree.style.opacity = 1;
                    TextFourThree.classList.add('start-typing');
                    playTypingSound(3000);
                }
            }, 2000);

            setTimeout(() => {
                const btns = [okBtnFourThree, okBtnFourFour, okBtnFourFive];
                btns.forEach(btn => {
                    if (btn) {
                        btn.style.pointerEvents = 'auto';
                        btn.style.display = 'flex';
                        requestAnimationFrame(() => btn.style.opacity = 1);
                    }
                });
            }, 6000);
        }

        //最後選項
        else if (action === 'four-three-btn') {
            handleVote('support');
        }
        else if (action === 'four-four-btn') {
            handleVote('oppose');
        }
        else if (action === 'four-five-btn') {
            handleVote('pause');
        }


        //再玩一次
        else if (action === 'restart') {
            const endOptions = document.querySelector('.end-options');
            const TextFourFour = document.querySelector('.TypeWriter[data-id="44"]');

            if (endOptions) endOptions.style.opacity = 0;
            if (TextFourFour) TextFourFour.style.opacity = 0;

            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
        //看結尾
        else if (action === 'pure-background') {
            const textfourfour = document.querySelector('.TypeWriter[data-id="44"]');
            const endOptions = document.querySelector('.end-options');

            if (textfourfour) textfourfour.style.opacity = 0;
            if (endOptions) endOptions.style.opacity = 0;

            setTimeout(() => {
                if (textfourfour) textfourfour.style.display = 'none';
                if (endOptions) endOptions.style.display = 'none';
            }, 1000);


            fetch(`${BACKEND_URL}/api/vote-stats`)
                .then(res => res.json())
                .then(stats => {
                    let winner = 'support';
                    let maxVotes = stats.support;

                    if (stats.oppose > maxVotes) {
                        winner = 'oppose';
                        maxVotes = stats.oppose;
                    }
                    if (stats.pause > maxVotes) {
                        winner = 'pause';
                    }

                    console.log("Winner is:", winner);

                    if (typeof setEndingMood === 'function') {
                        setEndingMood(winner);
                    }
                });

            setTimeout(() => {
                fetch(`${BACKEND_URL}/api/all-signatures`)
                    .then(res => res.json())
                    .then(fileList => {
                        console.log("載入簽名數量:", fileList.length);
                        if (typeof triggerFloatingSignatures === 'function') {
                            triggerFloatingSignatures(fileList);
                        }
                    });
            }, 3000);

            fetchAndDisplayVotes();
            startLiveVoteRefresh(5000);

            const statsDisplay = document.getElementById('vote-stats-display');
            setTimeout(() => {
                if (statsDisplay) {
                    statsDisplay.style.display = 'flex';
                }
            }, 4000);

            setTimeout(() => {
                statsDisplay.style.opacity = 1;
            }, 6000);

            setTimeout(() => {
                const backHomeBtn = document.getElementById('back-home-btn');

                if (backHomeBtn) {
                    backHomeBtn.style.display = 'flex';
                    backHomeBtn.style.pointerEvents = 'auto';

                    requestAnimationFrame(() => {
                        backHomeBtn.style.opacity = 1;
                    });

                    if (!backHomeBtn.dataset.bound) {
                        backHomeBtn.dataset.bound = 'true';
                        backHomeBtn.addEventListener('click', () => {
                            playClickSfx();
                            location.reload();
                        });
                    }
                }
            }, 7000);



        }

    });
});




//跳場景功能
function goToScene(nextSceneClassName) {
    const currentActiveScene = document.querySelector('.active');

    if (currentActiveScene) {
        currentActiveScene.classList.remove('active');

        setTimeout(() => {
            currentActiveScene.style.display = 'none';
        }, 1500);
    }

    /*if (nextSceneClassName === 'SecondScene') {
        if (typeof setInjectionMode === 'function') {
            setInjectionMode(true);
        }
    }
    else if (nextSceneClassName === 'start') {
        if (typeof setInjectionMode === 'function') {
            setInjectionMode(false);
        }
    }*/


    if (nextSceneClassName === 'start') {
        const startBtn = document.querySelector('.start-button');
        startBtn.style.display = 'block';
        setTimeout(() => {
            startBtn.style.opacity = '1';
        }, 100);
        return;
    }

    const nextScene = document.querySelector('.' + nextSceneClassName);
    if (nextScene) {
        nextScene.style.display = 'flex';

        setTimeout(() => {
            nextScene.classList.add('active');
        }, 50);
    }
}

allChangeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        playClickSfx();
        const action = e.currentTarget.dataset.action;
        const nextSceneClassName = e.currentTarget.dataset.next;
        goToScene(nextSceneClassName);

        if (action === 'TriggerSecondScene') {
            const okBtnTwoOne = document.querySelector('.continue-button[data-action="two-one-btn"]')

            okBtnTwoOne.style.display = 'flex';

            setTimeout(() => {
                okBtnTwoOne.style.pointerEvents = 'auto';
                okBtnTwoOne.style.opacity = 1;
            }, 2000);
        }

        if (action === 'TriggerThirdScene') {
            const TextThreeOne = document.querySelector('.TypeWriter[data-id="31"]')
            const okBtnThreeOne = document.querySelector('.continue-button[data-action="three-one-btn"]')

            setTimeout(() => {
                TextThreeOne.style.display = 'flex';
                void TextThreeOne.style.offsetWidth;
                TextThreeOne.style.opacity = 1;
                TextThreeOne.classList.add('start-typing');
                playTypingSound(3000);

                okBtnThreeOne.style.display = 'flex';
            }, 2000)
            setTimeout(() => {
                okBtnThreeOne.style.pointerEvents = 'auto';
                okBtnThreeOne.style.opacity = 1;
            }, 7000)
        }


        if (action === 'TriggerFourthScene') {
            const TextFourOne = document.querySelector('.TypeWriter[data-id="41"]');
            const okBtn = document.querySelector('.continue-button[data-action="four-one-btn"]')

            setTimeout(() => {
                TextFourOne.style.display = 'flex';
                void TextFourOne.offsetWidth;
                TextFourOne.style.opacity = 1;
                TextFourOne.classList.add('start-typing');
                playTypingSound(3000);
                okBtn.style.display = 'flex';
            }, 1500);

            setTimeout(() => {
                okBtn.style.pointerEvents = 'auto';
                okBtn.style.opacity = 1;
            }, 5500)
        }
    });
});


// 淡出功能
function fadeOutCurrent(elements) {
    elements.forEach(el => {
        if (el) el.style.opacity = 0;
    });
}



//簽名
const canvas = document.getElementById('drawing-board');
const ctx = canvas.getContext('2d');
const clearBtn = document.getElementById('clear-btn');
const confirmSignBtn = document.getElementById('confirm-sign-btn');
let isDrawing = false;

ctx.strokeStyle = '#ffffff';
ctx.lineWidth = 3;
ctx.lineCap = 'round';

function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    if (!clientX || !clientY) return { x: 0, y: 0 };

    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
    };
}

function startDrawing(e) {
    if (e.cancelable) e.preventDefault();
    isDrawing = true;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
}

function drawSignature(e) {
    if (!isDrawing) return;
    if (e.cancelable) e.preventDefault();
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
}

function stopDrawing() {
    isDrawing = false;
    ctx.beginPath();
}

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', drawSignature);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

canvas.addEventListener('touchstart', startDrawing, { passive: false });
canvas.addEventListener('touchmove', drawSignature, { passive: false });
canvas.addEventListener('touchend', stopDrawing);

if (clearBtn) {
    clearBtn.addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
}


if (confirmSignBtn) {
    confirmSignBtn.addEventListener('click', () => {
        const canvas = document.getElementById('drawing-board');

        const dataUrl = canvas.toDataURL('image/png');

        if (typeof updateSignature === 'function') {
            updateSignature(dataUrl);
        }

        submitSignature(dataUrl);
    });
}

function submitSignature(dataUrl) {

    fetch(`${BACKEND_URL}/api/save-signature`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image: dataUrl })
    })
        .then(response => response.json())
        .then(data => {
            console.log("簽名已存檔:", data.filename);
            if (typeof loadUserSignature === 'function') {
                loadUserSignature(`${BACKEND_URL}/images/signature/${data.filename}`);
            }
        })

    localStorage.setItem('userSignature', dataUrl);
}



function handleVote(decision) {
    playClickSfx();
    myDecision = decision;
    document.querySelectorAll('.final-decision button').forEach(btn => {
        btn.disabled = true;

        if (!btn.querySelector('h1').textContent.includes(decision === 'support' ? '支持' : decision === 'oppose' ? '反對' : '暫停')) {
            btn.style.opacity = 0.3;
        }
    });

    fetch(`${BACKEND_URL}/api/vote`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ decision: decision }) // 傳送 'support', 'oppose', 或 'pause'
    })
        .then(response => {
            if (!response.ok) {
                console.error("投票伺服器錯誤:", response.statusText);
                throw new Error('伺服器回傳錯誤狀態碼: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            console.log('投票成功！伺服器回應:', data.stats);
        })
        .catch((error) => {
            console.error('上傳投票時發生錯誤:', error);
        });


    const FinalDecision = document.querySelector('.final-decision');
    const TextFourThree = document.querySelector('.TypeWriter[data-id="43"]');
    const TextFourFour = document.querySelector('.TypeWriter[data-id="44"]');
    const endOptions = document.querySelector('.end-options');
    const restartBtn = document.querySelector('.continue-button[data-action="restart"]')
    const backgroundBtn = document.querySelector('.continue-button[data-action="pure-background"]')


    if (FinalDecision) FinalDecision.style.opacity = 0;
    if (TextFourThree) TextFourThree.style.opacity = 0;

    setTimeout(() => {
        if (TextFourThree) TextFourThree.style.display = 'none';
        if (FinalDecision) FinalDecision.style.display = 'none';

        if (TextFourFour) {
            TextFourFour.style.display = 'flex';
            void TextFourFour.offsetWidth;
            TextFourFour.style.opacity = 1;
            TextFourFour.classList.add('start-typing');
            playTypingSound(3000);
            endOptions.style.display = 'flex';
            restartBtn.style.display = 'flex';
            backgroundBtn.style.display = 'flex';
        }
    }, 2000)

    setTimeout(() => {
        if (endOptions) {
            requestAnimationFrame(() => endOptions.style.opacity = 1);

            if (restartBtn) {
                restartBtn.style.pointerEvents = 'auto';
                restartBtn.style.display = 'flex';
                requestAnimationFrame(() => restartBtn.style.opacity = 1);
            }
            if (backgroundBtn) {
                backgroundBtn.style.display = 'flex';
                backgroundBtn.style.pointerEvents = 'auto';
                requestAnimationFrame(() => backgroundBtn.style.opacity = 1);
            }
        }
    }, 6000);
}



function updateVoteDisplay(stats) {
    const supportElement = document.querySelector('[data-action="four-three-btn"] h1');
    const opposeElement = document.querySelector('[data-action="four-four-btn"] h1');
    const pauseElement = document.querySelector('[data-action="four-five-btn"] h1');

    const total = stats.total;

    const supportPercent = total > 0 ? (stats.support / total * 100).toFixed(1) : 0;
    const opposePercent = total > 0 ? (stats.oppose / total * 100).toFixed(1) : 0;
    const pausePercent = total > 0 ? (stats.pause / total * 100).toFixed(1) : 0;

    if (supportElement) supportElement.textContent = `支持 (${supportPercent}%)`;
    if (opposeElement) opposeElement.textContent = `反對 (${opposePercent}%)`;
    if (pauseElement) pauseElement.textContent = `暫停 (${pausePercent}%)`;

    document.querySelectorAll('.final-decision button p').forEach(p => {
        p.style.opacity = 0;
    });
}