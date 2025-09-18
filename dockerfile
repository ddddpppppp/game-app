docker run -d --name my-next \
  -p 3000:3000 \
  -v /www/wwwroot/app.game-hub.cc:/app \
  -w /app \
  node:22.17.0 bash -lc "npm i -g pnpm && pnpm i --frozen-lockfile || pnpm i && pnpm build && pnpm start -p 3000"

docker stop my-next
docker rm my-next
docker run -d --name my-next \
  -p 3000:3000 \
  -v /www/wwwroot/app.game-hub.cc:/app \
  -w /app \
  node:22.17.0 bash -lc "npm run build && npm start"
