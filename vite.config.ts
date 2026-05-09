import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { GoogleGenAI, Type } from "@google/genai";

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'api-handler',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url === '/api/generate-rpm' && req.method === 'POST') {
              let body = '';
              req.on('data', chunk => { body += chunk.toString(); });
              req.on('end', async () => {
                try {
                  const { data } = JSON.parse(body);
                  const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
                  
                  if (!apiKey) {
                    res.statusCode = 500;
                    res.end(JSON.stringify({ error: 'GEMINI_API_KEY is not set' }));
                    return;
                  }

                  const genAI = new GoogleGenAI({ apiKey });
                  
                  const response = await genAI.models.generateContent({ 
                    model: "gemini-3-flash-preview",
                    contents: `
                      Generate a lesson plan in JSON format based on:
                      School: ${data.sekolah}, Subject: ${data.mataPelajaran}, Topic: ${data.materi}.
                      Use the provided structure.
                    `,
                    config: {
                      responseMimeType: "application/json",
                    }
                  });

                  res.setHeader('Content-Type', 'application/json');
                  res.end(response.text);
                } catch (e) {
                  res.statusCode = 500;
                  res.end(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }));
                }
              });
              return;
            }
            next();
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
