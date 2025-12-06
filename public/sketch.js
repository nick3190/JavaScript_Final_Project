let params = {
    speed: 0.005,       // 流動速度：數值越小越慢 (0.001 ~ 0.01)
    amp: 50,            // 波浪振幅(高度)：數值越大浪越高 (30 ~ 100)
    density: 0.01,      // 波浪密度(頻率)：數值越大越碎 (0.005 ~ 0.02)
    layerGap: 30,       // 線條間距：數值越小越密集 (10 ~ 30)
    curveRes: 20,       // 線條解析度：數值越小線條越平滑但較耗效能 (10 ~ 50)
    trail: 5,           // 殘影強度：0(長殘影) ~ 100(無殘影)
    bgColor: [210, 80, 20, 100], // 背景色 HSB (H, S, B, A)
    lineColor: [200, 60, 90] // 線條色 HSB (H, S, B)
};

let t = 0;

function setup() {
    createCanvas(window.innerWidth, window.innerHeight);
    colorMode(HSB, 360, 100, 100, 100);
    noFill(); 
}

function draw() {
    background(params.bgColor[0], params.bgColor[1], params.bgColor[2], params.trail);

    strokeWeight(1.5);

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

function windowResized() {
    resizeCanvas(window.innerWidth, window.innerHeight);
}