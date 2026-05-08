const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageNumber, PageBreak, ExternalHyperlink
} = require('docx');
const fs = require('fs');
const path = require('path');

const NAVY = '1B2A4A';
const ACCENT = '2563EB';
const GREEN = '16A34A';
const AMBER = 'D97706';
const RED = 'DC2626';
const GRAY_LIGHT = 'F8F9FA';
const GRAY_MID = 'E2E8F0';
const DARK_TEXT = '1E293B';
const LIGHT_BG = 'EFF6FF';
const GRAY_TEXT = '94A3B8';

function scoreColor(score) {
  if (score >= 8) return GREEN;
  if (score >= 5) return AMBER;
  return RED;
}
function scoreStatus(score) {
  if (score >= 8) return 'Strong';
  if (score >= 5) return 'On Track';
  return 'Needs Work';
}

function h1(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 200 },
    run: { color: DARK_TEXT, size: 48, bold: true, font: 'Arial' }
  });
}
function h2(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 140 },
    run: { color: DARK_TEXT, size: 36, bold: true, font: 'Arial' }
  });
}
function h3(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 100 },
    run: { color: DARK_TEXT, size: 28, bold: true, font: 'Arial' }
  });
}
function body(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({ text, size: 22, font: 'Arial', color: DARK_TEXT, ...opts })],
    spacing: { before: 80, after: 80 }
  });
}
function spacer(n = 120) {
  return new Paragraph({ children: [new TextRun({ text: '' })], spacing: { before: n, after: 0 } });
}

function colorCell(text, bg, textColor = 'FFFFFF', size = 22, bold = false) {
  return new TableCell({
    children: [new Paragraph({
      children: [new TextRun({ text, color: textColor, size, bold, font: 'Arial' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 80, after: 80 }
    })],
    shading: { type: ShadingType.CLEAR, fill: bg },
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 160, bottom: 160, left: 120, right: 120 }
  });
}

function plainCell(text, bg = 'FFFFFF', textColor = DARK_TEXT, bold = false, colSpan) {
  const cell = new TableCell({
    children: [new Paragraph({
      children: [new TextRun({ text, color: textColor, size: 20, font: 'Arial', bold })],
      spacing: { before: 80, after: 80 }
    })],
    shading: { type: ShadingType.CLEAR, fill: bg },
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 100, bottom: 100, left: 160, right: 120 }
  });
  if (colSpan) cell.columnSpan = colSpan;
  return cell;
}

function statusCell(status) {
  const bg = status === 'Good' ? GREEN : status === 'Missing' ? RED : AMBER;
  return new TableCell({
    children: [new Paragraph({
      children: [new TextRun({ text: status, color: 'FFFFFF', size: 18, font: 'Arial', bold: true })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 60, after: 60 }
    })],
    shading: { type: ShadingType.CLEAR, fill: bg },
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 80, bottom: 80, left: 100, right: 100 }
  });
}

function analysisTable(rows) {
  const header = new TableRow({
    children: [
      colorCell('Signal', NAVY, 'FFFFFF', 20, true),
      colorCell('Finding', NAVY, 'FFFFFF', 20, true),
      colorCell('Status', NAVY, 'FFFFFF', 20, true)
    ],
    tableHeader: true
  });
  const dataRows = rows.map(([signal, finding, status], i) => new TableRow({
    children: [
      plainCell(signal, i % 2 === 0 ? 'FFFFFF' : GRAY_LIGHT, DARK_TEXT, true),
      plainCell(finding, i % 2 === 0 ? 'FFFFFF' : GRAY_LIGHT),
      statusCell(status)
    ]
  }));
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [2000, 5560, 1800],
    rows: [header, ...dataRows]
  });
}

function prioCellColor(prio) {
  if (prio.includes('Critical')) return RED;
  if (prio.includes('High')) return 'EA580C';
  if (prio.includes('Medium')) return AMBER;
  return GREEN;
}

// ─── SCORES ───────────────────────────────────────────────────────────────────
const SEO = 6, GEO = 8, AEO = 7;
const COMBINED = SEO + GEO + AEO;
const DATE = 'April 29, 2026';
const DOMAIN = 'sharkbrandingsolutions.com/shark-ai-solutions';

// ─── COVER PAGE ───────────────────────────────────────────────────────────────
const coverSection = {
  properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
  headers: { default: new Header({ children: [] }) },
  footers: { default: new Footer({ children: [] }) },
  children: [
    new Paragraph({
      children: [new TextRun({ text: '', size: 22 })],
      shading: { type: ShadingType.CLEAR, fill: NAVY },
      spacing: { before: 0, after: 0 }
    }),
    ...Array.from({ length: 9 }, () => new Paragraph({
      children: [new TextRun({ text: ' ', size: 22, color: NAVY })],
      shading: { type: ShadingType.CLEAR, fill: NAVY },
      spacing: { before: 0, after: 120 }
    })),
    new Paragraph({
      children: [new TextRun({ text: DOMAIN, color: 'FFFFFF', size: 56, bold: true, font: 'Arial' })],
      alignment: AlignmentType.CENTER,
      shading: { type: ShadingType.CLEAR, fill: NAVY },
      spacing: { before: 200, after: 160 }
    }),
    new Paragraph({
      children: [new TextRun({ text: 'SEO / GEO / AEO Audit Report', color: '93C5FD', size: 36, font: 'Arial' })],
      alignment: AlignmentType.CENTER,
      shading: { type: ShadingType.CLEAR, fill: NAVY },
      spacing: { before: 0, after: 120 }
    }),
    new Paragraph({
      children: [new TextRun({ text: 'FULL AUDIT', color: 'FFFFFF', size: 22, font: 'Arial' })],
      alignment: AlignmentType.CENTER,
      shading: { type: ShadingType.CLEAR, fill: NAVY },
      spacing: { before: 0, after: 400 }
    }),
    new Table({
      width: { size: 7200, type: WidthType.DXA },
      columnWidths: [2400, 2400, 2400],
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({ children: [new TextRun({ text: 'SEO', color: 'FFFFFF', size: 22, bold: true, font: 'Arial' })], alignment: AlignmentType.CENTER }),
                new Paragraph({ children: [new TextRun({ text: String(SEO), color: 'FFFFFF', size: 72, bold: true, font: 'Arial' })], alignment: AlignmentType.CENTER }),
                new Paragraph({ children: [new TextRun({ text: scoreStatus(SEO), color: 'FFFFFF', size: 18, italics: true, font: 'Arial' })], alignment: AlignmentType.CENTER })
              ],
              shading: { type: ShadingType.CLEAR, fill: scoreColor(SEO) },
              margins: { top: 240, bottom: 240, left: 160, right: 160 }
            }),
            new TableCell({
              children: [
                new Paragraph({ children: [new TextRun({ text: 'GEO', color: 'FFFFFF', size: 22, bold: true, font: 'Arial' })], alignment: AlignmentType.CENTER }),
                new Paragraph({ children: [new TextRun({ text: String(GEO), color: 'FFFFFF', size: 72, bold: true, font: 'Arial' })], alignment: AlignmentType.CENTER }),
                new Paragraph({ children: [new TextRun({ text: scoreStatus(GEO), color: 'FFFFFF', size: 18, italics: true, font: 'Arial' })], alignment: AlignmentType.CENTER })
              ],
              shading: { type: ShadingType.CLEAR, fill: scoreColor(GEO) },
              margins: { top: 240, bottom: 240, left: 160, right: 160 }
            }),
            new TableCell({
              children: [
                new Paragraph({ children: [new TextRun({ text: 'AEO', color: 'FFFFFF', size: 22, bold: true, font: 'Arial' })], alignment: AlignmentType.CENTER }),
                new Paragraph({ children: [new TextRun({ text: String(AEO), color: 'FFFFFF', size: 72, bold: true, font: 'Arial' })], alignment: AlignmentType.CENTER }),
                new Paragraph({ children: [new TextRun({ text: scoreStatus(AEO), color: 'FFFFFF', size: 18, italics: true, font: 'Arial' })], alignment: AlignmentType.CENTER })
              ],
              shading: { type: ShadingType.CLEAR, fill: scoreColor(AEO) },
              margins: { top: 240, bottom: 240, left: 160, right: 160 }
            })
          ]
        })
      ]
    }),
    ...Array.from({ length: 8 }, () => new Paragraph({
      children: [new TextRun({ text: ' ', color: NAVY })],
      shading: { type: ShadingType.CLEAR, fill: NAVY },
      spacing: { before: 0, after: 120 }
    })),
    new Paragraph({
      children: [new TextRun({ text: DATE, color: GRAY_TEXT, size: 18, font: 'Arial' })],
      alignment: AlignmentType.CENTER,
      shading: { type: ShadingType.CLEAR, fill: NAVY },
      spacing: { before: 0, after: 60 }
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Audit by Shark Branding Solutions — Claude Skill & Plugin by Alex Labat', color: GRAY_TEXT, size: 18, font: 'Arial' })],
      alignment: AlignmentType.CENTER,
      shading: { type: ShadingType.CLEAR, fill: NAVY },
      spacing: { before: 0, after: 0 }
    }),
    new Paragraph({ children: [new PageBreak()] })
  ]
};

// ─── MAIN SECTION ─────────────────────────────────────────────────────────────
const pageHeader = new Header({
  children: [
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      borders: { bottom: { style: BorderStyle.SINGLE, size: 8, color: NAVY }, top: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideH: { style: BorderStyle.NONE }, insideV: { style: BorderStyle.NONE } },
      rows: [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: DOMAIN, size: 18, font: 'Arial', color: NAVY, bold: true })], spacing: { after: 80 } })], borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } } }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'SEO / GEO / AEO Audit Report', size: 18, font: 'Arial', color: NAVY })], alignment: AlignmentType.RIGHT, spacing: { after: 80 } })], borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } } })
          ]
        })
      ]
    })
  ]
});

const pageFooter = new Footer({
  children: [
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      borders: { top: { style: BorderStyle.SINGLE, size: 4, color: GRAY_MID }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideH: { style: BorderStyle.NONE }, insideV: { style: BorderStyle.NONE } },
      rows: [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Claude Skill & Plugin by Alex Labat', size: 16, font: 'Arial', color: GRAY_TEXT })], spacing: { before: 80 } })], borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } } }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Page ', size: 16, font: 'Arial', color: GRAY_TEXT }), new TextRun({ children: [PageNumber.CURRENT], size: 16, font: 'Arial', color: GRAY_TEXT }), new TextRun({ text: ' of ', size: 16, font: 'Arial', color: GRAY_TEXT }), new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, font: 'Arial', color: GRAY_TEXT })], alignment: AlignmentType.RIGHT, spacing: { before: 80 } })], borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } } })
          ]
        })
      ]
    })
  ]
});

const mainSection = {
  properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
  headers: { default: pageHeader },
  footers: { default: pageFooter },
  children: [
    // ── EXECUTIVE SUMMARY ──────────────────────────────────────────────────────
    h1('Executive Summary'),
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({ children: [new TextRun({ text: 'Shark AI Solutions is a well-structured service funnel page with genuinely strong GEO and AEO foundations — explicit pricing in schema, primary-source citations, a clean FAQPage implementation, and proprietary case study data that AI engines can cite with confidence. The single most urgent issue is that the page is an orphan: it does not appear in the sitemap, the main navigation, the mobile nav, or the footer on any other page of the site. Without those signals, crawlers have no reliable path to discover or index it. Once that is resolved, the page\'s on-page fundamentals are solid enough to rank and be cited quickly. Secondary priorities are adding HowTo schema to the 4-step process and converting several section headings into question format to compete for People Also Ask placements and voice responses.', size: 22, font: 'Arial', color: DARK_TEXT })], spacing: { before: 120, after: 120 } })
              ],
              shading: { type: ShadingType.CLEAR, fill: LIGHT_BG },
              margins: { top: 200, bottom: 200, left: 240, right: 240 }
            })
          ]
        })
      ]
    }),
    spacer(200),
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [2000, 1400, 1800, 4160],
      rows: [
        new TableRow({
          children: [
            colorCell('Dimension', NAVY, 'FFFFFF', 20, true),
            colorCell('Score', NAVY, 'FFFFFF', 20, true),
            colorCell('Status', NAVY, 'FFFFFF', 20, true),
            colorCell('Key Takeaway', NAVY, 'FFFFFF', 20, true)
          ],
          tableHeader: true
        }),
        new TableRow({
          children: [
            plainCell('SEO', GRAY_LIGHT, DARK_TEXT, true),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${SEO}/10`, color: 'FFFFFF', size: 22, bold: true, font: 'Arial' })], alignment: AlignmentType.CENTER, spacing: { before: 80, after: 80 } })], shading: { type: ShadingType.CLEAR, fill: scoreColor(SEO) }, verticalAlign: VerticalAlign.CENTER, margins: { top: 100, bottom: 100, left: 120, right: 120 } }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: scoreStatus(SEO), color: DARK_TEXT, size: 20, font: 'Arial' })], alignment: AlignmentType.CENTER, spacing: { before: 80, after: 80 } })], shading: { type: ShadingType.CLEAR, fill: GRAY_LIGHT }, verticalAlign: VerticalAlign.CENTER, margins: { top: 100, bottom: 100, left: 120, right: 120 } }),
            plainCell('Strong on-page signals but orphaned from the site — not in sitemap, nav, or footer', GRAY_LIGHT)
          ]
        }),
        new TableRow({
          children: [
            plainCell('GEO', 'FFFFFF', DARK_TEXT, true),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${GEO}/10`, color: 'FFFFFF', size: 22, bold: true, font: 'Arial' })], alignment: AlignmentType.CENTER, spacing: { before: 80, after: 80 } })], shading: { type: ShadingType.CLEAR, fill: scoreColor(GEO) }, verticalAlign: VerticalAlign.CENTER, margins: { top: 100, bottom: 100, left: 120, right: 120 } }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: scoreStatus(GEO), color: DARK_TEXT, size: 20, font: 'Arial' })], alignment: AlignmentType.CENTER, spacing: { before: 80, after: 80 } })], shading: { type: ShadingType.CLEAR, fill: 'FFFFFF' }, verticalAlign: VerticalAlign.CENTER, margins: { top: 100, bottom: 100, left: 120, right: 120 } }),
            plainCell('Primary-source citations, proprietary data, strong schema — best-in-class for a service page', 'FFFFFF')
          ]
        }),
        new TableRow({
          children: [
            plainCell('AEO', GRAY_LIGHT, DARK_TEXT, true),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${AEO}/10`, color: 'FFFFFF', size: 22, bold: true, font: 'Arial' })], alignment: AlignmentType.CENTER, spacing: { before: 80, after: 80 } })], shading: { type: ShadingType.CLEAR, fill: scoreColor(AEO) }, verticalAlign: VerticalAlign.CENTER, margins: { top: 100, bottom: 100, left: 120, right: 120 } }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: scoreStatus(AEO), color: DARK_TEXT, size: 20, font: 'Arial' })], alignment: AlignmentType.CENTER, spacing: { before: 80, after: 80 } })], shading: { type: ShadingType.CLEAR, fill: GRAY_LIGHT }, verticalAlign: VerticalAlign.CENTER, margins: { top: 100, bottom: 100, left: 120, right: 120 } }),
            plainCell('FAQ schema in place; misses HowTo schema, question H2s, and Speakable markup', GRAY_LIGHT)
          ]
        }),
        new TableRow({
          children: [
            plainCell('Combined', 'FFFFFF', DARK_TEXT, true),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${COMBINED}/30`, color: 'FFFFFF', size: 22, bold: true, font: 'Arial' })], alignment: AlignmentType.CENTER, spacing: { before: 80, after: 80 } })], shading: { type: ShadingType.CLEAR, fill: ACCENT }, verticalAlign: VerticalAlign.CENTER, margins: { top: 100, bottom: 100, left: 120, right: 120 }, columnSpan: 3 }),
            plainCell('', 'FFFFFF')
          ]
        })
      ]
    }),

    // ── PAGES AUDITED ──────────────────────────────────────────────────────────
    h1('Pages Audited'),
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [4200, 2000, 3160],
      rows: [
        new TableRow({ children: [colorCell('URL / File', NAVY, 'FFFFFF', 20, true), colorCell('Page Type', NAVY, 'FFFFFF', 20, true), colorCell('Notes', NAVY, 'FFFFFF', 20, true)], tableHeader: true }),
        new TableRow({ children: [plainCell('shark-ai-solutions.html', GRAY_LIGHT, DARK_TEXT, true), plainCell('Service Funnel', GRAY_LIGHT), plainCell('Primary audit target — orphaned from nav and sitemap', GRAY_LIGHT)] }),
        new TableRow({ children: [plainCell('about.html', 'FFFFFF'), plainCell('About / Person', 'FFFFFF'), plainCell('Michelle Stanaland credentials, testimonial, awards', 'FFFFFF')] }),
        new TableRow({ children: [plainCell('ai-visibility-consulting.html', GRAY_LIGHT), plainCell('Service Page', GRAY_LIGHT), plainCell('Strong content depth, FAQPage schema, HVAC proof', GRAY_LIGHT)] }),
        new TableRow({ children: [plainCell('contact.html', 'FFFFFF'), plainCell('Contact', 'FFFFFF'), plainCell('Full NAP, ContactPage schema, office hours in schema', 'FFFFFF')] }),
        new TableRow({ children: [plainCell('portfolio.html', GRAY_LIGHT), plainCell('Portfolio / Work', GRAY_LIGHT), plainCell('Case study links, results data, minimal schema', GRAY_LIGHT)] }),
        new TableRow({ children: [plainCell('hvac-local-seo-case-study.html', 'FFFFFF'), plainCell('Case Study', 'FFFFFF'), plainCell('Article schema, author attribution, datePublished present', 'FFFFFF')] }),
        new TableRow({ children: [plainCell('sitemap.xml', GRAY_LIGHT), plainCell('Sitemap', GRAY_LIGHT), plainCell('15 URLs — shark-ai-solutions, hvac case study, portfolio, plans, free-report MISSING', GRAY_LIGHT)] })
      ]
    }),

    // ── SEO ANALYSIS ───────────────────────────────────────────────────────────
    h1('SEO Analysis — Score: 6/10 (On Track)'),
    h2('Technical On-Page'),
    analysisTable([
      ['Title Tag', '"Shark AI Solutions | Choose the Level of Help You Need" — 52 chars, brand + keyword present, within optimal range', 'Good'],
      ['Meta Description', '160 chars — right at the limit. Contains service description and implicit CTA. Tight but functional.', 'Good'],
      ['H1', 'Single H1: "Introducing Shark AI Solutions" — present, unique, contains target entity name', 'Good'],
      ['Heading Hierarchy', 'H1 → multiple H2 section titles → H3 card headings — logical structure, no jumps', 'Good'],
      ['URL / Canonical', 'Canonical: sharkbrandingsolutions.com/shark-ai-solutions — clean, keyword-bearing, self-referencing', 'Good'],
      ['Robots / Indexability', 'No noindex tag found. Page should be indexable once discovered by crawlers.', 'Good'],
      ['Viewport Meta', 'width=device-width, initial-scale=1.0 — no user-scalable=no, mobile-safe', 'Good'],
      ['Image Alt Text', 'No <img> tags on the page body. OG image URL declared but not rendered inline.', 'Good'],
      ['Internal Links', 'Links to contact.html and hvac-local-seo-case-study.html — but NO pages link back to shark-ai-solutions from main site navigation', 'Needs Attention'],
      ['Sitemap Inclusion', 'shark-ai-solutions is NOT present in sitemap.xml — crawlers cannot discover it via sitemap', 'Missing'],
      ['Navigation Presence', 'Not present in main nav, mobile nav, or footer nav on any other site page — page is an orphan', 'Missing'],
      ['Open Graph Tags', 'og:title, og:description, og:url, og:image, og:type, og:site_name, og:locale — complete set', 'Good'],
      ['Twitter Card', 'summary_large_image, @SharkBranding — present', 'Good'],
      ['Facebook Pixel / GTM', 'NOT present on shark-ai-solutions.html (present on about, contact, ai-visibility-consulting). Analytics gap on funnel page.', 'Needs Attention']
    ]),

    h2('Content Quality'),
    analysisTable([
      ['Word Count', 'Estimated 1,400–1,600 words across all sections — substantial for a service funnel page', 'Good'],
      ['Primary Topic Clarity', '"AI visibility for local businesses" + three-tier service path — immediately clear from headline and hero panel', 'Good'],
      ['Keyword Coverage', '"AI visibility", "local businesses", "done with you", "done for you", "enterprise", "Shark AI Solutions" — consistent throughout', 'Good'],
      ['Semantic Depth', 'Covers search, maps, reviews, listings, AI-generated answers, structured data, trust signals — good topical breadth', 'Good'],
      ['Content Freshness', '"Updated April 29, 2026" badge in hero — visible freshness signal', 'Good'],
      ['Source Citations', 'OpenAI weekly active users + OpenAI usage research PDF — both linked with rel="noopener". Search Engine Land linked.', 'Good'],
      ['Pricing Transparency', 'Explicit pricing: $497/mo (12-mo), $597/mo (3-mo), $2,000/mo — rare and valuable trust signal on a service page', 'Good'],
      ['Readability', 'Card-based layout, short paragraphs, numbered steps — highly scannable. No walls of text.', 'Good'],
      ['Publication Date Markup', '"Updated April 29, 2026" is plain text. Use <time datetime="2026-04-29"> for machine-readable date signal.', 'Needs Attention']
    ]),

    h2('Structured Data'),
    analysisTable([
      ['BreadcrumbList', 'Home → Shark AI Solutions — present, correct position values', 'Good'],
      ['WebPage', 'name, url, description, dateModified — all present', 'Good'],
      ['Service Schema', 'Includes name, provider, areaServed (Tampa Bay, Wesley Chapel, St. Petersburg, Lutz, Land O\' Lakes), description, and three Offer objects with pricing', 'Good'],
      ['Offer Pricing in Schema', 'UnitPriceSpecification for $497 and $597 plans, simple price for $2,000 plan — structured pricing is excellent for AI engines', 'Good'],
      ['FAQPage Schema', '4 questions with full acceptedAnswer objects — well-formed and complete', 'Good'],
      ['Organization @id Cross-Link', 'Service schema uses "provider":{"@type":"Organization","name":"Shark Branding Solutions"} without @id reference. Misses the chance to link to the main org entity graph defined on other pages.', 'Needs Attention'],
      ['HowTo Schema', '4-step process (Diagnose / Choose / Fix / Monitor) exists in the content but has no HowTo schema markup', 'Missing'],
      ['Speakable Schema', 'No SpeakableSpecification markup — voice assistants cannot identify the best sections to read aloud', 'Missing']
    ]),

    // ── GEO ANALYSIS ───────────────────────────────────────────────────────────
    h1('GEO Analysis — Score: 8/10 (Strong)'),
    h2('E-E-A-T Assessment'),
    analysisTable([
      ['Named Author / Founder', 'Michelle Stanaland identified as founder on about.html with photo, credentials, and LinkedIn link. Not referenced by name on the shark-ai-solutions page itself.', 'Needs Attention'],
      ['About Page Quality', 'about.html: detailed bio, "Top 15 Marketing Experts in Tampa Bay — Influence Digest 2025", North Tampa Bay Chamber membership, PRWeb press mention, full testimonial from Jonathan Tuttle (drywall company, Pinellas County)', 'Good'],
      ['Contact / NAP Data', 'Phone (727) 855-6505, email info@sharkbrandingsolutions.com, address 7901 4th St N Suite 300, St. Petersburg FL 33702 — complete on contact.html and in schema', 'Good'],
      ['Testimonials / Social Proof', 'Testimonial on about.html from named client with job title and location. Case study results (#32 to #2 HVAC, North Tampa Bay Chamber, Emory\'s Rock Realty) across the site.', 'Good'],
      ['Awards / Recognition', 'Influence Digest Top 15 Tampa Bay, Executive of the Year nomination, PRWeb coverage — all on about.html with live links to sources', 'Good'],
      ['Chamber / Community', 'North Tampa Bay Chamber partner noted on shark-ai-solutions page with dedicated section offering chamber member pricing', 'Good'],
      ['Person Schema', 'about.html has Person schema: name, jobTitle, image, knowsAbout, areaServed, award, memberOf, sameAs (LinkedIn) — exemplary entity declaration', 'Good'],
      ['Organization Schema on Site', 'about.html does NOT have standalone Organization schema. contact.html has ProfessionalService inside ContactPage. No root Organization @id that other pages can reference.', 'Needs Attention']
    ]),

    h2('Content for AI Synthesis'),
    analysisTable([
      ['Factual Density', '900M+ ChatGPT weekly users, ~10% of world adult population, 2.5B+ messages/day — specific statistics with source links', 'Good'],
      ['Proprietary Data', 'HVAC: #32 to #2 in under 30 days, current #1 rankings for many keywords — unique, citable, with case study link', 'Good'],
      ['Clear Claims', 'Value proposition stated in first paragraph: "fix the gaps limiting discoverability before leads disappear"', 'Good'],
      ['Source Citation Quality', 'OpenAI.com official blog + OpenAI PDF research + Search Engine Land — authoritative primary sources', 'Good'],
      ['Comprehensiveness', 'Covers what it is, who it helps, three-tier pricing, comparison table, process steps, case study proof, FAQ, chamber note — thorough', 'Good'],
      ['Entity Clarity', '"Shark AI Solutions" and "Shark Branding Solutions" used consistently throughout with clear relationship stated', 'Good'],
      ['Competing Entity Confusion', 'The site index.html is a Keatings Communications template — if that gets indexed instead of the actual homepage, it creates significant entity confusion for AI engines crawling the site', 'Missing'],
      ['Originality Signals', 'Original case study data, original pricing structure, original service positioning — strong differentiation', 'Good']
    ]),

    h2('Technical GEO'),
    analysisTable([
      ['HTTPS', 'Canonical assumes HTTPS — secure site assumed. Positive trust signal.', 'Good'],
      ['Crawlability', 'No robots.txt found locally. Sitemap omits key pages. JavaScript-rendered nav content may be missed by some AI crawlers.', 'Needs Attention'],
      ['SameAs / Social Links', 'LinkedIn, Facebook, Instagram, YouTube in footer nav with proper aria-labels. sameAs in Person schema on about.html.', 'Good'],
      ['Structured Data Depth', 'Service + FAQPage + BreadcrumbList + WebPage on shark-ai-solutions.html — strong multi-type implementation', 'Good'],
      ['Brand Entity Completeness', 'Missing: standalone Organization schema with @id that all pages can reference. Each page declares the org slightly differently.', 'Needs Attention'],
      ['AI Crawler Accessibility', 'Nav and footer injected via JS (main.js). If an AI crawler does not execute JavaScript, it will see an empty nav. Content sections are static HTML — the important stuff is accessible.', 'Needs Attention'],
      ['Ahrefs Analytics', 'analytics.ahrefs.com script present on shark-ai-solutions.html but not present on other pages reviewed — inconsistent analytics coverage', 'Needs Attention']
    ]),

    // ── AEO ANALYSIS ───────────────────────────────────────────────────────────
    h1('AEO Analysis — Score: 7/10 (On Track)'),
    h2('Featured Snippet Eligibility'),
    analysisTable([
      ['Definition Pattern', '"Shark AI Solutions is Shark Branding Solutions\' AI visibility offer for local businesses that help local businesses improve how they appear across Google, maps, reviews, listings, and AI-generated answers." — strong definitional opening in FAQ schema and FAQ section', 'Good'],
      ['Direct Answer Paragraphs', 'FAQ answers are 30–60 words each — right length for paragraph snippets. Clean, complete answers.', 'Good'],
      ['List Content', 'Multiple <ul> lists across path feature cards, process steps, signal panels — list snippet eligible', 'Good'],
      ['Comparison Table', 'Full comparison table (Path / Best Fit / Your Workload / Outcome) — table snippet candidate for "Done With You vs Done For You" queries', 'Good'],
      ['Question-Phrased Headings', 'Zero H2/H3 headings are phrased as questions. All use label+noun format ("Three ways to fix AI visibility"). No PAA competition possible without this.', 'Missing'],
      ['Keyword-Rich H2s', 'Section headings are thematic but not search-query-shaped — "Ways to Work With Us", "How It Works" rather than "How Does Shark AI Solutions Work?" or "What Is the Best AI Visibility Service?"', 'Needs Attention']
    ]),

    h2('Structured Answer Formats'),
    analysisTable([
      ['FAQ Schema', '4 questions: What is Shark AI Solutions, Who is it for, Difference between three paths, Best first step — well-chosen and complete', 'Good'],
      ['FAQ Question Coverage', 'Missing high-volume FAQ candidates: "How much does AI visibility cost?", "What is included in the Done For You plan?", "How long does it take to see results?"', 'Needs Attention'],
      ['HowTo Schema', '4-step process (Diagnose → Choose → Fix → Monitor) has no HowTo markup. This process is a strong HowTo schema candidate that could win "how to fix AI visibility" rich results.', 'Missing'],
      ['Speakable Schema', 'No SpeakableSpecification. Voice assistants (Google Assistant, Siri, Alexa) cannot identify preferred read-aloud sections.', 'Missing'],
      ['Pricing in Schema', 'UnitPriceSpecification and plain price on Offer objects — pricing structured for machine extraction. Excellent.', 'Good']
    ]),

    h2('Voice Search Readiness'),
    analysisTable([
      ['Conversational Language', 'Copy is professional and clear but formal. Voice search prefers shorter, more conversational sentences. Headings especially benefit from natural speech phrasing.', 'Needs Attention'],
      ['Long-Tail Question Coverage', 'FAQ covers 4 questions. Misses: "how much does it cost to improve AI visibility", "what does Shark AI Solutions do", "is Shark AI Solutions worth it", "how do I get my business to show up in AI answers"', 'Needs Attention'],
      ['Local Signals in Body Copy', 'Service schema lists Tampa Bay, Wesley Chapel, St. Petersburg, Lutz, Land O\' Lakes. Body copy of shark-ai-solutions page does NOT mention geographic areas — local intent queries may not connect.', 'Needs Attention'],
      ['NAP Consistency', 'contact.html and schema are consistent: (727) 855-6505, info@sharkbrandingsolutions.com, 7901 4th St N Suite 300, St. Petersburg FL 33702', 'Good'],
      ['Local Business Schema', 'shark-ai-solutions page uses Service schema with areaServed. The broader site lacks a root LocalBusiness or ProfessionalService @id schema that consolidates the entity.', 'Needs Attention']
    ]),

    // ── PRIORITY RECOMMENDATIONS ───────────────────────────────────────────────
    h1('Priority Recommendations'),
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [1400, 3000, 1400, 1200, 2360],
      rows: [
        new TableRow({
          children: [
            colorCell('Priority', NAVY, 'FFFFFF', 20, true),
            colorCell('Issue', NAVY, 'FFFFFF', 20, true),
            colorCell('Dimension', NAVY, 'FFFFFF', 20, true),
            colorCell('Effort', NAVY, 'FFFFFF', 20, true),
            colorCell('Impact', NAVY, 'FFFFFF', 20, true)
          ],
          tableHeader: true
        }),
        new TableRow({ children: [colorCell('🔴 Critical', RED, 'FFFFFF', 18, true), plainCell('Add shark-ai-solutions to sitemap.xml — currently absent, blocking crawler discovery'), plainCell('SEO'), plainCell('Low (5 min)'), plainCell('High — makes page discoverable to Google and AI crawlers')] }),
        new TableRow({ children: [colorCell('🔴 Critical', RED, 'FFFFFF', 18, true), plainCell('Add link to shark-ai-solutions in the main nav and/or footer — currently an orphan page with zero inbound links from the rest of the site', GRAY_LIGHT), plainCell('SEO', GRAY_LIGHT), plainCell('Low (30 min)', GRAY_LIGHT), plainCell('High — page authority, internal linking, and crawl path all depend on this', GRAY_LIGHT)] }),
        new TableRow({ children: [colorCell('🟠 High', 'EA580C', 'FFFFFF', 18, true), plainCell('Add Facebook Pixel + GTM to shark-ai-solutions.html — present on other pages but missing from this funnel page, creating an analytics blind spot'), plainCell('SEO'), plainCell('Low (15 min)'), plainCell('High — you cannot optimize a funnel you cannot measure')] }),
        new TableRow({ children: [colorCell('🟠 High', 'EA580C', 'FFFFFF', 18, true), plainCell('Add HowTo schema to the 4-step process (Diagnose / Choose / Fix / Monitor) — rich result candidate for "how to fix AI visibility" and "how to improve local search" queries', GRAY_LIGHT), plainCell('AEO', GRAY_LIGHT), plainCell('Medium (1 hr)', GRAY_LIGHT), plainCell('Medium-High — direct path to rich results and voice answer eligibility', GRAY_LIGHT)] }),
        new TableRow({ children: [colorCell('🟠 High', 'EA580C', 'FFFFFF', 18, true), plainCell('Rephrase 2–3 H2 headings as questions, e.g. "How does Shark AI Solutions work?", "What is the difference between Done With You and Done For You?", "How quickly can AI visibility improve?" — current headings are not PAA-eligible'), plainCell('AEO'), plainCell('Low (20 min)'), plainCell('Medium-High — unlocks People Also Ask eligibility and featured snippet competition')] }),
        new TableRow({ children: [colorCell('🟡 Medium', AMBER, 'FFFFFF', 18, true), plainCell('Create a root Organization schema with @id (https://sharkbrandingsolutions.com/#organization) and reference it from shark-ai-solutions, ai-visibility-consulting, and other pages — currently each page declares the org differently', GRAY_LIGHT), plainCell('GEO', GRAY_LIGHT), plainCell('Medium (2 hrs)', GRAY_LIGHT), plainCell('High long-term — consolidates the entity graph for AI engines', GRAY_LIGHT)] }),
        new TableRow({ children: [colorCell('🟡 Medium', AMBER, 'FFFFFF', 18, true), plainCell('Add geographic area mentions to the shark-ai-solutions page body copy (e.g. "serving Tampa Bay, Wesley Chapel, St. Petersburg, Lutz, and Land O\' Lakes") — local areas only appear in schema, not visible body text'), plainCell('AEO / GEO'), plainCell('Low (15 min)'), plainCell('Medium — improves local intent matching and voice search results')] }),
        new TableRow({ children: [colorCell('🟡 Medium', AMBER, 'FFFFFF', 18, true), plainCell('Expand FAQ on shark-ai-solutions to include: "How much does AI visibility cost?", "What is included in Done For You?", "How quickly do results show?" — 3 high-search-volume question patterns not currently covered', GRAY_LIGHT), plainCell('AEO', GRAY_LIGHT), plainCell('Low (45 min)', GRAY_LIGHT), plainCell('Medium — increases PAA and featured snippet coverage', GRAY_LIGHT)] }),
        new TableRow({ children: [colorCell('🟡 Medium', AMBER, 'FFFFFF', 18, true), plainCell('Add <time datetime="2026-04-29"> wrapper around the "Updated April 29, 2026" badge — currently plain text, machine-unreadable as a date signal'), plainCell('SEO'), plainCell('Low (5 min)'), plainCell('Low-Medium — freshness signal for crawlers and AI engines')] }),
        new TableRow({ children: [colorCell('🟢 Quick Win', GREEN, 'FFFFFF', 18, true), plainCell('Add Michelle Stanaland\'s name and a one-sentence bio to shark-ai-solutions (e.g. in the footer or a small "Who built this?" note) — the E-E-A-T credentials are strong site-wide but absent from this specific page', GRAY_LIGHT), plainCell('GEO', GRAY_LIGHT), plainCell('Low (15 min)', GRAY_LIGHT), plainCell('Medium — connects the page to the strong personal entity established on about.html', GRAY_LIGHT)] }),
        new TableRow({ children: [colorCell('🟢 Quick Win', GREEN, 'FFFFFF', 18, true), plainCell('Resolve the index.html content: the root index.html is currently a Keatings Communications client build. If deployed as-is, it will appear as the Shark Branding Solutions homepage to crawlers, creating severe entity confusion.'), plainCell('SEO / GEO'), plainCell('Critical (verify)'), plainCell('Critical — most damaging issue across the entire site if deployed incorrectly')] })
      ]
    }),

    // ── WHAT'S WORKING WELL ────────────────────────────────────────────────────
    h1("What's Working Well"),
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({ children: [new TextRun({ text: 'Pricing transparency in schema', size: 22, bold: true, font: 'Arial', color: DARK_TEXT })], spacing: { before: 100, after: 60 } }),
                new Paragraph({ children: [new TextRun({ text: 'Explicit UnitPriceSpecification objects ($497/mo, $597/mo, $2,000/mo) inside the Service Offer schema — most service pages hide pricing from structured data entirely. This is rare and gives AI engines concrete data to cite.', size: 20, font: 'Arial', color: DARK_TEXT })], spacing: { before: 0, after: 140 } }),
                new Paragraph({ children: [new TextRun({ text: 'Primary-source citations with authority links', size: 22, bold: true, font: 'Arial', color: DARK_TEXT })], spacing: { before: 100, after: 60 } }),
                new Paragraph({ children: [new TextRun({ text: 'The OpenAI weekly active users and OpenAI usage research PDF are linked directly from the body copy with rel="noopener". Search Engine Land is also cited. These are the exact sources AI engines trust and re-cite.', size: 20, font: 'Arial', color: DARK_TEXT })], spacing: { before: 0, after: 140 } }),
                new Paragraph({ children: [new TextRun({ text: 'FAQPage schema — concise, well-chosen questions', size: 22, bold: true, font: 'Arial', color: DARK_TEXT })], spacing: { before: 100, after: 60 } }),
                new Paragraph({ children: [new TextRun({ text: '4 FAQ entries covering definitional, comparative, and next-step questions — each answer 30–60 words, correctly structured in JSON-LD. Ready for rich result extraction today.', size: 20, font: 'Arial', color: DARK_TEXT })], spacing: { before: 0, after: 140 } }),
                new Paragraph({ children: [new TextRun({ text: 'Site-wide E-E-A-T is genuinely strong', size: 22, bold: true, font: 'Arial', color: DARK_TEXT })], spacing: { before: 100, after: 60 } }),
                new Paragraph({ children: [new TextRun({ text: 'Michelle\'s about.html is one of the best-executed personal E-E-A-T pages for a local consultant: named award (Influence Digest, linked), chamber membership (linked), PRWeb press mention (linked), named testimonial with job title and location, Person schema with LinkedIn sameAs, and knowsAbout fields.', size: 20, font: 'Arial', color: DARK_TEXT })], spacing: { before: 0, after: 140 } }),
                new Paragraph({ children: [new TextRun({ text: 'Comparison table — table snippet candidate', size: 22, bold: true, font: 'Arial', color: DARK_TEXT })], spacing: { before: 100, after: 60 } }),
                new Paragraph({ children: [new TextRun({ text: 'The "Compare the Paths" table (Done With You / Done For You / Enterprise + Best Fit / Workload / Outcome) is structured HTML with thead/tbody and could win a table-format featured snippet for queries like "Done With You vs Done For You AI visibility".', size: 20, font: 'Arial', color: DARK_TEXT })], spacing: { before: 0, after: 140 } }),
                new Paragraph({ children: [new TextRun({ text: 'Proprietary case study data cited on-page', size: 22, bold: true, font: 'Arial', color: DARK_TEXT })], spacing: { before: 100, after: 60 } }),
                new Paragraph({ children: [new TextRun({ text: 'The HVAC proof section (from #32 to #2 in under 30 days) with a direct link to the full case study is the kind of original, specific, verifiable claim that AI engines prefer to cite over generic marketing copy.', size: 20, font: 'Arial', color: DARK_TEXT })], spacing: { before: 0, after: 100 } })
              ],
              shading: { type: ShadingType.CLEAR, fill: 'F0FDF4' },
              margins: { top: 200, bottom: 200, left: 240, right: 240 }
            })
          ]
        })
      ]
    }),

    // ── GLOSSARY ──────────────────────────────────────────────────────────────
    h1('Glossary'),
    h3('SEO — Search Engine Optimization'),
    body('The practice of improving a website so it ranks higher in traditional search engine results pages (Google, Bing). Covers technical structure, on-page content, internal linking, and external signals like backlinks.'),
    h3('GEO — Generative Engine Optimization'),
    body('Optimizing content to be cited, summarized, or recommended by AI-powered search engines (Google AI Overviews, Perplexity, ChatGPT Search, Gemini). GEO prioritizes factual density, entity clarity, E-E-A-T signals, and structured data that AI systems can extract and synthesize.'),
    h3('AEO — Answer Engine Optimization'),
    body('Optimizing for featured snippets, People Also Ask boxes, and voice search responses — moments where a search or AI engine delivers a direct answer rather than a list of links. AEO techniques include question-phrased headings, direct answer paragraphs, FAQ schema, HowTo schema, and Speakable markup.'),
    h3('E-E-A-T'),
    body('Experience, Expertise, Authoritativeness, and Trustworthiness — Google\'s framework for evaluating content quality and the credibility of the people and organizations behind it. Strong E-E-A-T signals include named authors with credentials, third-party recognition, citations, reviews, and transparent contact information.'),
    spacer(200)
  ]
};

const doc = new Document({
  creator: 'Claude Skill — SEO/GEO/AEO Audit',
  title: `SEO/GEO/AEO Audit — ${DOMAIN}`,
  description: 'Full SEO, GEO, and AEO audit for Shark AI Solutions',
  sections: [coverSection, mainSection]
});

const outPath = path.join(
  __dirname,
  '..',
  '..',
  'reports',
  'seo-audits',
  'seo-audit-shark-ai-solutions-2026-04-29.docx'
);
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outPath, buffer);
  console.log('DOCX written to:', outPath);
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
