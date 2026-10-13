#!/usr/bin/env python3
"""Génère le site statique « Joue comme eux » dans le dossier docs/.

Usage : python3 build.py
- Articles : content/posts/AAAA-MM-JJ-slug.md (front matter YAML)
- Pages    : content/pages/slug.md
- Un article avec `draft: true` ou une date future n'est pas publié.
- Lien affilié : [[amazon: mots-clés de recherche | Texte du bouton]]
- Fiche produit : [[produit: Nom du modèle | recherche Amazon exacte | Pourquoi ce choix]]
"""
import datetime as dt
import html
import json
import math
import re
import shutil
import urllib.parse
from pathlib import Path
from zoneinfo import ZoneInfo

import markdown
import yaml

ROOT = Path(__file__).parent
OUT = ROOT / "docs"
SITE = json.loads((ROOT / "site.json").read_text(encoding="utf-8"))
BASE = SITE["base_path"].rstrip("/")
TODAY = dt.datetime.now(ZoneInfo("Europe/Paris")).date()

MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet",
        "août", "septembre", "octobre", "novembre", "décembre"]


def date_fr(d: dt.date) -> str:
    return f"{d.day} {MOIS[d.month - 1]} {d.year}"


def url(path: str) -> str:
    return f"{BASE}/{path.lstrip('/')}"


def abs_url(path: str) -> str:
    return SITE["url"].rstrip("/") + url(path)


def esc(s) -> str:
    return html.escape(str(s), quote=True)


def read_md(path: Path):
    text = path.read_text(encoding="utf-8")
    m = re.match(r"^---\n(.*?)\n---\n(.*)$", text, re.S)
    if not m:
        raise SystemExit(f"Front matter manquant : {path}")
    return yaml.safe_load(m.group(1)) or {}, m.group(2)


AFF_RE = re.compile(r"\[\[amazon:\s*(.+?)\s*\|\s*(.+?)\s*\]\]")


def amazon_link(query: str, label: str) -> str:
    href = amazon_href(query)
    return (f'<p class="aff"><a class="aff-btn" href="{esc(href)}" '
            f'rel="sponsored nofollow noopener" target="_blank">{esc(label)}'
            f'<span class="aff-tag"> (lien affilié, nouvel onglet)</span></a></p>')


PROD_RE = re.compile(r"\[\[produit:\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\]\]")


def amazon_href(query: str) -> str:
    if query.startswith("https://www.amazon.fr/"):
        m = re.search(r"/dp/([A-Z0-9]{10})", query)
        base = f"https://www.amazon.fr/dp/{m.group(1)}" if m else query.split("?")[0]
        return base + (f"?tag={SITE['amazon_tag']}" if SITE.get("amazon_tag") else "")
    params = {"k": query}
    if SITE.get("amazon_tag"):
        params["tag"] = SITE["amazon_tag"]
    return "https://www.amazon.fr/s?" + urllib.parse.urlencode(params)


def product_card(name: str, query: str, why: str) -> str:
    return (f'<div class="prod"><p class="prod-name">{esc(name)}</p>'
            f'<p class="prod-why">{esc(why)}</p>'
            f'<p class="aff"><a class="aff-btn" href="{esc(amazon_href(query))}" '
            f'rel="sponsored nofollow noopener" target="_blank">Voir le prix sur Amazon'
            f'<span class="aff-tag"> (lien affilié, nouvel onglet)</span></a></p></div>')


def render_md(body: str) -> str:
    body = PROD_RE.sub(lambda m: "\n\n" + product_card(m.group(1), m.group(2), m.group(3)) + "\n\n", body)
    body = AFF_RE.sub(lambda m: "\n\n" + amazon_link(m.group(1), m.group(2)) + "\n\n", body)
    return markdown.markdown(body, extensions=["extra", "sane_lists", "toc"],
                             extension_configs={"toc": {"permalink": False}})


CSS_VERSION = "2"


def page(title, description, path, content, *, kind="website", extra_head=""):
    full_title = title if title == SITE["title"] else f"{title} | {SITE['title']}"
    return f"""<!doctype html>
<html lang="{SITE['lang']}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(full_title)}</title>
<meta name="description" content="{esc(description)}">
<link rel="canonical" href="{esc(abs_url(path))}">
<meta property="og:type" content="{kind}">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(description)}">
<meta property="og:url" content="{esc(abs_url(path))}">
<meta property="og:site_name" content="{esc(SITE['title'])}">
<meta property="og:locale" content="fr_FR">
<meta name="theme-color" content="#0e3b2e">
<link rel="icon" href="{url('favicon.svg')}" type="image/svg+xml">
<link rel="alternate" type="application/rss+xml" title="{esc(SITE['title'])}" href="{url('feed.xml')}">
<link rel="stylesheet" href="{url('style.css')}?v={CSS_VERSION}">
{extra_head}
</head>
<body>
<a class="skip" href="#contenu">Aller au contenu</a>
<header class="top">
  <div class="wrap top-in">
    <a class="brand" href="{url('')}" aria-label="{esc(SITE['title'])}, accueil">
      <span class="brand-mark" aria-hidden="true"></span>
      <span class="brand-name">Joue comme <em>eux</em></span>
    </a>
    <nav aria-label="Navigation principale">
      <ul>
        <li><a href="{url('')}">Guides</a></li>
        <li><a href="{url('a-propos/')}">À propos</a></li>
      </ul>
    </nav>
  </div>
</header>
<main id="contenu">
{content}
</main>
<footer class="foot">
  <div class="wrap">
    <p class="foot-brand">{esc(SITE['title'])} — {esc(SITE['tagline'])}.</p>
    <p class="foot-note">En tant que Partenaire Amazon, je réalise un bénéfice sur les achats remplissant les conditions requises. Les liens marqués « lien affilié » peuvent me rapporter une commission, sans coût supplémentaire pour vous.</p>
    <nav aria-label="Informations légales">
      <ul>
        <li><a href="{url('mentions-legales/')}">Mentions légales</a></li>
        <li><a href="{url('affiliation/')}">Liens affiliés</a></li>
        <li><a href="{url('confidentialite/')}">Confidentialité</a></li>
        <li><a href="{url('feed.xml')}">Flux RSS</a></li>
      </ul>
    </nav>
  </div>
</footer>
</body>
</html>
"""


def reading_time(text: str) -> int:
    return max(1, math.ceil(len(re.findall(r"\w+", text)) / 220))


def load_posts():
    posts = []
    for p in sorted((ROOT / "content" / "posts").glob("*.md")):
        meta, body = read_md(p)
        m = re.match(r"(\d{4}-\d{2}-\d{2})-(.+)\.md$", p.name)
        if not m:
            raise SystemExit(f"Nom de fichier invalide : {p.name}")
        d = meta.get("date") or m.group(1)
        d = d if isinstance(d, dt.date) else dt.date.fromisoformat(str(d))
        if meta.get("draft") or d > TODAY:
            continue
        posts.append({
            "slug": m.group(2), "date": d, "title": meta["title"],
            "description": meta["description"],
            "categorie": meta.get("categorie", "Guide"),
            "updated": meta.get("updated"),
            "body": body,
        })
    posts.sort(key=lambda x: x["date"], reverse=True)
    return posts


def build():
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir()
    shutil.copy(ROOT / "assets" / "style.css", OUT / "style.css")
    shutil.copy(ROOT / "assets" / "favicon.svg", OUT / "favicon.svg")
    (OUT / ".nojekyll").write_text("")
    if (ROOT / "CNAME").exists():
        shutil.copy(ROOT / "CNAME", OUT / "CNAME")

    posts = load_posts()
    urls = [("", TODAY)]

    # Articles
    for i, p in enumerate(posts):
        path = f"articles/{p['slug']}/"
        html_body = render_md(p["body"])
        has_aff = "aff-btn" in html_body
        upd = p["updated"]
        upd_line = (f' · mis à jour le <time datetime="{upd}">{date_fr(dt.date.fromisoformat(str(upd)))}</time>'
                    if upd else "")
        disclosure = ('<aside class="disclosure" aria-label="Transparence">'
                      '<strong>Transparence :</strong> cet article contient des liens affiliés. '
                      'Si vous achetez via ces liens, je touche une petite commission, sans surcoût pour vous. '
                      f'<a href="{url("affiliation/")}">En savoir plus</a>.</aside>') if has_aff else ""
        others = [o for o in posts if o is not p][:3]
        more = ""
        if others:
            items = "".join(f'<li><a href="{url("articles/" + o["slug"] + "/")}">{esc(o["title"])}</a></li>' for o in others)
            more = f'<section class="more" aria-labelledby="more-h"><h2 id="more-h">À lire aussi</h2><ul>{items}</ul></section>'
        ld = {
            "@context": "https://schema.org", "@type": "Article",
            "headline": p["title"], "description": p["description"],
            "datePublished": p["date"].isoformat(),
            "dateModified": str(upd or p["date"].isoformat()),
            "author": {"@type": "Person", "name": SITE["author"]},
            "inLanguage": "fr-FR", "mainEntityOfPage": abs_url(path),
        }
        content = f"""<article class="wrap post">
  <p class="crumbs"><a href="{url('')}">Guides</a> <span aria-hidden="true">/</span> {esc(p['categorie'])}</p>
  <h1>{esc(p['title'])}</h1>
  <p class="meta">Par {esc(SITE['author'])} · <time datetime="{p['date'].isoformat()}">{date_fr(p['date'])}</time>{upd_line} · {reading_time(p['body'])} min de lecture</p>
  {disclosure}
  <div class="prose">
{html_body}
  </div>
  {more}
</article>"""
        out = OUT / path
        out.mkdir(parents=True, exist_ok=True)
        extra = f'<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>'
        (out / "index.html").write_text(page(p["title"], p["description"], path, content,
                                             kind="article", extra_head=extra), encoding="utf-8")
        urls.append((path, p["date"]))

    # Accueil
    cards = []
    for i, p in enumerate(posts):
        cls = "card card-lead" if i == 0 else "card"
        cards.append(f"""<li class="{cls}">
  <p class="card-cat">{esc(p['categorie'])}</p>
  <h2 class="card-title"><a href="{url('articles/' + p['slug'] + '/')}">{esc(p['title'])}</a></h2>
  <p class="card-desc">{esc(p['description'])}</p>
  <p class="card-meta"><time datetime="{p['date'].isoformat()}">{date_fr(p['date'])}</time> · {reading_time(p['body'])} min</p>
</li>""")
    home = f"""<section class="hero">
  <div class="wrap">
    <p class="kicker">Équipement de football</p>
    <h1>Derrière chaque grand joueur, il y a les bons choix.</h1>
    <p class="lede">Crampons, ballons, protège-tibias, matériel d'entraînement : des guides clairs pour bien choisir son équipement, quel que soit son niveau.</p>
  </div>
</section>
<section class="wrap list" aria-labelledby="derniers">
  <h2 id="derniers" class="section-h">Derniers guides</h2>
  <ul class="cards">
{''.join(cards) if cards else '<li>Les premiers guides arrivent très bientôt.</li>'}
  </ul>
</section>"""
    (OUT / "index.html").write_text(page(SITE["title"], SITE["description"], "", home), encoding="utf-8")

    # Pages fixes
    for p in sorted((ROOT / "content" / "pages").glob("*.md")):
        meta, body = read_md(p)
        path = f"{p.stem}/"
        content = f"""<article class="wrap post">
  <h1>{esc(meta['title'])}</h1>
  <div class="prose">
{render_md(body)}
  </div>
</article>"""
        out = OUT / path
        out.mkdir(parents=True, exist_ok=True)
        (out / "index.html").write_text(page(meta["title"], meta["description"], path, content), encoding="utf-8")
        urls.append((path, TODAY))

    # 404
    nf = f"""<article class="wrap post"><h1>Page introuvable</h1>
<div class="prose"><p>Cette page n'existe pas ou a été déplacée. <a href="{url('')}">Retour aux guides</a>.</p></div></article>"""
    (OUT / "404.html").write_text(page("Page introuvable", "Page introuvable", "404.html", nf), encoding="utf-8")

    # Sitemap, robots, RSS
    sm = "".join(f"<url><loc>{esc(abs_url(u))}</loc><lastmod>{d.isoformat()}</lastmod></url>" for u, d in urls)
    (OUT / "sitemap.xml").write_text(
        f'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{sm}</urlset>',
        encoding="utf-8")
    (OUT / "robots.txt").write_text(f"User-agent: *\nAllow: /\nSitemap: {abs_url('sitemap.xml')}\n", encoding="utf-8")
    items = "".join(
        f"<item><title>{esc(p['title'])}</title><link>{esc(abs_url('articles/' + p['slug'] + '/'))}</link>"
        f"<guid>{esc(abs_url('articles/' + p['slug'] + '/'))}</guid>"
        f"<pubDate>{dt.datetime.combine(p['date'], dt.time(8)).strftime('%a, %d %b %Y %H:%M:%S +0000')}</pubDate>"
        f"<description>{esc(p['description'])}</description></item>" for p in posts[:20])
    (OUT / "feed.xml").write_text(
        f'<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>{esc(SITE["title"])}</title>'
        f'<link>{esc(abs_url(""))}</link><description>{esc(SITE["description"])}</description>'
        f'<language>fr-fr</language>{items}</channel></rss>', encoding="utf-8")

    print(f"OK : {len(posts)} article(s) publié(s) dans docs/")


if __name__ == "__main__":
    build()
