import os
import re

for filename in os.listdir('.'):
    if filename.endswith('.html'):
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()

        # Check if the page has the breadcrumb
        if '<div class="container" style="padding-top:100px;font-size:13px;color:var(--text-mid)">' in content:
            # We want to extract the inner HTML of the breadcrumb
            match = re.search(r'(?s)<div class="container" style="padding-top:100px;font-size:13px;color:var\(--text-mid\)">\s*(.*?)\s*</div>', content)
            if match:
                inner_bc = match.group(1)
                # Remove the old breadcrumb block completely
                content = content.replace(match.group(0), '')
                
                # We need to inject it inside the hero section.
                # Find <section class="page-hero"> or <section class="about-banner-hero"> or whatever is the first section
                # actually, look for '<div class="hero-grid"></div>' or '<div class="page-hero-inner'
                
                # Let's just put it right after <section class="page-hero"> or <section class="res-hero"> or <section class="about-banner-hero">
                hero_match = re.search(r'(<section[^>]*?hero[^>]*>)(\s*)', content)
                if hero_match:
                    new_bc = f'\n<div class="container" style="position:relative; z-index:10; font-size:13px; color:rgba(255,255,255,0.7); padding-bottom:20px;">\n{inner_bc}\n</div>\n'
                    # Inject right after the <section ...> tag
                    content = content[:hero_match.end()] + new_bc + content[hero_match.end():]
                
                with open(filename, 'w', encoding='utf-8') as f:
                    f.write(content)
