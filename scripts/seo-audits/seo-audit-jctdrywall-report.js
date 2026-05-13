const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageNumber, PageBreak
} = require('docx');
const fs = require('fs');
const path = require('path');

const NAVY = '1B2A4A', ACCENT = '2563EB', GREEN = '16A34A', AMBER = 'D97706',
      RED = 'DC2626', GRAY_LIGHT = 'F8F9FA', GRAY_MID = 'E2E8F0',
      DARK_TEXT = '1E293B', LIGHT_BG = 'EFF6FF', GRAY_TEXT = '94A3B8';

const SEO = 3, GEO = 2, AEO = 2, COMBINED = SEO + GEO + AEO;
const DATE = 'April 29, 2026';
const DOMAIN = 'jctdrywall.com';

function sc(s) { return s >= 8 ? GREEN : s >= 5 ? AMBER : RED; }
function ss(s) { return s >= 8 ? 'Strong' : s >= 5 ? 'On Track' : 'Needs Work'; }

function h1(t) { return new Paragraph({ text: t, heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 200 } }); }
function h2(t) { return new Paragraph({ text: t, heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 140 } }); }
function h3(t) { return new Paragraph({ text: t, heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 100 } }); }
function body(t) { return new Paragraph({ children: [new TextRun({ text: t, size: 22, font: 'Arial', color: DARK_TEXT })], spacing: { before: 80, after: 80 } }); }
function spacer() { return new Paragraph({ children: [new TextRun('')], spacing: { before: 120, after: 0 } }); }

function cc(text, bg, tc = 'FFFFFF', sz = 22, bold = false) {
  return new TableCell({
    children: [new Paragraph({ children: [new TextRun({ text, color: tc, size: sz, bold, font: 'Arial' })], alignment: AlignmentType.CENTER, spacing: { before: 80, after: 80 } })],
    shading: { type: ShadingType.CLEAR, fill: bg }, verticalAlign: VerticalAlign.CENTER,
    margins: { top: 160, bottom: 160, left: 120, right: 120 }
  });
}
function pc(text, bg = 'FFFFFF', tc = DARK_TEXT, bold = false) {
  return new TableCell({
    children: [new Paragraph({ children: [new TextRun({ text, color: tc, size: 20, font: 'Arial', bold })], spacing: { before: 80, after: 80 } })],
    shading: { type: ShadingType.CLEAR, fill: bg }, verticalAlign: VerticalAlign.CENTER,
    margins: { top: 100, bottom: 100, left: 160, right: 120 }
  });
}
function sc2(status) {
  const bg = status === 'Good' ? GREEN : status === 'Missing' ? RED : AMBER;
  return new TableCell({
    children: [new Paragraph({ children: [new TextRun({ text: status, color: 'FFFFFF', size: 18, font: 'Arial', bold: true })], alignment: AlignmentType.CENTER, spacing: { before: 60, after: 60 } })],
    shading: { type: ShadingType.CLEAR, fill: bg }, verticalAlign: VerticalAlign.CENTER,
    margins: { top: 80, bottom: 80, left: 100, right: 100 }
  });
}

function aTable(rows) {
  const hdr = new TableRow({ children: [cc('Signal', NAVY, 'FFFFFF', 20, true), cc('Finding', NAVY, 'FFFFFF', 20, true), cc('Status', NAVY, 'FFFFFF', 20, true)], tableHeader: true });
  return new Table({
    width: { size: 9360, type: WidthType.DXA }, columnWidths: [2000, 5560, 1800],
    rows: [hdr, ...rows.map(([s, f, st], i) => new TableRow({ children: [pc(s, i%2===0?'FFFFFF':GRAY_LIGHT, DARK_TEXT, true), pc(f, i%2===0?'FFFFFF':GRAY_LIGHT), sc2(st)] }))]
  });
}

// COVER
const cover = {
  properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
  headers: { default: new Header({ children: [] }) },
  footers: { default: new Footer({ children: [] }) },
  children: [
    ...Array.from({length:12}, () => new Paragraph({ children: [new TextRun({ text: ' ', color: NAVY })], shading: { type: ShadingType.CLEAR, fill: NAVY }, spacing: { before: 0, after: 100 } })),
    new Paragraph({ children: [new TextRun({ text: DOMAIN, color: 'FFFFFF', size: 56, bold: true, font: 'Arial' })], alignment: AlignmentType.CENTER, shading: { type: ShadingType.CLEAR, fill: NAVY }, spacing: { before: 200, after: 160 } }),
    new Paragraph({ children: [new TextRun({ text: 'SEO / GEO / AEO Audit Report', color: '93C5FD', size: 36, font: 'Arial' })], alignment: AlignmentType.CENTER, shading: { type: ShadingType.CLEAR, fill: NAVY }, spacing: { before: 0, after: 120 } }),
    new Paragraph({ children: [new TextRun({ text: 'QUICK AUDIT', color: 'FFFFFF', size: 22, font: 'Arial' })], alignment: AlignmentType.CENTER, shading: { type: ShadingType.CLEAR, fill: NAVY }, spacing: { before: 0, after: 400 } }),
    new Table({
      width: { size: 7200, type: WidthType.DXA }, columnWidths: [2400, 2400, 2400],
      rows: [new TableRow({ children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'SEO', color: 'FFFFFF', size: 22, bold: true, font: 'Arial' })], alignment: AlignmentType.CENTER }), new Paragraph({ children: [new TextRun({ text: String(SEO), color: 'FFFFFF', size: 72, bold: true, font: 'Arial' })], alignment: AlignmentType.CENTER }), new Paragraph({ children: [new TextRun({ text: ss(SEO), color: 'FFFFFF', size: 18, italics: true, font: 'Arial' })], alignment: AlignmentType.CENTER })], shading: { type: ShadingType.CLEAR, fill: sc(SEO) }, margins: { top: 240, bottom: 240, left: 160, right: 160 } }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'GEO', color: 'FFFFFF', size: 22, bold: true, font: 'Arial' })], alignment: AlignmentType.CENTER }), new Paragraph({ children: [new TextRun({ text: String(GEO), color: 'FFFFFF', size: 72, bold: true, font: 'Arial' })], alignment: AlignmentType.CENTER }), new Paragraph({ children: [new TextRun({ text: ss(GEO), color: 'FFFFFF', size: 18, italics: true, font: 'Arial' })], alignment: AlignmentType.CENTER })], shading: { type: ShadingType.CLEAR, fill: sc(GEO) }, margins: { top: 240, bottom: 240, left: 160, right: 160 } }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'AEO', color: 'FFFFFF', size: 22, bold: true, font: 'Arial' })], alignment: AlignmentType.CENTER }), new Paragraph({ children: [new TextRun({ text: String(AEO), color: 'FFFFFF', size: 72, bold: true, font: 'Arial' })], alignment: AlignmentType.CENTER }), new Paragraph({ children: [new TextRun({ text: ss(AEO), color: 'FFFFFF', size: 18, italics: true, font: 'Arial' })], alignment: AlignmentType.CENTER })], shading: { type: ShadingType.CLEAR, fill: sc(AEO) }, margins: { top: 240, bottom: 240, left: 160, right: 160 } })
      ]})]
    }),
    ...Array.from({length:10}, () => new Paragraph({ children: [new TextRun({ text: ' ', color: NAVY })], shading: { type: ShadingType.CLEAR, fill: NAVY }, spacing: { before: 0, after: 100 } })),
    new Paragraph({ children: [new TextRun({ text: DATE, color: GRAY_TEXT, size: 18, font: 'Arial' })], alignment: AlignmentType.CENTER, shading: { type: ShadingType.CLEAR, fill: NAVY }, spacing: { before: 0, after: 60 } }),
    new Paragraph({ children: [new TextRun({ text: 'Claude Skill & Plugin by Alex Labat', color: GRAY_TEXT, size: 18, font: 'Arial' })], alignment: AlignmentType.CENTER, shading: { type: ShadingType.CLEAR, fill: NAVY }, spacing: { before: 0, after: 0 } }),
    new Paragraph({ children: [new PageBreak()] })
  ]
};

const hdr = new Header({ children: [new Table({ width: { size: 9360, type: WidthType.DXA }, borders: { bottom: { style: BorderStyle.SINGLE, size: 8, color: NAVY }, top: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideH: { style: BorderStyle.NONE }, insideV: { style: BorderStyle.NONE } }, rows: [new TableRow({ children: [new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: DOMAIN, size: 18, font: 'Arial', color: NAVY, bold: true })], spacing: { after: 80 } })], borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } } }), new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'SEO / GEO / AEO Audit Report', size: 18, font: 'Arial', color: NAVY })], alignment: AlignmentType.RIGHT, spacing: { after: 80 } })], borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } } })] })] })] });
const ftr = new Footer({ children: [new Table({ width: { size: 9360, type: WidthType.DXA }, borders: { top: { style: BorderStyle.SINGLE, size: 4, color: GRAY_MID }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideH: { style: BorderStyle.NONE }, insideV: { style: BorderStyle.NONE } }, rows: [new TableRow({ children: [new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Claude Skill & Plugin by Alex Labat', size: 16, font: 'Arial', color: GRAY_TEXT })], spacing: { before: 80 } })], borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } } }), new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Page ', size: 16, font: 'Arial', color: GRAY_TEXT }), new TextRun({ children: [PageNumber.CURRENT], size: 16, font: 'Arial', color: GRAY_TEXT }), new TextRun({ text: ' of ', size: 16, font: 'Arial', color: GRAY_TEXT }), new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, font: 'Arial', color: GRAY_TEXT })], alignment: AlignmentType.RIGHT, spacing: { before: 80 } })], borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } } })] })] })] });

const main = {
  properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
  headers: { default: hdr }, footers: { default: ftr },
  children: [
    // EXECUTIVE SUMMARY
    h1('Executive Summary'),
    new Table({ width: { size: 9360, type: WidthType.DXA }, rows: [new TableRow({ children: [new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'JCT Drywall has the right local SEO structure in place — a sitemap with targeted service-area pages for Clearwater, St. Pete, and Largo, crawl configuration in robots.txt, and a dedicated FAQ page. The critical problem is that 100% of the site\'s content is rendered by JavaScript. Every page — including the homepage, FAQ, and all three service pages — returns an identical bare HTML shell with no body text, no headings, no schema markup, and no contact information. To Google\'s crawler on a first pass, and to every AI engine that doesn\'t execute JavaScript (Perplexity, ChatGPT, most AI scrapers), the site is essentially blank. Fixing this one issue — moving to server-side rendering or static HTML generation — would unlock the value of all the other structural work already done.', size: 22, font: 'Arial', color: DARK_TEXT })], spacing: { before: 120, after: 120 } })], shading: { type: ShadingType.CLEAR, fill: LIGHT_BG }, margins: { top: 200, bottom: 200, left: 240, right: 240 } })] })]  }),
    spacer(),
    new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [2000, 1400, 1800, 4160], rows: [
      new TableRow({ children: [cc('Dimension', NAVY,'FFFFFF',20,true), cc('Score',NAVY,'FFFFFF',20,true), cc('Status',NAVY,'FFFFFF',20,true), cc('Key Takeaway',NAVY,'FFFFFF',20,true)], tableHeader: true }),
      new TableRow({ children: [pc('SEO',GRAY_LIGHT,DARK_TEXT,true), new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${SEO}/10`, color:'FFFFFF',size:22,bold:true,font:'Arial'})], alignment:AlignmentType.CENTER,spacing:{before:80,after:80}}),], shading:{type:ShadingType.CLEAR,fill:sc(SEO)},verticalAlign:VerticalAlign.CENTER,margins:{top:100,bottom:100,left:120,right:120}}), new TableCell({children:[new Paragraph({children:[new TextRun({text:ss(SEO),color:DARK_TEXT,size:20,font:'Arial'})],alignment:AlignmentType.CENTER,spacing:{before:80,after:80}})],shading:{type:ShadingType.CLEAR,fill:GRAY_LIGHT},verticalAlign:VerticalAlign.CENTER,margins:{top:100,bottom:100,left:120,right:120}}), pc('JS-only rendering means crawlers and AI engines see no content; duplicate titles on all pages', GRAY_LIGHT)] }),
      new TableRow({ children: [pc('GEO','FFFFFF',DARK_TEXT,true), new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${GEO}/10`, color:'FFFFFF',size:22,bold:true,font:'Arial'})], alignment:AlignmentType.CENTER,spacing:{before:80,after:80}}),], shading:{type:ShadingType.CLEAR,fill:sc(GEO)},verticalAlign:VerticalAlign.CENTER,margins:{top:100,bottom:100,left:120,right:120}}), new TableCell({children:[new Paragraph({children:[new TextRun({text:ss(GEO),color:DARK_TEXT,size:20,font:'Arial'})],alignment:AlignmentType.CENTER,spacing:{before:80,after:80}})],shading:{type:ShadingType.CLEAR,fill:'FFFFFF'},verticalAlign:VerticalAlign.CENTER,margins:{top:100,bottom:100,left:120,right:120}}), pc('No crawlable E-E-A-T content, no schema, no entity signals accessible to AI engines','FFFFFF')] }),
      new TableRow({ children: [pc('AEO',GRAY_LIGHT,DARK_TEXT,true), new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${AEO}/10`, color:'FFFFFF',size:22,bold:true,font:'Arial'})], alignment:AlignmentType.CENTER,spacing:{before:80,after:80}}),], shading:{type:ShadingType.CLEAR,fill:sc(AEO)},verticalAlign:VerticalAlign.CENTER,margins:{top:100,bottom:100,left:120,right:120}}), new TableCell({children:[new Paragraph({children:[new TextRun({text:ss(AEO),color:DARK_TEXT,size:20,font:'Arial'})],alignment:AlignmentType.CENTER,spacing:{before:80,after:80}})],shading:{type:ShadingType.CLEAR,fill:GRAY_LIGHT},verticalAlign:VerticalAlign.CENTER,margins:{top:100,bottom:100,left:120,right:120}}), pc('FAQ page exists but content is invisible to crawlers; no FAQ schema, no voice search readiness',GRAY_LIGHT)] }),
      new TableRow({ children: [pc('Combined','FFFFFF',DARK_TEXT,true), new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${COMBINED}/30`, color:'FFFFFF',size:22,bold:true,font:'Arial'})], alignment:AlignmentType.CENTER,spacing:{before:80,after:80}})], shading:{type:ShadingType.CLEAR,fill:ACCENT},verticalAlign:VerticalAlign.CENTER,margins:{top:100,bottom:100,left:120,right:120},columnSpan:3}), pc('','FFFFFF')] })
    ]}),

    // PAGES AUDITED
    h1('Pages Audited'),
    new Table({ width:{size:9360,type:WidthType.DXA}, columnWidths:[3600,2000,3760], rows:[
      new TableRow({children:[cc('URL',NAVY,'FFFFFF',20,true),cc('Page Type',NAVY,'FFFFFF',20,true),cc('Notes',NAVY,'FFFFFF',20,true)],tableHeader:true}),
      new TableRow({children:[pc('https://www.jctdrywall.com/',GRAY_LIGHT,DARK_TEXT,true),pc('Homepage',GRAY_LIGHT),pc('Bare HTML shell — no body content rendered server-side',GRAY_LIGHT)]}),
      new TableRow({children:[pc('https://www.jctdrywall.com/faq','FFFFFF'),pc('FAQ','FFFFFF'),pc('In sitemap; returns same empty shell as homepage','FFFFFF')]}),
      new TableRow({children:[pc('https://www.jctdrywall.com/drywall-repair-clearwater',GRAY_LIGHT),pc('Service Area',GRAY_LIGHT),pc('Same bare shell; no location-specific content visible to crawlers',GRAY_LIGHT)]}),
      new TableRow({children:[pc('https://www.jctdrywall.com/drywall-repair-st-petersburg','FFFFFF'),pc('Service Area','FFFFFF'),pc('Same bare shell','FFFFFF')]}),
      new TableRow({children:[pc('https://www.jctdrywall.com/drywall-repair-largo',GRAY_LIGHT),pc('Service Area',GRAY_LIGHT),pc('Same bare shell',GRAY_LIGHT)]}),
      new TableRow({children:[pc('robots.txt','FFFFFF'),pc('Config','FFFFFF'),pc('PetalBot blocked; AhrefsBot/dotbot crawl-delay 10s; sitemap declared','FFFFFF')]}),
      new TableRow({children:[pc('sitemap.xml',GRAY_LIGHT),pc('Sitemap',GRAY_LIGHT),pc('5 URLs; correct structure; all 2026-04-29 lastmod',GRAY_LIGHT)]})
    ]}),

    // SEO
    h1('SEO Analysis — Score: 3/10 (Needs Work)'),
    h2('Technical On-Page'),
    aTable([
      ['Title Tag','Same title on all 5 pages: "Drywall Contractor in Pinellas County, FL | JCT Drywall" — 54 chars, keyword present, but duplicate across every URL including the three separate service-area pages','Needs Attention'],
      ['Meta Description','Not present in static HTML on any page — may be JS-injected but invisible to crawlers that do not execute JavaScript','Missing'],
      ['H1','No H1 found in static HTML on any page — content is entirely JavaScript-rendered','Missing'],
      ['Heading Hierarchy','No headings of any level accessible in server-rendered HTML across all 5 pages','Missing'],
      ['Canonical Tag','Not found in static HTML — cannot confirm self-referencing canonicals are present','Missing'],
      ['Robots Meta','No robots meta tag found in static HTML — page appears indexable by default but cannot be confirmed','Needs Attention'],
      ['Viewport Meta','Cannot confirm from available static HTML — likely JS-injected','Needs Attention'],
      ['Image Alt Text','No images accessible in static HTML — cannot assess','Missing'],
      ['Internal Links','No body content means no internal links between pages are visible to crawlers','Missing'],
      ['Open Graph Tags','No OG tags found in static HTML — social sharing will show no title, description, or image','Missing'],
      ['JavaScript Rendering','Critical: 100% of content is client-side rendered. Server response body is empty. Google may index after JS execution, but AI engines and many crawlers will never see the content.','Missing']
    ]),
    h2('Content Quality'),
    aTable([
      ['Word Count','Zero crawlable words on any page — all content is behind JavaScript rendering','Missing'],
      ['Keyword Coverage','Cannot assess — content not accessible to crawlers or AI engines','Missing'],
      ['Content Freshness','No dates, publication signals, or freshness indicators in static HTML','Missing'],
      ['Readability','Cannot assess — no accessible content','Missing'],
      ['Service Area Targeting','The sitemap correctly creates separate URLs for Clearwater, St. Pete, and Largo — strong local intent structure that JS rendering is currently blocking','Needs Attention']
    ]),
    h2('Structured Data'),
    aTable([
      ['Schema Markup','No JSON-LD or microdata found in static HTML on any page','Missing'],
      ['LocalBusiness Schema','Missing — critical for a local contractor to declare NAP, service area, and business type','Missing'],
      ['FAQPage Schema','FAQ page exists in sitemap but no schema is accessible to crawlers','Missing'],
      ['BreadcrumbList','Not present','Missing'],
      ['robots.txt Config','Correctly blocks PetalBot (a scraper bot), sets crawl delay for AhrefsBot and dotbot — good hygiene','Good']
    ]),

    // GEO
    h1('GEO Analysis — Score: 2/10 (Needs Work)'),
    h2('E-E-A-T Assessment'),
    aTable([
      ['Named Owner / Team','No owner name, credentials, or team information found in any crawlable content','Missing'],
      ['About Page','No /about page in sitemap or discoverable via static HTML','Missing'],
      ['Contact Information','No phone number, email, or address found in static HTML — NAP data invisible to AI engines','Missing'],
      ['Testimonials / Reviews','No social proof visible in static HTML — the Shark Branding Solutions testimonial (Jonathan Tuttle) exists but is on an external site, not on jctdrywall.com itself','Missing'],
      ['Awards / Certifications','None found','Missing'],
      ['Organization Schema','No Organization or LocalBusiness schema declaring the entity — AI engines have no structured anchor for the brand','Missing']
    ]),
    h2('Content for AI Synthesis'),
    aTable([
      ['Factual Density','Zero crawlable facts — years in business, number of projects, service radius, materials used, pricing range — none accessible to AI engines','Missing'],
      ['Clear Claims','No value proposition or differentiator visible in static HTML','Missing'],
      ['Source Citations','Not applicable — no content accessible','Missing'],
      ['Entity Clarity','Business name "JCT Drywall" appears in the title tag only — no description, no location, no service details crawlable','Needs Attention'],
      ['Unique Content','Cannot assess — no content visible to crawlers or AI engines','Missing']
    ]),
    h2('Technical GEO'),
    aTable([
      ['HTTPS','Site uses HTTPS (www.jctdrywall.com) — positive trust signal','Good'],
      ['Crawlability','robots.txt allows all major bots. However, JS-only rendering effectively blocks AI crawlers that do not execute JavaScript (Perplexity, ChatGPT, Gemini crawler, etc.)','Needs Attention'],
      ['SameAs / Social Links','No social profile links found in crawlable HTML — entity graph weak','Missing'],
      ['Brand Entity Links','No sameAs declarations — AI engines cannot connect jctdrywall.com to any social or directory profiles','Missing']
    ]),

    // AEO
    h1('AEO Analysis — Score: 2/10 (Needs Work)'),
    h2('Featured Snippet Eligibility'),
    aTable([
      ['Direct Answer Paragraphs','No crawlable paragraphs of any kind','Missing'],
      ['Definition Patterns','No "JCT Drywall is..." definitional sentence accessible','Missing'],
      ['List Content','No bulleted or numbered lists in static HTML','Missing'],
      ['Comparison Tables','None accessible','Missing'],
      ['Question-Phrased Headings','None — no headings of any kind in static HTML','Missing']
    ]),
    h2('Structured Answer Formats'),
    aTable([
      ['FAQ Schema','FAQ page exists at /faq but zero FAQ schema is present in accessible HTML — the page content is invisible to search and AI engines','Missing'],
      ['HowTo Schema','Not present','Missing'],
      ['Speakable Schema','Not present','Missing'],
      ['FAQ Content Quality','Cannot assess — content not accessible; but the existence of the /faq URL is a positive signal once rendering is fixed','Needs Attention']
    ]),
    h2('Voice Search Readiness'),
    aTable([
      ['Local NAP Signals','No Name/Address/Phone data in crawlable HTML — voice responses for "drywall repair near me" cannot be populated from this site','Missing'],
      ['Conversational Language','Cannot assess — no content accessible','Missing'],
      ['Long-Tail Question Coverage','The /faq page suggests intent to cover questions but content is not accessible','Needs Attention'],
      ['LocalBusiness Schema for Voice','Not present — voice assistants rely heavily on LocalBusiness schema to identify and recommend local contractors','Missing']
    ]),

    // PRIORITY RECOMMENDATIONS
    h1('Priority Recommendations'),
    new Table({ width:{size:9360,type:WidthType.DXA}, columnWidths:[1400,3000,1400,1200,2360], rows:[
      new TableRow({children:[cc('Priority',NAVY,'FFFFFF',20,true),cc('Issue',NAVY,'FFFFFF',20,true),cc('Dimension',NAVY,'FFFFFF',20,true),cc('Effort',NAVY,'FFFFFF',20,true),cc('Impact',NAVY,'FFFFFF',20,true)],tableHeader:true}),
      new TableRow({children:[cc('🔴 Critical',RED,'FFFFFF',18,true),pc('Fix JavaScript rendering — implement server-side rendering (SSR) or static site generation so all page content is present in the HTML response before JavaScript executes. This is the single change that unblocks everything else.'),pc('SEO / GEO / AEO'),pc('High (dev work)'),pc('Critical — without this, no other optimization will be seen by crawlers or AI engines')]}),
      new TableRow({children:[cc('🔴 Critical',RED,'FFFFFF',18,true),pc('Add LocalBusiness schema with full NAP — business name, phone, address, service area (Clearwater, St. Pete, Largo, Pinellas County), business type (DrywallContractor), and URL. This is the single highest-value schema for a local contractor.',GRAY_LIGHT),pc('GEO / AEO',GRAY_LIGHT),pc('Medium (2 hrs)',GRAY_LIGHT),pc('Critical — required for local search, Google Maps signals, and AI recommendation engines',GRAY_LIGHT)]}),
      new TableRow({children:[cc('🟠 High','EA580C','FFFFFF',18,true),pc('Give each service-area page a unique title and H1 — e.g. "Drywall Repair in Clearwater, FL | JCT Drywall" instead of the same generic title on all pages. Each page should target its specific city.'),pc('SEO'),pc('Low (30 min)'),pc('High — required for local pack rankings in each target city')]}),
      new TableRow({children:[cc('🟠 High','EA580C','FFFFFF',18,true),pc('Add meta descriptions to all pages — unique, 150-160 chars, containing city name and primary service. Currently absent from all static HTML.',GRAY_LIGHT),pc('SEO',GRAY_LIGHT),pc('Low (30 min)',GRAY_LIGHT),pc('High — meta descriptions are the primary click signal in search results',GRAY_LIGHT)]}),
      new TableRow({children:[cc('🟠 High','EA580C','FFFFFF',18,true),pc('Add FAQPage schema to /faq — once JS rendering is fixed, mark up FAQ questions and answers with FAQPage JSON-LD. Given the FAQ page already exists in the sitemap, this is a clear quick win for featured snippets and People Also Ask.'),pc('AEO'),pc('Medium (1 hr)'),pc('High — direct path to rich results for drywall repair questions')]}),
      new TableRow({children:[cc('🟡 Medium',AMBER,'FFFFFF',18,true),pc('Build an About page with owner name, years in business, license number (if applicable), and service area. Add Person or employee schema. This is the key E-E-A-T gap — AI engines have no basis to identify who runs the business.',GRAY_LIGHT),pc('GEO',GRAY_LIGHT),pc('Medium (half day)',GRAY_LIGHT),pc('High long-term — trust signals for AI recommendations and local search authority',GRAY_LIGHT)]}),
      new TableRow({children:[cc('🟡 Medium',AMBER,'FFFFFF',18,true),pc('Add Open Graph tags (og:title, og:description, og:image) to all pages — currently absent. Required for social sharing and some AI engine crawlers that rely on OG data for content signals.'),pc('SEO'),pc('Low (30 min)'),pc('Medium — enables social sharing and improves AI crawler signal quality')]}),
      new TableRow({children:[cc('🟢 Quick Win',GREEN,'FFFFFF',18,true),pc('Add visible phone number and contact info to each service-area page in static HTML — not just a JS-loaded contact form. Even a plain tel: link in the footer HTML gives crawlers and AI engines the NAP data they need.',GRAY_LIGHT),pc('GEO / AEO',GRAY_LIGHT),pc('Low (15 min)',GRAY_LIGHT),pc('Medium-High — NAP in static HTML is a basic local SEO requirement',GRAY_LIGHT)]})
    ]}),

    // WHAT'S WORKING
    h1("What's Working Well"),
    new Table({ width:{size:9360,type:WidthType.DXA}, rows:[new TableRow({children:[new TableCell({children:[
      new Paragraph({children:[new TextRun({text:'Well-structured sitemap with local intent targeting',size:22,bold:true,font:'Arial',color:DARK_TEXT})],spacing:{before:100,after:60}}),
      new Paragraph({children:[new TextRun({text:'The sitemap correctly creates separate URLs for three service cities (Clearwater, St. Pete, Largo) with appropriate priority values (0.9) — exactly the right structure for local SEO. Once JS rendering is fixed, these pages are set up to rank in each city individually.',size:20,font:'Arial',color:DARK_TEXT})],spacing:{before:0,after:140}}),
      new Paragraph({children:[new TextRun({text:'robots.txt is correctly configured',size:22,bold:true,font:'Arial',color:DARK_TEXT})],spacing:{before:100,after:60}}),
      new Paragraph({children:[new TextRun({text:'PetalBot is blocked (a content scraper with no SEO value), crawl delays are set for resource-intensive bots, and the sitemap URL is declared. This shows deliberate technical SEO thinking.',size:20,font:'Arial',color:DARK_TEXT})],spacing:{before:0,after:140}}),
      new Paragraph({children:[new TextRun({text:'HTTPS enabled',size:22,bold:true,font:'Arial',color:DARK_TEXT})],spacing:{before:100,after:60}}),
      new Paragraph({children:[new TextRun({text:'The site serves over HTTPS — a baseline trust signal for both Google and AI engines.',size:20,font:'Arial',color:DARK_TEXT})],spacing:{before:0,after:140}}),
      new Paragraph({children:[new TextRun({text:'FAQ page exists in the sitemap',size:22,bold:true,font:'Arial',color:DARK_TEXT})],spacing:{before:100,after:60}}),
      new Paragraph({children:[new TextRun({text:'A dedicated /faq page with 0.8 priority is already mapped in the sitemap. Once content is crawlable and FAQPage schema is added, this page is positioned to win featured snippets and People Also Ask placements for drywall repair questions in the Tampa Bay area.',size:20,font:'Arial',color:DARK_TEXT})],spacing:{before:0,after:100}})
    ],shading:{type:ShadingType.CLEAR,fill:'F0FDF4'},margins:{top:200,bottom:200,left:240,right:240}})]})]})
  ]
};

const doc = new Document({ creator:'Claude Skill', title:`SEO/GEO/AEO Audit — ${DOMAIN}`, sections:[cover, main] });
const out = path.join(
  __dirname,
  '..',
  '..',
  'reports',
  'seo-audits',
  'seo-audit-jctdrywall-2026-04-29.docx'
);
Packer.toBuffer(doc).then(b => { fs.writeFileSync(out, b); console.log('DOCX written:', out); }).catch(e => { console.error(e.message); process.exit(1); });
