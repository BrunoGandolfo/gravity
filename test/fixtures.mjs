// Datos sintéticos con la MISMA forma que devuelven los conectores reales
// (Interactive Brokers (IBKR) y FMP). Ningún valor es de una cuenta real.
const day = (i) => { const d = new Date(Date.UTC(2026, 9, 1 + i)); return d.toISOString().slice(0,10).replace(/-/g,""); };
const series = (n, start, drift) => { const nav=[], cps=[], dates=[]; let v=start; for(let i=0;i<n;i++){ v = v*(1+drift+(Math.sin(i*1.3)*0.004)); nav.push(Math.round(v*100)/100); cps.push(Math.round((v/start-1)*1e8)/1e8); dates.push(day(i)); } return {start_date:day(0), start_nav:start, cps, nav, dates, frequency:"D"}; };

export const positions = { positions: [
  {contract_id:265768, contract_description:"ADBE", position:400, market_price:250.23, market_value:100092, currency:"USD", average_price:270.0, unrealized_pnl:-7908, daily_pnl:844, asset_class:"STK"},
  {contract_id:39195389, contract_description:"POOL", position:300, market_price:205.95, market_value:61785, currency:"USD", average_price:164.4, unrealized_pnl:12465, daily_pnl:549, asset_class:"STK"},
  {contract_id:1254605, contract_description:"RMS @SBF", position:40, market_price:1293.5, market_value:51740, currency:"EUR", average_price:1316, unrealized_pnl:-900, daily_pnl:1100, asset_class:"STK"},
  {contract_id:152791428, contract_description:"700 @SEHK", position:1000, market_price:383.6, market_value:383600, currency:"HKD", average_price:487.4, unrealized_pnl:-103800, daily_pnl:6000, asset_class:"STK"},
  {contract_id:354802220, contract_description:"IB01 @LSEETF", position:1000, market_price:122.42, market_value:122420, currency:"USD", average_price:122.27, unrealized_pnl:150, daily_pnl:-20, asset_class:"STK"},
  {contract_id:541686651, contract_description:"BTC CRYPTO @ZEROHASH", position:0.5, market_price:77312.56, market_value:38656.28, currency:"USD", average_price:76667, unrealized_pnl:322.78, daily_pnl:55, asset_class:"CRYPTO"},
  {contract_id:769132269, contract_description:"ADBE Jan15'27 200 PUT @AMEX", position:4, market_price:3.97, market_value:1588, currency:"USD", average_price:5.08, unrealized_pnl:-444, daily_pnl:28, asset_class:"OPT"},
  {contract_id:868205820, contract_description:"GOOGL Sep17'27 195 PUT @AMEX", position:-3, market_price:5.14, market_value:-1542, currency:"USD", average_price:4.11, unrealized_pnl:-309, daily_pnl:-232, asset_class:"OPT"},
  {contract_id:29612189, contract_description:"SGO @SBF", position:0, market_price:67.74, market_value:0, currency:"EUR", average_price:0, unrealized_pnl:0, daily_pnl:-400, asset_class:"STK"}
]};
export const summary = {currency:"USD", net_liquidation:512340.55, equity_with_loan_value:498000.1, buying_power:1400000, gross_position_value:420000, total_cash_value:61500.4, available_funds:350000, initial_margin:140000, maintenance_margin:131000, excess_liquidity:360000, dividends:436.5, leverage:"0.82"};
export const balances = { balances: [
  {currency:"BASE", cash_balance:61500.4, settled_cash:61500.4, net_liquidation_value:512340.55, stock_market_value:430000, unrealized_pnl:-4900, realized_pnl:-250, exchange_rate:1},
  {currency:"USD", cash_balance:36700, settled_cash:36700, net_liquidation_value:360000, stock_market_value:322000, unrealized_pnl:4700, realized_pnl:0, exchange_rate:1},
  {currency:"EUR", cash_balance:9100, settled_cash:9100, net_liquidation_value:67000, stock_market_value:51740, unrealized_pnl:-900, realized_pnl:-250, exchange_rate:1.1159},
  {currency:"HKD", cash_balance:89, settled_cash:89, net_liquidation_value:383689, stock_market_value:383600, unrealized_pnl:-103800, realized_pnl:0, exchange_rate:0.1274739},
  {currency:"GBP", cash_balance:8234, settled_cash:8234, net_liquidation_value:8234, stock_market_value:0, unrealized_pnl:0, realized_pnl:0, exchange_rate:1.339}
]};
export const perf = {portfolio_measure:"TWR", currency_type:"base", accounts:{account:{base_currency:"USD", start:"20251203", end:"20261030", available_periods:["1D","7D","MTD","1M","YTD","1Y"], periods:{
  "1D": series(1, 512000, 0.0),
  "7D": series(5, 509000, 0.0012),
  "MTD": series(22, 498000, 0.0013),
  "1M": series(23, 497000, 0.0013),
  "YTD": series(210, 470000, 0.0004),
  "1Y": series(230, 465000, 0.00045)
}}}};
export const allocation = {currency:"USD", realtime:true, allocations:{
  ASSET_CLASS:{long_positions:{total:{nav:512340,weight:1},items:[{id:"EQ",name:"Equities",nav:330000,weight:0.64},{id:"FI",name:"Fixed Income",nav:122420,weight:0.24},{id:"CA",name:"Cash",nav:61500,weight:0.12}]}},
  REGION:{long_positions:{total:{nav:512340,weight:1},items:[{id:"NORTHA",name:"North America",nav:260000,weight:0.5},{id:"EUROPE",name:"Europe",nav:190000,weight:0.37},{id:"ASIA",name:"Asia",nav:62000,weight:0.13}]}},
  SECTOR:{long_positions:{total:{nav:512340,weight:1},items:[{id:"57",name:"Technology",nav:150000,weight:0.29},{id:"53",name:"Consumer Cyclicals",nav:113000,weight:0.22},{id:"62",name:"Government",nav:122420,weight:0.24},{id:"52",name:"Industrial",nav:62000,weight:0.12},{id:"CA",name:"Cash",nav:61500,weight:0.12}]}},
  COUNTRY:{long_positions:{total:{nav:512340,weight:1},items:[{id:"US",name:"United States",nav:260000,weight:0.5}]}},
  FINANCIAL_INSTRUMENT:{long_positions:{total:{nav:512340,weight:1},items:[{id:"STK",name:"Stocks",nav:330000,weight:0.64}]}}
}};
export const priceHistory = (() => { const close=[], time=[]; let v=236; for(let i=0;i<64;i++){ v = v*(1+0.0015+Math.sin(i*0.7)*0.012); close.push(Math.round(v*100)/100); time.push(new Date(Date.UTC(2026,7,1+i)).toISOString()); } return {chart_step:86400, chart_start:time[0], chart_end:time[time.length-1], source:"Last", time, close, open:close, high:close, low:close, volume:close.map(()=>1e6)}; })();

const q = (symbol, name, price, chg, lo, hi, a50, a200, cap, exchange) => ({symbol, name, price, changePercentage:chg, change:price*chg/100, volume:1000000, dayLow:price*0.99, dayHigh:price*1.01, yearHigh:hi, yearLow:lo, marketCap:cap, priceAvg50:a50, priceAvg200:a200, exchange, open:price, previousClose:price/(1+chg/100), timestamp:1793390400});
export const quotes = [
  q("ADBE","Adobe Inc.",250.23,0.85,190.12,362.71,254.37,250.44,97389516000,"NASDAQ"),
  q("POOL","Pool Corporation",205.95,0.9,152.7,278.17,174.59,202.64,7484376845,"NASDAQ"),
  q("RMS.PA","Hermès International Société en commandite par actions",1293.5,2.17,1228,2300,1380.81,1650.92,135483147066,"PAR"),
  q("0700.HK","Tencent Holdings Limited",383.6,1.59,375.2,662,427.06,476.59,3455611411739,"HKSE"),
  q("IB01.L","iShares $ Treasury Bond 0-1yr UCITS ETF",122.42,-0.02,117.99,129,121.96,120.71,20796435746,"LSE"),
  q("BTCUSD","Bitcoin USD",77312.56,0.14,57717.55,116410.06,81878.53,73101.84,1544132112661,"CRYPTO")
];
export const tape = [
  q("^GSPC","S&P 500",7560.68,-2.07,6316.91,7844.52,7698.3,7306.49,0,"INDEX"), q("^NDX","NASDAQ 100",28384.85,-3.46,22841.42,31361.37,29812.87,27912.7,0,"INDEX"),
  q("^STOXX50E","Euro STOXX 50",6126.9,-1.26,5376.81,6586.8,6279.35,6106.37,0,"INDEX"), q("^N225","Nikkei 225",63290.11,-2.12,48235.3,72831.73,65824.34,61725.63,0,"INDEX"),
  q("^HSI","Hang Seng Index",23294.42,1.46,22518,28056.1,24575.92,25346.66,0,"INDEX"), q("BTCUSD","Bitcoin USD",77312.56,0.14,57717.55,116410.06,81878.53,73101.84,1544132112661,"CRYPTO"),
  q("EURUSD","EUR/USD",1.11657,-0.13,1.11046,1.20831,1.14072,1.15634,null,"FOREX")
];
const ins = (symbol, name, role, type, ad, n, price, d, f) => ({symbol, filingDate:f, transactionDate:d, reportingCik:"0001", companyCik:"0002", transactionType:type, securitiesOwned:10000, reportingName:name, typeOfOwner:role, acquisitionOrDisposition:ad, directOrIndirect:"D", formType:"4", securitiesTransacted:n, price, securityName:"Common Stock", url:"https://www.sec.gov/Archives/edgar/data/0/0-index.htm"});
export const insidersBySymbol = {
  ADBE: [ins("ADBE","Narayen Shantanu","director, officer: CEO","S-Sale","D",5000,251.2,"2026-10-15","2026-10-17"), ins("ADBE","Balazs Lara","officer: CMO","M-Exempt","A",1308,0,"2026-10-15","2026-10-19")],
  POOL: [ins("POOL","Watwood John","officer: CEO","P-Purchase","A",1000,198.5,"2026-10-10","2026-10-12"), ins("POOL","Perez de la Mesa","director","P-Purchase","A",500,201.1,"2026-10-09","2026-10-11")]
};
export const latestInsiders = [ins("JEF","Handler Richard","director, officer: CEO","P-Purchase","A",50000,62.1,"2026-10-28","2026-10-30"), ins("OPAD","Pieper Andrew","officer","A-Award","A",84,0,"2026-10-20","2026-10-30"), ins("CAT","Umpleby James","officer: CEO","P-Purchase","A",2000,610,"2026-10-27","2026-10-29")];
export const news = [
  {symbol:"ADBE", publishedDate:"2026-10-30 14:32:02", publisher:"Example Wire", title:"Adobe expands AI features across Creative Cloud", image:"", site:"example.com", text:"The company announced new generative features and reiterated full-year guidance.", url:"https://example.com/adobe-ai"},
  {symbol:"POOL", publishedDate:"2026-10-29 11:03:21", publisher:"Example Daily", title:"Pool Corp reports steady demand for maintenance products", image:"", site:"example.com", text:"Maintenance and repair revenue offset weaker new pool construction.", url:"https://example.com/pool-q3"}
];
