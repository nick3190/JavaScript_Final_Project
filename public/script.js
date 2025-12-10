const bgm = new Audio('./sounds/bgm2.mp3');
const sfxClick = new Audio('./sounds/click2.mp3')
const sfxType = new Audio('./sounds/Typing.mp3')
bgm.loop = true;
bgm.volume = 0;
sfxClick.volume = 1;
sfxType.volume = 0.2;
sfxType.loop = true;

let hasStartedMusic = false;

function fadeInBgm(targetVolume = 0.5, duration = 2000) {
    if (bgm.volume >= targetVolume) return;
    bgm.play().then(() => {
        const interval = 50;
        const step = targetVolume / (duration / interval);

        const fadeTimer = setInterval(() => {
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

//點擊螢幕
document.body.addEventListener('click', () => {

    sfxClick.currentTime = 0;
    sfxClick.play();

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
    }, 4000);

}, { once: true });

const startBtn = document.querySelector('.start-button');
const menu = document.querySelector('.Menu');
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


    //p5js參數初始化（這些要搬到後端，然後寄數據到這個檔案）
    params.speed = 0.005;
    params.amp = 80;            // 波浪振幅(高度)：數值越大浪越高 (30 ~ 100)
    params.density = 0.01;      // 波浪密度(頻率)：數值越大越碎 (0.005 ~ 0.02)
    params.layerGap = 60;       // 線條間距：數值越小越密集 (10 ~ 30)
    params.curveRes = 20;       // 線條解析度：數值越小線條越平滑但較耗效能 (10 ~ 50)
    params.trail = 5;           // 殘影強度：0(長殘影) ~ 100(無殘影)
    params.bgColor = [210, 80, 20, 100]; // 背景色 HSB (H, S, B, A)
    params.lineColor = [200, 60, 90]; // 線條色 HSB (H, S, B)
    //


    const TextClick = document.querySelector('.text-click');
    TextClick.style.display = 'flex';
    requestAnimationFrame(() => TextClick.style.opacity = 1);

});



//點 START（後端要抓「按這個按鈕」的事件）
startBtn.addEventListener('click', function () {
    sfxClick.currentTime = 0;
    sfxClick.play();
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
        sfxClick.currentTime = 0;
        sfxClick.play();
        const action = e.target.dataset.action;
        //什麼工作？
        if (action === 'whatjob') {
            const TextOne = document.querySelector('.TypeWriter[data-id="1"]');
            const TextTwo = document.querySelector('.TypeWriter[data-id="2"]');
            const choiceBlock = document.querySelector('.choice-block');
            const innerBtns = choiceBlock.querySelectorAll('.continue-button');
            const thisBtn = e.target;

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
            const TextContact = document.querySelector('.contact');
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
            }, 2000);

            setTimeout(() => {
                TextContact.style.opacity = 1;
            }, 3500);

            setTimeout(() => {
                if (sigContainer) {
                    sigContainer.style.display = 'flex';
                    requestAnimationFrame(() => sigContainer.style.opacity = 1);
                }

                if (sigBtn) {
                    sigBtn.style.display = 'flex';
                    requestAnimationFrame(() => sigBtn.style.opacity = 1);
                }

                if (confirmBtn) {
                    confirmBtn.style.display = 'block';
                    confirmBtn.style.pointerEvents = 'auto';
                    requestAnimationFrame(() => confirmBtn.style.opacity = 1);
                }
                if (clearBtn) {
                    clearBtn.style.display = 'block';
                    clearBtn.style.pointerEvents = 'auto';
                    requestAnimationFrame(() => clearBtn.style.opacity = 1);
                }

            }, 5000)
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
            }, 2000);

            setTimeout(() => {
                goToScene('SecondScene');
                TextTwoOne.style.display = 'flex';
                void TextTwoOne.offsetWidth;
                TextTwoOne.style.opacity = 1;
                TextTwoOne.classList.add('start-typing');
                playTypingSound(3000);
                okBtnTwoOne.style.display = 'flex';
            }, 3000);

            setTimeout(() => {
                okBtnTwoOne.style.pointerEvents = 'auto';
                okBtnTwoOne.style.opacity = 1;

            }, 7000)

        }

        //第二幕
        else if (action === 'two-one-btn') {
            const TextTwoOne = document.querySelector('.TypeWriter[data-id="21"]')
            const okBtnTwoOne = document.querySelector('.continue-button[data-action="two-one-btn"]')
            const TextTwoTwo = document.querySelector('.TypeWriter[data-id="22"]')
            const TextTwoThree = document.querySelector('.TypeWriter[data-id="23"]')
            const okBtnTwoTwo = document.querySelector('.continue-button[data-action="two-two-btn"]')
            const TextTwoFour = document.querySelector('.normal[data-id="24"]')



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
                playTypingSound(9000);
            }, 4000);

            setTimeout(() => {
                setInjectionMode(true);
            }, 14000);

            setTimeout(() => {
                TextTwoTwo.style.opacity = 0;
            }, 17000);
            setTimeout(() => {
                TextTwoTwo.style.display = 'none';
            }, 20000);

            setTimeout(() => {
                TextTwoThree.style.display = 'flex';
                void TextTwoThree.offsetWidth;
                TextTwoThree.style.opacity = 1;
                TextTwoThree.style.color = 'red';
                TextTwoThree.classList.add('start-typing');
                playTypingSound(6000);

            }, 25000);

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

            if (TextTwoFive) TextTwoFive.style.opacity = 0;
            if (okBtnTwoThree) okBtnTwoThree.style.opacity = 0;

            setTimeout(() => {
                TextTwoFive.style.display = 'none';
                okBtnTwoThree.style.display = 'none';
            }, 2000);

            setTimeout(() => {
                setMeasuringMode(true)
            }, 3000);

            setTimeout(() => {
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

            if (TextTwoEight) TextTwoEight.style.opacity = 0;
            if (okBtnTwoFive) okBtnTwoFive.style.opacity = 0;

            setTimeout(() => {
                TextTwoEight.style.display = 'none';
                okBtnTwoFive.style.display = 'none';
            }, 2000);

            setTimeout(() => {
                setInjectionMode(true);
            }, 3000);


            setTimeout(() => {
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
                setInjectionMode(false)
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

                TextThreeOne.style.display = 'flex';
                void TextThreeOne.offsetWidth;
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
            }, 12000)
        }

        else if (action === "three-two-btn") {
            const TextThreeTwo = document.querySelector('.TypeWriter[data-id="32"]')
            const okBtnThreeTwo = document.querySelector('.continue-button[data-action="three-two-btn"]')


            if (TextThreeTwo) TextThreeTwo.style.opacity = 0;
            if (okBtnThreeTwo) okBtnThreeTwo.style.opacity = 0;

            setTimeout(() => {
                TextThreeTwo.style.display = 'none';
                okBtnThreeTwo.style.display = 'none';
                setBabyMode(true);
            }, 2000)
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
                }
            }, 2000);

            setTimeout(() => {
                if (okBtnFourTwo) {
                    okBtnFourTwo.style.display = 'flex';
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
                    FinalDecision.style.display = 'block';
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
        else if (action === 'four-three-btn' || action === 'four-four-btn' || action === 'four-five-btn') {
            const FinalDecision = document.querySelector('.final-decision');
            const TextFourThree = document.querySelector('.TypeWriter[data-id="43"]');
            const TextFourFour = document.querySelector('.TypeWriter[data-id="44"]');
            const endOptions = document.querySelector('.end-options');
            const restartBtn = document.querySelector('.continue-button[data-action="restart"]')
            const backgroundBtn = document.querySelector('.continue-button[data-action="pure-background"]')

            console.log(e.target.dataset.action);

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
                }
            }, 2000)

            setTimeout(() => {
                if (endOptions) {
                    endOptions.style.display = 'flex';
                    requestAnimationFrame(() => endOptions.style.opacity = 1);
                    restartBtn.style.pointerEvents = 'auto';
                    restartBtn.style.display = 'flex';
                    backgroundBtn.style.display = 'flex';
                    backgroundBtn.style.pointerEvents = 'auto';
                }
            }, 6000);

            setTimeout(() => {
                requestAnimationFrame(() => restartBtn.style.opacity = 1);
                requestAnimationFrame(() => backgroundBtn.style.opacity = 1);
            }, 1000);
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
            const FourthScene = document.querySelector('.FourthScene');

            if (FourthScene) {
                FourthScene.style.transition = 'opacity 2s ease';
                FourthScene.style.opacity = 0;

                setTimeout(() => {
                    FourthScene.style.display = 'none';
                    FourthScene.classList.remove('active');
                }, 2000);
            }
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
        sfxClick.currentTime = 0;
        sfxClick.play();
        const action = e.target.dataset.action;
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
        const dataUrl = canvas.toDataURL();

        if (typeof updateSignature === 'function') {
            updateSignature(dataUrl);
        } else {
            console.warn("找不到 updateSignature 函式，請確認 sketch.js 是否正確載入");
        }

        const sigContainer = document.getElementById('signature-container');
        const TextFive = document.querySelector('.TypeWriter[data-id="5"]');

        if (sigContainer) sigContainer.style.opacity = 0;
        if (TextFive) TextFive.style.opacity = 0;

        setTimeout(() => {
            if (sigContainer) sigContainer.style.display = 'none';
            if (TextFive) TextFive.style.display = 'none';
        }, 1500);
    });
}