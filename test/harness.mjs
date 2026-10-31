// Arnés de prueba: abre gravity.html en Chromium con un window.claude simulado
// que responde con las fixtures (misma forma que IB y FMP), recorre las vistas,
// dispara el chat con herramientas y guarda capturas. Uso:
//   node test/harness.mjs [outDir] [vendorDir]
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = (() => { try { return require("playwright"); } catch { return require("/opt/node-tools/node_modules/playwright"); } })();
import fs from "node:fs";
import path from "node:path";
import * as F from "./fixtures.mjs";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const outDir = process.argv[2] || path.join(root, "test", "out");
const vendorDir = process.argv[3] || "";
fs.mkdirSync(outDir, { recursive: true });

const page_html = fs.readFileSync(path.join(root, "gravity.html"), "utf8");
const skeleton = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui}img{max-width:100%}[hidden]{display:none!important}</style></head><body>${page_html}</body></html>`;
const pagePath = path.join(outDir, "page.html");
fs.writeFileSync(pagePath, skeleton);

const fixtures = JSON.parse(JSON.stringify(F));
const initScript = `(() => {
  const F = ${JSON.stringify(fixtures)};
  const IB = "Interactive Brokers (IBKR)", FMP = "FMP";
  const calls = []; window.__calls = calls;
  const res = (payload) => ({ content:[{type:"text", text: JSON.stringify(payload)}], payload, cache:{storedAt: Date.now(), revalidating:false} });
  function route(server, tool, input){
    calls.push({server, tool, input});
    if(server!==IB && server!==FMP) throw Object.assign(new Error("no server"), {code:"server_not_connected", server});
    if(server===IB){
      switch(tool){
        case "get_account_positions": return F.positions;
        case "get_account_summary": return F.summary;
        case "get_account_balances": return F.balances;
        case "get_pa_performance_all_periods": return F.perf;
        case "get_pa_allocation": return F.allocation;
        case "get_price_history": return F.priceHistory;
      }
    } else {
      const ep = input && input.endpoint;
      if(tool==="quote"){ const syms = input.symbols || [input.symbol]; const all = [...F.quotes, ...F.tape]; return all.filter(q => syms.includes(q.symbol)); }
      if(tool==="insiderTrades"){ if(ep==="latest-insider-trade") return F.latestInsiders; if(ep==="search-insider-trades") return F.insidersBySymbol[input.symbol] || []; if(ep==="insider-trade-statistics") return [{symbol:input.symbol, year:2026, quarter:3, totalPurchases:2, totalSales:0, acquiredTransactions:2, disposedTransactions:0, totalAcquired:1500, totalDisposed:0}]; }
      if(tool==="news"){ const syms = input.symbols||[]; return F.news.filter(n => syms.includes(n.symbol)); }
      if(tool==="statements"){ if(ep==="key-metrics-ttm") return [{symbol:input.symbol, marketCap:7.4e9, enterpriseValueTTM:8.9e9, evToEBITDATTM:14.4, evToFreeCashFlowTTM:11.8, netDebtToEBITDATTM:2.2, currentRatioTTM:2.46, incomeQualityTTM:1.9, grahamNumberTTM:92, returnOnInvestedCapitalTTM:0.21, returnOnEquityTTM:0.32, returnOnAssetsTTM:0.11, earningsYieldTTM:0.053, freeCashFlowYieldTTM:0.10, capexToOperatingCashFlowTTM:0.13, stockBasedCompensationToRevenueTTM:0.004}]; if(ep==="metrics-ratios-ttm") return [{symbol:input.symbol, priceToEarningsRatioTTM:18.9, priceToFreeCashFlowRatioTTM:9.96, priceToSalesRatioTTM:1.37, priceToBookRatioTTM:6.0, grossProfitMarginTTM:0.294, operatingProfitMarginTTM:0.105, netProfitMarginTTM:0.073, debtToEquityRatioTTM:1.24, interestCoverageRatioTTM:11.6, dividendYieldTTM:0.0248, dividendPayoutRatioTTM:0.94}]; if(ep==="financial-scores") return [{symbol:input.symbol, altmanZScore:4.66, piotroskiScore:5}]; if(ep==="income-statement") return [{fiscalYear:"2025", reportedCurrency:"USD", revenue:5289396000, operatingIncome:580204000, netIncome:406404000, epsDiluted:10.85}]; }
      if(tool==="company"){ return [{symbol:input.symbol, companyName:"Adobe Inc.", description:"Software company.", sector:"Technology", industry:"Software", country:"US", exchange:"NASDAQ", currency:"USD", ceo:"Shantanu Narayen", fullTimeEmployees:"30000", ipoDate:"1986-08-20", website:"https://adobe.com", cik:"0000796343", price:250.23, marketCap:97389516000, beta:1.2, range:"190.12-362.71", lastDividend:0}]; }
      if(tool==="discountedCashFlow"){ return [{symbol:input.symbol, date:"2026-10-30", dcf:281.4, "Stock Price":250.23}]; }
      if(tool==="search"){ return [{symbol:"GE", companyName:"GE Aerospace", marketCap:3.1e11, sector:"Industrials", industry:"Aerospace & Defense", beta:1.37, price:301.8, exchangeShortName:"NYSE", country:"US"}]; }
      if(tool==="secFilings"){ return [{symbol:input.symbol, formType:"10-Q", filingDate:"2026-09-18 00:00:00", link:"https://www.sec.gov/x", finalLink:"https://www.sec.gov/y"}]; }
      if(tool==="analyst"){ return [{targetHigh:400, targetLow:250, targetConsensus:330, targetMedian:335}]; }
    }
    throw Object.assign(new Error("unknown tool "+tool), {code:"tool_error", server});
  }
  const mcp = Object.freeze({
    async callTool(server, tool, input){ await new Promise(r=>setTimeout(r, 30)); return res(route(server, tool, input)); },
    watchTool(server, tool, input, handler){ setTimeout(() => { try{ handler({type:"data", result:res(route(server, tool, input))}); }catch(e){ handler({type:"error", error:{code:e.code||"upstream_error", message:e.message, server}}); } }, 50); return () => {}; },
    async invalidate(){},
    async listTools(){ return {servers:[{server:IB, authStatus:"connected", tools:[]},{server:FMP, authStatus:"connected", tools:[]}]}; },
    async describeTool(){ throw {code:"bad_request"}; },
    async server(){ throw {code:"bad_request"}; }
  });
  async function sample(input, opts={}){
    const toolsUsed = [];
    if(opts.tools){
      const find = n => opts.tools.find(t=>t.name===n);
      for(const [name, arg] of [["mi_cartera", {}], ["noticias", {symbols:["ADBE"]}], ["metricas_valor", {symbols:["ADBE"]}], ["perfil_empresa", {symbol:"ADBE"}]]){
        const t = find(name); if(!t) continue;
        const r = await t.execute(arg, {signal: opts.signal || new AbortController().signal});
        toolsUsed.push({name, size: JSON.stringify(r).length, sample: JSON.stringify(r).slice(0,160)});
      }
    }
    window.__toolsUsed = toolsUsed;
    const text = "## Adobe (ADBE)\\n\\nResumen de prueba con **Markdown**.\\n\\n| Métrica | Valor |\\n|---|---|\\n| P/E | 18,9 |\\n| FCF yield | 10,0 % |\\n\\n- Noticias: " + toolsUsed.length + " herramientas ejecutadas.\\n\\nFuentes: FMP, IB (prueba).";
    await new Promise(r=>setTimeout(r, 40));
    if(opts.onText) opts.onText({text, delta:text});
    return {text, truncated:false, modelTierApplied: opts.modelTier || "default"};
  }
  sample.json = async (input, opts) => [{i:0, titulo:"Adobe amplía funciones de IA", resumen:"Nuevas funciones generativas y guía anual reiterada."}];
  sample.limits = async () => ({maxPromptBytes:262144, tools:{maxCount:16}, modelTiers:["default","complex","quick"]});
  window.claude = { use: async (name) => name==="mcp" ? mcp : name==="sample" ? sample : null };
})();`;

const browser = await chromium.launch();
const problems = [];
async function run(label, { viewport, colorScheme, isMobile }) {
  const ctx = await browser.newContext({ viewport, colorScheme, isMobile, hasTouch: isMobile, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", e => errors.push("pageerror: " + e.message));
  await page.route(/cdnjs\.cloudflare\.com/, r => { const f = r.request().url().includes("marked") ? "marked.min.js" : "purify.min.js"; const p = vendorDir && path.join(vendorDir, f); if (p && fs.existsSync(p)) r.fulfill({ path: p, contentType: "application/javascript" }); else r.abort(); });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.addInitScript(initScript);
  await page.goto("file://" + pagePath);
  await page.waitForSelector("#pos-list .row", { timeout: 8000 }).catch(() => problems.push(`${label}: no se renderizaron filas de posiciones`));
  await page.waitForTimeout(300);
  const nav = await page.textContent("#h-nav");
  const rows = await page.$$eval("#pos-list .row", r => r.length);
  const tape = await page.$$eval("#tape .t", t => t.map(x => x.textContent.trim()).slice(0, 2));
  const kpis = await page.$$eval("#kpis .kpi .v", v => v.map(x => x.textContent.trim()));
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth || document.getElementById("main").scrollWidth > document.getElementById("main").clientWidth);
  if (overflow) problems.push(`${label}: desborde horizontal`);
  if (!/\d/.test(nav)) problems.push(`${label}: valor neto vacío`);
  if (rows < 4) problems.push(`${label}: solo ${rows} filas`);
  if (kpis.some(k => k === "" || k === "—")) problems.push(`${label}: KPI vacío ${JSON.stringify(kpis)}`);
  await page.screenshot({ path: path.join(outDir, `${label}-cartera.png`), fullPage: false });
  await page.screenshot({ path: path.join(outDir, `${label}-cartera-full.png`), fullPage: true });
  await page.evaluate(() => document.getElementById("pos-list").scrollIntoView({block:"start"}));
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(outDir, `${label}-posiciones.png`) });
  // detalle de posición
  await page.click("#pos-list .row");
  await page.waitForSelector("#sheet-pos:not([hidden]) #pos-chart-foot b", { timeout: 4000 }).catch(() => problems.push(`${label}: el gráfico de la posición no cargó`));
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(outDir, `${label}-detalle.png`) });
  await page.click("#sheet-pos-close");
  // chat
  await page.click('nav.tabs button[data-tab="chat"]');
  await page.click('#suggest button:nth-child(4)');
  await page.waitForSelector(".msg.bot .md table", { timeout: 8000 }).catch(() => problems.push(`${label}: el chat no renderizó la respuesta`));
  await page.waitForTimeout(200);
  const marks = await page.$$eval(".src span", s => s.map(x => x.className + ":" + x.textContent));
  const toolsUsed = await page.evaluate(() => window.__toolsUsed);
  if (!marks.length || marks.some(m => m.startsWith("ko"))) problems.push(`${label}: herramientas del chat con error ${JSON.stringify(marks)}`);
  await page.screenshot({ path: path.join(outDir, `${label}-chat.png`) });
  // insiders
  await page.click('nav.tabs button[data-tab="insiders"]');
  await page.waitForSelector("#ins-mine .item", { timeout: 5000 }).catch(() => problems.push(`${label}: insiders no cargó`));
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(outDir, `${label}-insiders.png`) });
  // noticias
  await page.click('nav.tabs button[data-tab="noticias"]');
  await page.waitForSelector("#news-list .item", { timeout: 5000 }).catch(() => problems.push(`${label}: noticias no cargó`));
  await page.click("#btn-news-es");
  await page.waitForSelector("#news-list .es", { timeout: 5000 }).catch(() => problems.push(`${label}: traducción no apareció`));
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(outDir, `${label}-noticias.png`) });
  const calls = await page.evaluate(() => window.__calls.map(c => c.server + "/" + c.tool + (c.input && c.input.endpoint ? ":" + c.input.endpoint : "")));
  console.log(`\n[${label}] valor neto: ${nav} | filas: ${rows} | KPIs: ${kpis.join(" · ")} | cinta: ${tape.join(" | ")}`);
  console.log(`[${label}] chat tools: ${JSON.stringify(toolsUsed?.map(t => t.name + "(" + t.size + "b)"))} marcas: ${JSON.stringify(marks)}`);
  console.log(`[${label}] llamadas a conectores: ${Array.from(new Set(calls)).join(", ")}`);
  if (errors.length) { problems.push(`${label}: errores de consola: ${errors.join(" || ")}`); }
  await ctx.close();
}
await run("movil-oscuro", { viewport: { width: 390, height: 844 }, colorScheme: "dark", isMobile: true });
await run("escritorio-claro", { viewport: { width: 1280, height: 900 }, colorScheme: "light", isMobile: false });
await browser.close();
console.log("\n" + (problems.length ? "PROBLEMAS:\n- " + problems.join("\n- ") : "OK: sin problemas detectados"));
process.exit(problems.length ? 1 : 0);
