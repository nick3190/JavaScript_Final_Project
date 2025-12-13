const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use((req, res, next) => {
    // 允許所有來源進行跨域存取。如果只允許特定 IP/域名，請替換 '*'
    res.header('Access-Control-Allow-Origin', '*');

    // 允許必要的標頭，這對於 POST 請求傳遞 JSON 數據是必需的
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    // 允許所有主要 HTTP 方法 (OPTIONS 是預檢請求)
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');

    // 處理瀏覽器發送的 OPTIONS 預檢請求
    if (req.method === 'OPTIONS') {
        // 直接結束 OPTIONS 請求並回傳成功狀態
        console.log('Received OPTIONS preflight request. Responding with 200 OK.');
        return res.status(200).send();
    }

    // 繼續處理下一個中介軟體或路由
    next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));


app.use(express.static('public'));


const visualConfig = {
    speed: 0.005,
    amp: 80,            // 波浪振幅
    density: 0.01,      // 波浪密度
    layerGap: 60,       // 線條間距
    curveRes: 20,       // 線條解析度
    trail: 5,           // 殘影強度
    bgColor: [210, 80, 20, 100],
    lineColor: [200, 60, 90]
};


// 前端get參數
app.get('/api/config', (req, res) => {
    res.json(visualConfig);
});

const signatureDir = path.join(__dirname, 'public', 'images', 'signature');
if (!fs.existsSync(signatureDir)) {
    fs.mkdirSync(signatureDir, { recursive: true });
}

// 接收簽名圖
app.post('/api/save-signature', (req, res) => {
    const { image } = req.body;

    if (!image) {
        return res.status(400).send('No image data received');
    }

    const base64Data = image.replace(/^data:image\/png;base64,/, "");
    const filename = `sig_${Date.now()}.png`;
    const savePath = path.join(signatureDir, filename);

    fs.writeFile(savePath, base64Data, 'base64', (err) => {
        if (err) {
            console.error("存檔失敗:", err);
            return res.status(500).send('Error saving image');
        }
        console.log(`簽名已儲存: ${filename}`);
        res.json({ filename: filename });
    });
});


const VOTE_FILE = path.join(__dirname, 'votes.json');

function getVotes() {
    if (!fs.existsSync(VOTE_FILE)) {
        return { support: 0, oppose: 0, pause: 0, total: 0 };
    }
    const data = fs.readFileSync(VOTE_FILE);
    return JSON.parse(data);
}


//取得投票統計
app.get('/api/vote-stats', (req, res) => {
    const votes = getVotes();
    res.json(votes);
});

//接收投票
app.post('/api/vote', (req, res) => {
    const { decision } = req.body;

    let votes = getVotes();

    if (votes[decision] !== undefined) {
        votes[decision]++;
        votes.total++;

        fs.writeFileSync(VOTE_FILE, JSON.stringify(votes, null, 2));

        console.log(`收到新投票: ${decision} (目前總票數: ${votes.total})`);
        res.json({ success: true, stats: votes });
    } else {
        res.status(400).json({ error: 'Invalid decision option' });
    }
});

//送簽名圖給前端
app.get('/api/all-signatures', (req, res) => {
    fs.readdir(signatureDir, (err, files) => {
        if (err) {
            console.error("無法讀取簽名資料夾", err);
            return res.json([]);
        }
        const pngFiles = files.filter(file => file.endsWith('.png'));
        res.json(pngFiles);
    });
});


app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
    console.log(`Visual config ready.`);
    console.log(`Vote system ready.`);
});