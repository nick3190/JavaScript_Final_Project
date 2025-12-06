const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    console.log('收到根路徑的 GET 請求');
    res.status(200).send('歡迎來到我的 Express 伺服器！');
});


app.get('/api/story', (req, res) => {
    const storyList = [
        { id: 1, title: '故事的開端', status: 'completed' },
        { id: 2, title: '黑暗森林的選擇', status: 'in-progress' }
    ];

    res.status(200).json({ 
        message: '成功取得故事列表',
        data: storyList
    });
});

app.post('/api/save-progress', (req, res) => {
    const progressData = req.body;  
    console.log('正在儲存進度數據:', progressData); 
    res.status(201).json({ 
        message: '進度已成功儲存！',
        savedId: progressData.userId || 'guest'
    });
});

app.use((req, res, next) => {
    res.status(404).send("抱歉，您請求的資源不存在。");
});


app.listen(PORT, () => {
    console.log(`\n============================================`);
    console.log(`🚀 伺服器已成功啟動！`);
    console.log(`🌐 服務網址: http://localhost:${PORT}`);
    console.log(`============================================\n`);
});
app.listen(PORT, () => { /* ... */ });