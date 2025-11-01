// Importa o puppeteer
import puppeteer from 'puppeteer';

// Seletores do site (!!! IMPORTANTE !!!)
// Você PRECISARÁ ajustar isso inspecionando o site veoaifree.com
const URL_DO_SITE = 'https://veoaifree.com/veo-video-generator/';
const SELETOR_DO_INPUT_DE_PROMPT = 'textarea#prompt'; // <<-- CHUTE (ex: <textarea id="prompt">)
const SELETOR_DO_BOTAO_SUBMIT = 'button.generate-button'; // <<-- CHUTE (ex: <button class="generate-button">)
const SELETOR_DO_VIDEO_RESULTADO = 'video.result-video'; // <<-- CHUTE (ex: <video class="result-video">)

// Função principal assíncrona
async function rodarScraper() {
  console.log('Iniciando o scraper...');

  // Pega o prompt que o GitHub Actions nos enviou
  const prompt = process.env.PROMPT_DO_USUARIO;
  if (!prompt) {
    console.error('Erro: O prompt não foi fornecido.');
    process.exit(1); // Sai com erro
  }
  console.log(`Prompt recebido: "${prompt}"`);

  // Inicia o navegador "fantasma" (headless)
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  try {
    // 1. Navega até o site
    console.log(`Navegando para ${URL_DO_SITE}...`);
    await page.goto(URL_DO_SITE, { waitUntil: 'networkidle2' });

    // 2. Digita o prompt no campo de texto
    console.log('Digitando o prompt...');
    await page.waitForSelector(SELETOR_DO_INPUT_DE_PROMPT);
    await page.type(SELETOR_DO_INPUT_DE_PROMPT, prompt);

    // 3. Clica no botão de gerar
    console.log('Clicando em "Gerar"...');
    await page.waitForSelector(SELETOR_DO_BOTAO_SUBMIT);
    await page.click(SELETOR_DO_BOTAO_SUBMIT);

    // 4. A MÁGICA: Espera o vídeo aparecer
    console.log('Aguardando o resultado do vídeo... Isso pode levar alguns minutos.');
    // Vamos esperar por até 5 minutos (300.000 ms)
    await page.waitForSelector(SELETOR_DO_VIDEO_RESULTADO, { timeout: 300000 });

    // 5. Pega a URL (src) do vídeo
    const videoUrl = await page.$eval(SELETOR_DO_VIDEO_RESULTADO, el => el.src);

    // 6. Imprime o resultado final!
    console.log('--- SUCESSO! ---');
    console.log(`URL do vídeo gerado: ${videoUrl}`);
    console.log('------------------');

  } catch (error) {
    console.error('Ocorreu um erro durante o scraping:', error.message);
    // Tira um print da tela para ajudar a debugar
    await page.screenshot({ path: 'erro-screenshot.png' });
    console.log('Screenshot "erro-screenshot.png" salvo para debug.');
  } finally {
    // Fecha o navegador
    await browser.close();
    console.log('Scraper finalizado.');
  }
}

// Roda a função
rodarScraper();
