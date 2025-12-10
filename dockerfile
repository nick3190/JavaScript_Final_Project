# 1. 使用 Node.js 的輕量版環境作為基底
FROM node:18-alpine

# 2. 設定容器內的工作目錄 (就像是進入一個資料夾)
WORKDIR /app

# 3. 先複製 package.json 和 package-lock.json
# 這樣做是為了利用快取，讓安裝速度變快
COPY package*.json ./

# 4. 安裝依賴套件 (npm install)
RUN npm install --production

# 5. 把你剩下的程式碼全部複製進去
COPY . .

# 6. 告訴 Docker 你的網站是用哪個 Port (通常 Express 預設是 3000)
# 如果你的程式碼是寫 app.listen(8080)，這裡就要改 8080
EXPOSE 3000

# 7. 啟動網站的指令 (通常是 npm start 或 node app.js)
CMD ["npm", "start"]