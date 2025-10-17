import 'zone.js/node';

import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';

import bootstrap from './src/main.server';

/** Экспортируем Express-приложение (можно использовать в serverless) */
export function app(): express.Express {
  const server = express();

  // dist/webapp/server — тут окажется этот файл после сборки
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  // dist/webapp/browser — клиентские артефакты
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(browserDistFolder, 'index.html');

  const commonEngine = new CommonEngine();

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  // Статика (JS/CSS/assets)
  server.get('*.*', express.static(browserDistFolder, { maxAge: '1y' }));

  // Все обычные роуты рендерим через Angular
  server.get('*', async (req, res, next) => {
    try {
      const html = await commonEngine.render({
        bootstrap,
        documentFilePath: indexHtml,
        url: req.originalUrl,
        providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }],
      });
      res.send(html);
    } catch (err) {
      next(err);
    }
  });

  return server;
}

/** Локальный запуск SSR-сервера */
function run(): void {
  const port = Number(process.env['PORT'] ?? 4000);
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express SSR is listening on http://localhost:${port}`);
  });
}

run();
