const INITIAL_AMP = 100;
const INITIAL_SPEED = 0.005;

const STATE = {
    INITIAL: 0,
    POST_INJECT: 1,
    POST_BP: 2,
    EMBRYO: 3,
    POST_EMBRYO: 4,
    BABY: 5,
    GONE: 6,
    ENDING: 7
};

let userSignatureImg = null;
let signatureCanvasInstance = null;

let floatingSignatures = [];
let signatureImages = [];

let currentSceneState = STATE.INITIAL;

let params = {
    speed: INITIAL_SPEED,
    amp: INITIAL_AMP,
    density: 0.01,
    layerGap: 30,
    curveRes: 20,
    trail: 5,
    bgColor: [210, 80, 20, 100],
    lineColor: [200, 60, 90]
};

let t = 0;
let bodyImg, needleImg, babyImg, stethoscopeImg, uterusImg;
let imgX, imgY, imgW, imgH;

let press = 0;
let currentBP = 0;
let needleY = 0;

let babyScale = 1.0;
let babySceneTime = 0;
let babyPullForce = 0.02;

let showInjection = false;
let showMeasure = false;
let showEmbryo = false;
let showBabyMode = false;

let uterusW, uterusH;

function preload() {
    bodyImg = loadImage('./images/bodyPic.png');
    needleImg = loadImage('./images/needle.png');
    babyImg = loadImage('./images/baby.png');
    stethoscopeImg = loadImage('./images/stethoscope.png');
    uterusImg = loadImage('./images/uterus.png');
}

function setup() {
    //抓後端
    fetch(`${BACKEND_URL}/api/config`)
        .then(response => response.json())
        .then(config => {
            Object.assign(params, config);
            console.log("視覺參數已從伺服器載入");
        })
        .catch(err => console.error("無法載入設定，使用預設值"));


    createCanvas(window.innerWidth, window.innerHeight);
    colorMode(HSB, 360, 100, 100, 100);
    imageMode(CENTER);
    noFill();
    cursor();
    calculateImageBounds();
}

function draw() {
    updateSceneVisuals();

    background(params.bgColor[0], params.bgColor[1], params.bgColor[2], params.trail);

    drawSceneContent();

    drawWaves();

    drawTools();

    if (window.showSignatureDisplay === true) {
        if (!signatureCanvasInstance) initSignatureCanvas();
        drawSignature();
    }

    if (showMeasure) {
        drawBloodPressureUI();
    }
    if (currentSceneState === STATE.ENDING) {
        drawFloatingSignatures();
    }
}

function updateSceneVisuals() {
    let targetAmp = INITIAL_AMP;
    let targetSpeed = INITIAL_SPEED;
    let targetHue = 210;
    let targetSat = 80;

    switch (currentSceneState) {
        case STATE.INITIAL:
            targetHue = 210;
            targetAmp = 100;
            break;

        case STATE.POST_INJECT:
            targetHue = 270;
            targetAmp = 150;
            targetSpeed = 0.02;
            break;

        case STATE.POST_BP:
            targetHue = 330;
            targetAmp = 200;
            targetSpeed = 0.04;
            break;

        case STATE.EMBRYO:
            let depth = map(needleY, height, height / 2, 0, 1, true);
            targetHue = map(depth, 0, 1, 330, 360);
            targetAmp = map(depth, 0, 1, 200, 400);
            targetSpeed = map(depth, 0, 1, 0.04, 0.1);
            break;

        case STATE.POST_EMBRYO:
            targetHue = 210;
            targetAmp = 100;
            targetSpeed = INITIAL_SPEED;
            break;

        case STATE.BABY:
            targetHue = map(press, 0, 500, 20, 0);
            targetAmp = map(press, 0, 500, 100, 300);
            targetSpeed = map(press, 0, 500, 0.01, 0.1);
            break;

        case STATE.GONE:
            targetHue = 0;
            targetSat = 0;
            targetAmp = 50;
            targetSpeed = 0.005;
            break;
        case STATE.ENDING:
            targetAmp = params.amp;
            targetSpeed = params.speed;
            targetHue = params.bgColor[0];
            targetSat = params.bgColor[1];
            break;
    }

    if (showInjection && mouseIsPressed && checkMouseOverBody()) {
        targetHue = 360;
        let interactiveAmp = map(press, 0, 200, 0, 100);
        let interactiveSpeed = map(press, 0, 200, 0.001, 0.015)
        targetAmp += interactiveAmp;
        targetSpeed += interactiveSpeed;
        targetAmp = constrain(targetAmp, 100, 200);
        targetSpeed = constrain(targetSpeed, 0.005, 0.02)
        press += 2;
    }

    params.amp = lerp(params.amp, targetAmp, 0.05);
    params.speed = lerp(params.speed, targetSpeed, 0.05);

    let currentHue = params.bgColor[0];
    let newHue = lerp(currentHue, targetHue, 0.05);

    if (currentSceneState !== STATE.ENDING && currentSceneState !== STATE.GONE) {
        let currentHue = params.bgColor[0];
        let newHue = lerp(currentHue, targetHue, 0.05);
        params.bgColor = [newHue, targetSat, 20, 100];
        params.lineColor = [newHue - 10, targetSat - 20, 90, 80];
    }

    else if (currentSceneState === STATE.GONE) {
        params.bgColor = [0, 0, 5, 100];
        params.lineColor = [0, 0, 50, 50];
    } else {
        params.bgColor = [newHue, targetSat, 20, 100];
        params.lineColor = [newHue - 10, targetSat - 20, 90, 80];
    }
}

function drawWaves() {
    strokeWeight(1.5);
    noFill();
    noTint();

    for (let y = 100; y < height; y += params.layerGap) {
        let alpha = map(y, 0, height, 10, 100);
        stroke(params.lineColor[0], params.lineColor[1], params.lineColor[2], alpha);
        beginShape();
        for (let x = 0; x <= width; x += params.curveRes) {
            let noiseVal = noise(x * params.density, y * 0.02, t);
            let waveHeight = map(noiseVal, 0, 1, -params.amp, params.amp);
            vertex(x, y + waveHeight);
        }
        endShape();
    }
    t += params.speed;
}

function drawSceneContent() {
    let drawX = imgX;
    let drawY = imgY;

    if (currentSceneState === STATE.EMBRYO || showEmbryo) {
        if (uterusImg) {

            let depth = map(needleY, height, height / 2, 0, 1, true);
            let baseColor = color(0, 0, 100);
            let targetColor = color(0, 100, 100);
            let redAmount = map(depth, 0.5, 1.0, 0, 1, true);
            let finalColor = lerpColor(baseColor, targetColor, redAmount);
            tint(finalColor);
            let shake = map(depth, 0, 1, 0, 5, true);
            image(uterusImg, width / 2 + random(-shake, shake), height / 2, uterusW, uterusH);
            noTint();
        }
    }
    else if (currentSceneState === STATE.BABY) {
        updateBabyLogic();
        if (babyImg && babyScale > 0) {
            let alpha = map(babyScale, 0, 1, 0, 100);
            tint(0, 0, 100, alpha);
            image(babyImg, width / 2, height / 2, babyImg.width * babyScale, babyImg.height * babyScale);
        }
    }
    else if (currentSceneState !== STATE.GONE) {
        if (showInjection || showMeasure) {
            if (bodyImg) {
                let bodyHue = params.bgColor[0];

                if (showInjection && mouseIsPressed && checkMouseOverBody()) {
                    tint(360, 80, 100);
                    let shake = 5;
                    drawX += random(-shake, shake);
                    drawY += random(-shake, shake);
                } else {
                    tint(bodyHue, 50, 100);
                }
                image(bodyImg, drawX, drawY, imgW, imgH);
            }
        }
    }
}

function drawTools() {
    if (showInjection && needleImg) {
        noTint();
        image(needleImg, mouseX, mouseY, 64, 64);
    }
    else if (showMeasure && stethoscopeImg) {
        noTint();
        image(stethoscopeImg, mouseX, mouseY, 64, 64);
    }
    else if (showEmbryo && needleImg) {
        handleEmbryoInteraction();
        noTint();
        image(needleImg, width / 2, needleY, 150, 150);
    }
}

function drawBloodPressureUI() {
    if (mouseIsPressed && checkMouseOverBody()) {
        currentBP += 3.5;
    } else {
        currentBP -= 2;
    }
    currentBP = constrain(currentBP, 0, 220);

    if (currentBP > 0) {
        let barX = width / 2;
        let barY = height - 100;
        let barW = 300;

        let isCritical = currentBP > 160;
        let barHue = isCritical ? 0 : 120;

        noStroke();
        fill(0, 0, 30, 80);
        rectMode(CENTER);
        rect(barX, barY, barW, 20, 10);

        fill(barHue, 80, 90);
        let progress = map(currentBP, 0, 200, 0, barW);
        rectMode(CORNER);
        rect(barX - barW / 2, barY - 10, progress, 20, 10);

        fill(0, 0, 100);
        textAlign(CENTER, BOTTOM);
        textSize(24);
        text(Math.floor(currentBP) + " mmHg", barX, barY - 15);

        if (isCritical) {
            const warning = document.getElementById('bp-warning');
            if (warning) warning.style.opacity = 1;

            if (currentBP > 200) {
                setSceneState(STATE.POST_BP);
            }
        } 
        else {
            const warning = document.getElementById('bp-warning');
            if (warning) warning.style.opacity = 0;
        }
    }
}

function handleEmbryoInteraction() {
    let inputY = mouseY;

    let constrainedInputY = constrain(inputY, height * 0.3, height * 0.8);

    let targetNeedleY = constrainedInputY;

    needleY = lerp(needleY, targetNeedleY, 0.1);
}

function updateBabyLogic() {
    babySceneTime++;

    let dynamicShrinkRate;
    if (babySceneTime < 300) {
        dynamicShrinkRate = 0.005;
        babyPullForce = 0.005
    } else if (babySceneTime > 1500) {
        dynamicShrinkRate = 1;
        babyPullForce = 0;
    } else {
        dynamicShrinkRate = map(babySceneTime, 300, 1500, 0.005, 0.03);
        babyPullForce = map(babySceneTime, 300, 1500, 0.005, 0.02);
    }

    if (mouseIsPressed) {
        babyScale += babyPullForce;
        press += 5;
    } else {
        babyScale -= dynamicShrinkRate;
        press -= 2;
    }

    press = constrain(press, 0, 500);

    if (babyScale > 0.7) babyScale = 0.7;

    if (babyScale <= 0) {
        babyScale = 0;
        setSceneState(STATE.GONE);
    }
}

//打針
function setInjectionMode(isActive) {
    showInjection = isActive;
    if (isActive) {
        noCursor();
        params.trail = 100;
    } else {
        cursor();
        setSceneState(STATE.POST_INJECT);
    }
}

function hideBPWarning() {
  const warning = document.getElementById('bp-warning');
  if (warning) warning.style.opacity = 0;
}

//量血壓
function setMeasuringMode(isActive) {
    showMeasure = isActive;

    if (isActive) {
        noCursor();
        params.trail = 100;
        currentBP = 0;
    } else {
        cursor();
        hideBPWarning(); 
    }
}

//注射胚胎
function setEmbryoMode(isActive) {
    showEmbryo = isActive;
    if (isActive) {
        setSceneState(STATE.EMBRYO);
        needleY = height;
        noCursor();
        params.trail = 100;
    } else {
        cursor();
        setSceneState(STATE.POST_EMBRYO);
    }
}

//找嬰兒
function setBabyMode(isActive) {
    showBabyMode = isActive;
    if (isActive) {
        setSceneState(STATE.BABY);
        babyScale = 0.7;
        babySceneTime = 0;
        press = 0;
        cursor();
    }
}
//結尾
function setEndingMood(winner) {
    setSceneState(STATE.ENDING);

    let endBg = [210, 80, 20, 100];
    let endLine = [200, 60, 90, 80];
    let endBlur = false;

    if (winner === 'support') {
        params.amp = 300;
        params.speed = 0.1;
        params.trail = 80;
        params.bgColor = [280, 80, 20, 100];
        params.lineColor = [340, 80, 90, 80];
        endBlur = false;
    }
    else if (winner === 'oppose') {
        params.amp = 50;
        params.speed = 0.005;
        params.trail = 20;
        params.bgColor = [200, 70, 40, 100];
        params.lineColor = [190, 30, 100, 80];
        endBlur = false;
    }
    else if (winner === 'pause') {
        params.amp = 30;
        params.speed = 0.001;
        params.trail = 10;
        params.bgColor = [0, 0, 30, 100];
        params.lineColor = [0, 0, 60, 50];
        endBlur = true;
    }

    const canvas = document.querySelector('canvas');
    if (endBlur) {
        canvas.style.filter = 'blur(5px)';
        canvas.style.transition = 'filter 3s ease';
    } else {
        canvas.style.filter = 'blur(0px)';
    }
}

//漂浮簽名
function triggerFloatingSignatures(fileList) {

    if (!fileList && !userSignatureImg) return;
    floatingSignatures = [];

    let layoutX = 50;
    let layoutY = height * 0.15;
    let maxHeightInRow = 0;
    let margin = 30;

    function addFloatingSignature(img) {
        let w = img.width * 0.4;
        let h = img.height * 0.4;

        if (layoutX + w > width - 50) {
            layoutX = 50;
            layoutY += maxHeightInRow + margin;
            maxHeightInRow = 0;
        }

        let targetX = layoutX;
        let targetY = layoutY;

        if (h > maxHeightInRow) maxHeightInRow = h;
        layoutX += w + margin;

        floatingSignatures.push({
            img: img,
            x: targetX,
            y: height + random(100, 300),
            w: w,
            h: h,
            targetY: targetY,
            floatOffset: random(0, 100)
        });
    }

    if (Array.isArray(fileList) && fileList.length > 0) {
        console.log(`準備載入 ${fileList.length} 張簽名...`);
        fileList.forEach((filename) => {
            const imageUrl = `${FRONTEND_IMG_PATH}${filename}`;

            loadImage(imageUrl, (img) => {
                addFloatingSignature(img);
            }, (err) => {
                console.warn("略過尚未同步的圖片:", filename);
            });
        });
    }
    else if (userSignatureImg) {
        console.log("使用玩家簽名作為備案");
        for (let i = 0; i < 20; i++) {
            addFloatingSignature(userSignatureImg);
        }
    }
}



function drawFloatingSignatures() {
    if (floatingSignatures.length === 0) return;

    floatingSignatures.forEach(sig => {
        let floatY = Math.sin((frameCount * 0.03) + sig.floatOffset) * 15;

        let currentTargetY = sig.targetY + floatY;

        sig.y = lerp(sig.y, currentTargetY, 0.03);

        noTint();
        imageMode(CORNER);
        if (sig.img) {
            image(sig.img, sig.x, sig.y, sig.w, sig.h);
        }
    });

    imageMode(CENTER);
}


function setSceneState(newState) {
    currentSceneState = newState;
    params.trail = 100;
}


function windowResized() {
    resizeCanvas(window.innerWidth, window.innerHeight);
    calculateImageBounds();
}


function calculateImageBounds() {
    imgX = width / 2;
    imgY = height / 2;
    imgH = height * 0.8;

    if (bodyImg && bodyImg.width > 0) {
        imgW = (bodyImg.width / bodyImg.height) * imgH;
    } else {
        imgW = 300;
    }

    if (uterusImg && uterusImg.width > 0) {
        uterusH = height * 0.3;
        let ratio = uterusImg.width / uterusImg.height;
        uterusW = uterusH * ratio;
    } else {
        uterusW = 300;
        uterusH = 300;
    }
}

function checkMouseOverBody() {
    let left = imgX - imgW / 2;
    let right = imgX + imgW / 2;
    let top = imgY - imgH / 2;
    let bottom = imgY + imgH / 2;
    return (mouseX > left && mouseX < right && mouseY > top && mouseY < bottom);
}

function updateSignature(dataUrl) {
    loadImage(dataUrl, (img) => {
        userSignatureImg = img;
    });
}

function loadUserSignature(path) {
    userSigPath = path;
    loadImage(path, (img) => {
        userSignatureImg = img;
    });
}

function initSignatureCanvas() {
    const container = document.getElementById('signature-display');

    if (container && !signatureCanvasInstance) {
        signatureCanvasInstance = createCanvas(container.offsetWidth, container.offsetHeight);
        signatureCanvasInstance.parent('signature-display');
        signatureCanvasInstance.style('z-index', 1);
    }
}

function updateLiveVisuals(data) {
    if (!data) return;

    let support = parseInt(data.support) || 0;
    let oppose = parseInt(data.oppose) || 0;
    let pause = parseInt(data.pause) || 0;

    let winner = 'support';
    let maxVotes = support;

    if (oppose > maxVotes) {
        winner = 'oppose';
        maxVotes = oppose;
    }
    if (pause > maxVotes) {
        winner = 'pause';
    }

    setEndingMood(winner);
    console.log(`即時視覺更新: 目前贏家是 ${winner}`);
}
/*
function drawSignature() {
    if (!signatureCanvasInstance) return;

    signatureCanvasInstance.noStroke();
    //signatureCanvasInstance.background(0, 0, 0, 0.3); 

    if (userSignatureImg) {
        let cw = signatureCanvasInstance.width;
        let ch = signatureCanvasInstance.height;

        let sigW = cw * 0.9;
        let sigH = ch * 0.9;

        signatureCanvasInstance.imageMode(CENTER);
        signatureCanvasInstance.image(userSignatureImg, cw / 2, ch / 2, sigW, sigH);
    }
} */
