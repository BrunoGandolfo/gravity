# Gravity

Terminal personal de inversión publicada como artefacto en claude.ai.

- `gravity.html`: la app completa (cartera de Interactive Brokers, chat de análisis de valor sobre FMP y SEC EDGAR, insiders y noticias).
- Se publica con el tool Artifact de Claude Code declarando los conectores `Interactive Brokers (IBKR)` y `FMP` y la capacidad `sample`.
- Artefacto: https://claude.ai/artifact/RyS8j8erYSyK35brFcDAA9

## Pruebas

`test/harness.mjs` abre la página en Chromium (Playwright) con un `window.claude` simulado que responde con `test/fixtures.mjs` (datos sintéticos con la misma forma que IB y FMP), recorre las cuatro vistas, abre el detalle de una posición, ejecuta el chat con herramientas y guarda capturas.

```
node test/harness.mjs <carpeta-de-salida> [carpeta-con-marked-y-purify]
```
