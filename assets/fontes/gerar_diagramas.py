"""Gera as imagens do README (assets/*.png) na identidade visual do portfólio.

Cada imagem é uma página HTML escrita à mão (*.html) com os logos de logos/ embutidos na cor da marca.
Os números vêm de codigo/analises/diagnostico.py.
Uso (na raiz do projeto):  python assets/fontes/gerar_diagramas.py [nome ...]
"""
import html as html_lib
import json
import re
import subprocess
import sys
from pathlib import Path

AQUI = Path(__file__).parent
CHROME = next((c for c in [r"C:\Program Files\Google\Chrome\Application\chrome.exe",
                           r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"] if Path(c).exists()), None)

# mede o conteúdo e escreve o tamanho num <pre> lido pelo --dump-dom
MEDIR = """<script>(function(){const b=document.body.getBoundingClientRect(),p=document.createElement("pre");
p.id="posicoes";p.style.display="none";p.textContent=JSON.stringify({altura:Math.ceil(b.height),largura:Math.ceil(b.width)});
document.body.appendChild(p)})();</script>"""


def chrome(*args):
    return subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", *args],
                          capture_output=True, text=True, encoding="utf-8", timeout=180)


def preparar(html):
    """Cópia para render: logos embutidos (cor da marca) e medição de altura no fim da página."""
    t = html.read_text(encoding="utf-8")

    def logo(m):
        svg = (AQUI / "logos" / f"{m.group(1)}.svg").read_text(encoding="utf-8")
        svg = svg[svg.index("<svg"):]
        if m.group(2):
            svg = svg.replace("<svg ", f'<svg fill="{m.group(2)}" ', 1)
        return f'<i class="logo">{svg}</i>'
    t = re.sub(r'<i class="logo" data-logo="(\w+)"(?: data-cor="(#[0-9A-Fa-f]{6})")?></i>', logo, t)
    t = t.replace("</body>", MEDIR + "</body>")
    tmp = html.with_name(f"_render_{html.name}")
    tmp.write_text(t, encoding="utf-8")
    return tmp


def fotografar(html, png):
    html = preparar(html)
    dom = chrome("--window-size=1900,1200", "--dump-dom", html.resolve().as_uri()).stdout
    m = re.search(r'<pre id="posicoes"[^>]*>(.*?)</pre>', dom, re.S)
    tam = json.loads(html_lib.unescape(m.group(1)))
    chrome(f"--window-size={tam['largura']},{tam['altura']}", "--force-device-scale-factor=2",
           f"--screenshot={png.resolve()}", html.resolve().as_uri())
    html.unlink()
    print(f"{png.name}: {tam['largura']}×{tam['altura']} (2x)")


if __name__ == "__main__":
    if not CHROME:
        sys.exit("Chrome ou Edge não encontrado.")
    for nome in sys.argv[1:] or ["banner", "fluxo", "triagem", "score", "telegram"]:
        fotografar(AQUI / f"{nome}.html", AQUI.parent / f"{nome}.png")
