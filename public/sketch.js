const INITIAL_AMP = 100;
const MAX_AMP = 150;
const INITIAL_SPEED = 0.005;
const MAX_SPEED = 0.08;
const MAX_PRESS = 600;
const CRITICAL_LIMIT = 800;

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
let userSignatureImg = null;
let bodyImg, needleImg, babyImg, stethoscopeImg;
let imgX, imgY, imgW, imgH;


let press = 0;        // 壓力值（打針）
let currentBP = 0;    // 血壓值（量血壓）

// 遊戲場景開關
let showInjection = false;  // 打針
let showMeasure = false;    // 量血壓
let showBabyMode = false;   // 嬰兒

// 嬰兒參數
let babyScale = 1.0;
let babyGone = false;
let isDead = false;
let glitchTimer = 0;

function preload() {
    bodyImg = loadImage('./images/bodyPic.png');
    needleImg = loadImage('./images/needle.png');
    babyImg = loadImage('./images/baby.png');
    stethoscopeImg = loadImage('./images/stethoscope.png');
}

function setup() {
    createCanvas(window.innerWidth, window.innerHeight);
    colorMode(HSB, 360, 100, 100, 100);
    imageMode(CENTER);
    noFill();
    cursor();

    calculateImageBounds();
    setShakeThreshold(30);
}

function draw() {
    if (showBabyMode) {
        updateBabySceneParams();
    } else if (showMeasure) {
        updateEnvironmentParams(); 
    } else {
        updateInjectionParams();
    }

    background(params.bgColor[0], params.bgColor[1], params.bgColor[2], params.trail);

    if (showInjection || showMeasure) {
        drawBodyAndNeedle();
        if (showMeasure) {
            drawBloodPressureUI();
        }
    }

    else if (showBabyMode) {
        drawBabyScene();
    }

    if (glitchTimer > 0) {
        drawGlitchEffect();
        glitchTimer--;
    }

    strokeWeight(1.5);
    noTint();

    for (let y = 100; y < height; y += params.layerGap) {
        let alpha = map(y, 0, height, 10, 100);
        stroke(params.lineColor[0], params.lineColor[1], params.lineColor[2], alpha);
        beginShape();
        for (let x = 0; x <= width; x += params.curveRes) {
            let noiseVal = noise(x * params.density, y * 0.02, t);
            let waveHeight = map(noiseVal, 0, 1, -params.amp, params.amp);
            if (isDead) waveHeight *= 0.2;
            vertex(x, y + waveHeight);
        }
        endShape();
    }
    t += params.speed;

    if (showInjection && needleImg) {
        noTint();
        image(needleImg, mouseX, mouseY, 64, 64);
    } else if (showMeasure && stethoscopeImg) {
        noTint();
        image(stethoscopeImg, mouseX, mouseY, 64, 64);
    }
}

// 打針
function updateInjectionParams() {
    let isInjecting = checkInjectionState();

    if (isInjecting) {
        press += 2;
        if (press > MAX_PRESS) press = MAX_PRESS;

        params.bgColor = [0, 90, 40, 100];
        params.lineColor = [0, 0, 100];

        params.amp = map(press, 0, MAX_PRESS, INITIAL_AMP, MAX_AMP);
        params.speed = map(press, 0, MAX_PRESS, INITIAL_SPEED, MAX_SPEED);
    } else {
        updateEnvironmentParams();
    }
}


function updateEnvironmentParams() {
    params.amp = map(press, 0, MAX_PRESS, INITIAL_AMP, MAX_AMP);
    params.speed = map(press, 0, MAX_PRESS, INITIAL_SPEED, MAX_SPEED);

    let bgHue = map(press, 0, MAX_PRESS, 210, 320);
    let bgSat = map(press, 0, MAX_PRESS, 80, 60);
    let bgBri = map(press, 0, MAX_PRESS, 20, 15);
    params.bgColor = [bgHue, bgSat, bgBri, 100];

    let lineHue = map(press, 0, MAX_PRESS, 200, 320);
    let lineSat = map(press, 0, MAX_PRESS, 60, 40);
    let lineBri = map(press, 0, MAX_PRESS, 90, 80);
    params.lineColor = [lineHue, lineSat, lineBri];
}


function updateBabySceneParams() {
    if (isDead) {
        params.bgColor = [0, 0, 10, 100];
        params.lineColor = [0, 0, 40];
        params.speed = 0.002;
        params.amp = 20;
        return;
    }

    if (babyGone) {
        let chaosHue = map(press, 0, CRITICAL_LIMIT, 210, 360);
        let chaosSat = map(press, 0, CRITICAL_LIMIT, 50, 100);

        params.bgColor = [chaosHue, chaosSat, 20, 100];
        params.lineColor = [chaosHue, 20, 100];
        params.amp = map(press, 0, CRITICAL_LIMIT, 50, 300);
        params.speed = map(press, 0, CRITICAL_LIMIT, 0.01, 0.2);

        if (press >= CRITICAL_LIMIT) triggerGlitchAndDie();
    } else {
        params.bgColor = [210, 60, 30, 100];
        params.lineColor = [200, 40, 90];
    }
}

function drawBodyAndNeedle() {
    let drawX = imgX;
    let drawY = imgY;

    let isInjecting = checkInjectionState();
    let isMeasuring = checkMeasureState();

    if (bodyImg) {
        if (isInjecting) {
            tint(0, 80, 100, 100);
            let shake = press / 100 + 5;
            drawX += random(-shake, shake);
            drawY += random(-shake, shake);
        } else {
            let bodyRestHue = map(press, 0, MAX_PRESS, 200, 360);
            tint(bodyRestHue, 80 ,100,100);

            if (isMeasuring) {
                tint(bodyRestHue, 50, 100, 100);
            } else {
                let isHovering = checkMouseOverBody();
                if (isHovering) tint(bodyRestHue, 40, 100, 90);
                else tint(bodyRestHue, 60, 80, 80);
            }
        }
        image(bodyImg, drawX, drawY, imgW, imgH);
    }

    if (userSignatureImg) {
        tint(0, 0, 100, 80);
        image(userSignatureImg, drawX, drawY, imgW, imgH / 2);
    }
}

function drawBloodPressureUI() {
    let isMeasuring = checkMeasureState();

    if (isMeasuring) currentBP += 1;
    else currentBP -= 2;

    currentBP = constrain(currentBP, 0, 180);

    if (currentBP > 0) {
        let barW = 300;
        let barH = 20;
        let barX = width / 2 - barW / 2;
        let barY = height - 100;

        noStroke();
        fill(0, 0, 30, 80);
        rectMode(CORNER);
        rect(barX, barY, barW, barH, 10);

        let progress = map(currentBP, 0, 180, 0, barW);
        let barHue = map(currentBP, 80, 180, 120, 0);
        barHue = constrain(barHue, 0, 120);

        fill(barHue, 80, 90, 100);
        rect(barX, barY, progress, barH, 10);

        fill(0, 0, 100);
        textAlign(CENTER, BOTTOM);
        textSize(24);
        text(Math.floor(currentBP) + " mmHg", width / 2, barY - 10);

        rectMode(CENTER);
        textAlign(CENTER, CENTER);
    }
}

function drawBabyScene() {
    if (isDead) return;

    if (!babyGone && babyImg) {
        babyScale -= 0.001;
        if (babyScale <= 0.001) {
            babyScale = 0;
            babyGone = true;
            press = 0;
        }

        let alpha = map(babyScale, 0, 1, 0, 100);
        tint(0, 0, 100, alpha);

        let bW = babyImg.width * babyScale;
        let bH = babyImg.height * babyScale;
        image(babyImg, width / 2, height / 2, bW, bH);
    }
}

function drawGlitchEffect() {
    let offsetX = random(-50, 50);
    let offsetY = random(-10, 10);
    copy(0, 0, width, height, offsetX, offsetY, width, height);

    noStroke();
    fill(random(360), 100, 100, 50);
    rect(random(width), random(height), width, random(50));
}

function triggerGlitchAndDie() {
    glitchTimer = 30;
    isDead = true;
}

function mousePressed() {
    if (showBabyMode && !isDead) {
        if (!babyGone) {
            babyScale += 0.08;
            if (babyScale > 1.2) babyScale = 1.2;
        } else {
            press += 20;
        }
    }
}

function deviceShaken() {
    if (showBabyMode && babyGone && !isDead) {
        press += 15;
    }
}

function touchStarted() {
    if (showInjection || showMeasure || showBabyMode) return false;
    return true;
}

function windowResized() {
    resizeCanvas(window.innerWidth, window.innerHeight);
    calculateImageBounds();
}

function calculateImageBounds() {
    imgX = width / 2;
    imgY = height / 2;
    imgH = height * 0.8;
    if (bodyImg) imgW = (bodyImg.width / bodyImg.height) * imgH;
    else imgW = 300;
}

function checkMouseOverBody() {
    let leftBound = imgX - imgW / 2;
    let rightBound = imgX + imgW / 2;
    let topBound = imgY - imgH / 2;
    let bottomBound = imgY + imgH / 2;
    return (mouseX > leftBound && mouseX < rightBound && mouseY > topBound && mouseY < bottomBound);
}

function checkInjectionState() {
    if (!showInjection) return false;
    return checkMouseOverBody() && mouseIsPressed;
}

function checkMeasureState() {
    if (!showMeasure) return false;
    return checkMouseOverBody() && mouseIsPressed;
}

function updateSignature(dataUrl) {
    loadImage(dataUrl, (img) => userSignatureImg = img);
}


function setInjectionMode(isActive) {
    showInjection = isActive;
    if (isActive) {
        showMeasure = false;
        showBabyMode = false;
        noCursor();
    } else {
        if (!showMeasure && !showBabyMode) cursor();
    }
}


function setMeasuringMode(isActive) {
    showMeasure = isActive;
    if (isActive) {
        showInjection = false;
        showBabyMode = false;
        noCursor();
    } else {
        if (!showInjection && !showBabyMode) cursor();
    }
}

function setBabyMode(isActive) {
    showBabyMode = isActive;
    if (isActive) {
        showInjection = false;
        showMeasure = false;

        babyScale = 1.0;
        babyGone = false;
        isDead = false;
        press = 0;
        cursor();
    } else {
        if (!showInjection && !showMeasure) cursor();
    }
}