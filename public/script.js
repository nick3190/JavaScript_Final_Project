const startBtn = document.querySelector('.start-button');
const menu = document.querySelector('.Menu');
const firstScene = document.querySelector('.FirstScene');
const continueBtn = document.querySelector('.continue-button')
const allChangeBtns = document.querySelectorAll('.change-button');



// 初始狀態
window.addEventListener('load', () => {
    //場景初始化
    firstScene.style.display = 'none';
    menu.style.display = 'flex';
    menu.style.opacity = '0';
    menu.style.transform = 'scale(1.5)';
    startBtn.style.pointerEvents = 'none';

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

    setTimeout(() => {
        menu.style.transform = 'scale(1)';
        menu.style.opacity = '1';
    }, 500);

    setTimeout(() => {
        menu.style.filter = 'blur(0)';
        startBtn.style.pointerEvents = 'auto';
    }, 2000);
});


//點 START（後端要抓「按這個按鈕」的事件）
startBtn.addEventListener('click', function () {
    setTimeout(() => {
        menu.style.filter = 'blur(2)';
        menu.transform = 'scale(2)';
    }, 1000);

    setTimeout(() => {
        startBtn.style.opacity = '0';
        menu.style.opacity = '0';
    }, 1000);

    setTimeout(() => {
        startBtn.style.display = 'none';
        menu.style.display = 'none';

        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                params.speed += 0.005;
            }, 200 * i);
        }
    }, 2000);

    firstScene.style.display = 'flex';
    setTimeout(() => {
        firstScene.classList.add('active');
    }, 10000);
});

continueBtn.addEventListener('click', function(){

})

//跳場景功能
function goToScene(nextSceneClassName) {
    const currentActiveScene = document.querySelector('.active');

    if (currentActiveScene) {
        currentActiveScene.classList.remove('active');

        setTimeout(() => {
            currentActiveScene.style.display = 'none';
        }, 1500);
    }

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
        const nextSceneClassName = e.currentTarget.dataset.next;
        goToScene(nextSceneClassName);
    });
});

