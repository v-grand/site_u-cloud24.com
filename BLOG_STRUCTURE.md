# Blog Structure Guide

## Overview

The blog structure is designed to be **scalable, multi-language ready, and asset-friendly**.

## Directory Structure

```
/public/blog/
├─ README.md (this file)
│
├─ server-for-ml/                    ← Article folder
│  ├─ en.md                          ← English version
│  ├─ ru.md                          ← Russian version
│  ├─ pl.md                          ← Polish version
│  └─ images/
│     ├─ cpu-architecture.svg
│     ├─ gpu-architecture.svg
│     └─ performance-comparison.svg
│
├─ terraform-iac/                    ← Next article
│  ├─ en.md
│  ├─ ru.md
│  ├─ pl.md
│  └─ images/
│     ├─ terraform-workflow.svg
│     └─ infrastructure-diagram.svg
│
└─ monitoring-stack/                 ← Future article
   ├─ en.md
   ├─ ru.md
   ├─ pl.md
   └─ images/
      ├─ monitoring-stack.svg
      └─ alerting-flow.svg
```

## Adding a New Article

### Step 1: Create Article Folder

```bash
mkdir -p /public/blog/{article-slug}/images
```

### Step 2: Create Markdown Files

Create three files for each language:
- `en.md` - English
- `ru.md` - Russian (Русский)
- `pl.md` - Polish (Polski)

**File Template:**

```markdown
---
title: "Article Title"
description: "Short description for SEO"
keywords: "keyword1, keyword2"
author: "graweo"
date: "2026-03-22"
updated: "2026-03-22"
slug: "article-slug"
section: "Section Name"
readTime: "12 min"
---

# Article Title

Introduction paragraph...

## Section 1

Content...

## Section 2

Content...

---

## Related U-Cloud 24 Services

- **[Service Name](/services/service-slug)** - Description

**Related articles:** [Link](/article-slug) | [Link](/article-slug)
```

### Step 3: Add Images

Place images in `/images/` subfolder:
- **SVG diagrams** (preferred for lightweight, scalable graphics)
- **PNG/JPG** (for screenshots, photos)
- **Max size**: ~3MB per image

**Image Naming Convention:**
- `cpu-architecture.svg`
- `gpu-comparison.png`
- `deployment-flow.svg`

### Step 4: Update constants.ts

Add article metadata to `BLOG_ARTICLES`:

```typescript
export const BLOG_ARTICLES: BlogArticle[] = [
  // ... existing articles ...
  {
    slug: 'terraform-iac',
    title: {
      en: 'Terraform for ML Infrastructure',
      ru: 'Terraform для ML инфраструктуры',
      pl: 'Terraform do infrastruktury ML'
    },
    description: {
      en: 'Manage cloud infrastructure as code...',
      ru: 'Управляйте облачной инфраструктурой...',
      pl: 'Zarządzaj infrastrukturą chmury...'
    },
    author: 'graweo',
    section: 'Infrastructure',
    publishedDate: '2026-03-22',
    readTime: {
      en: '15 min',
      ru: '15 мин',
      pl: '15 min'
    },
  },
];
```

### Step 5: Update Editorial Calendar

Add to `EDITORIAL_CALENDAR.json` and `EDITORIAL_CALENDAR.csv`:

```json
{
  "id": 2,
  "status": "Published",
  "section": "Infrastructure",
  "title": "Terraform for ML Infrastructure",
  "urlSlug": "terraform-iac",
  "author": "graweo",
  "publishedDate": "2026-03-22",
  "articleUrl": "/blog/terraform-iac"
}
```

## Markdown Features

### Supported Syntax

**Headings:**
```markdown
# H1 Heading
## H2 Heading
### H3 Heading
```

**Formatting:**
```markdown
**Bold text**
*Italic text*
`Inline code`
```

**Code Blocks:**
```markdown
```python
code here
```
```

**Lists:**
```markdown
- Item 1
- Item 2
  - Nested item

1. Numbered item
2. Another item
```

**Tables:**
```markdown
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
```

**Links:**
```markdown
[Link text](/blog/article-slug)
[External](https://example.com)
```

**Images:**
```markdown
![Alt text](/blog/article-slug/images/image-name.svg)
```

## Internal Links

### Cross-Article Links
```markdown
[Read about Terraform](/blog/terraform-iac)
[DevOps Guide](/blog/monitoring-stack)
```

### Service Links (Important for SEO)
```markdown
- **[VPS & Cloud Servers](/services/server)**
- **[DevOps & Infrastructure](/services/devops)**
- **[Data Analytics & ML](/services/analytics)**
- **[API Integration](/services/integration)**
- **[Web App Development](/services/web)**
- **[Web Scraping](/services/scraping)**
- **[Web3 & Blockchain](/services/web3)**
```

## Article Loading Flow

1. User clicks article on Blog page
2. URL changes: `/blog/terraform-iac`
3. `BlogArticlePage.tsx` gets `articleSlug` = `terraform-iac`
4. Detects user's language: `en`, `ru`, or `pl`
5. Fetches: `/blog/terraform-iac/{language}.md`
6. Markdown is parsed to HTML
7. Images are rendered with correct path

## Language Support

### Current Languages
- 🇺🇸 **English** (en) - Primary
- 🇷🇺 **Русский** (ru) - Russian
- 🇵🇱 **Polski** (pl) - Polish

### Adding New Language

1. Create `.md` file for all articles in new language
2. Add language code to `BlogArticlePageProps` logic
3. Update constants to include translations

## Best Practices

### Content
✅ **Do:**
- Write in first person (friendly, expert tone)
- Include real examples and case studies
- Add table of contents for long articles
- Use 95%+ unique content (no plagiarism)
- Target 7000-9000 characters per article

❌ **Don't:**
- Copy content from other sources
- Use ChatGPT without proper adaptation
- Write fluff or filler content
- Forget to include service links
- Use outdated information

### Images
✅ **Do:**
- Use SVG for diagrams (lightweight)
- Compress PNG/JPG (< 500KB)
- Include alt text for accessibility
- Create consistent visual style

❌ **Don't:**
- Use low-quality screenshots
- Upload uncompressed images
- Skip alt text
- Use too many images (max 5 per article)

### SEO
✅ **Do:**
- Include keywords in title, H2s
- Write compelling meta description
- Link to related services
- Link to related articles
- Use clear heading hierarchy

❌ **Don't:**
- Keyword stuffing
- Create duplicate content
- Ignore metadata
- Write long paragraphs (max 3-4 sentences)

## File Size Guidelines

| File Type | Max Size | Notes |
|-----------|----------|-------|
| Markdown (.md) | 50KB | ~8000 characters |
| SVG image | 50KB | Scalable, lightweight |
| PNG image | 500KB | Screenshots, photos |
| JPG image | 400KB | Compressed photos |

## Publishing Checklist

Before publishing an article:

- [ ] Markdown files created (en.md, ru.md, pl.md)
- [ ] All images placed in `/images/` folder
- [ ] Images are optimized (<500KB)
- [ ] Article added to `BLOG_ARTICLES` in constants.ts
- [ ] Article added to EDITORIAL_CALENDAR.json
- [ ] Translations are accurate (not machine-translated)
- [ ] Internal links to services included
- [ ] Related articles linked
- [ ] Grammar and spelling checked
- [ ] Meta title < 70 characters
- [ ] Meta description 150-160 characters
- [ ] Build passes (`npm run build`)
- [ ] Links are working (test locally)

## Testing Articles Locally

```bash
# 1. Create files
mkdir -p /public/blog/test-article/images
echo "# Test Article" > /public/blog/test-article/en.md

# 2. Add to constants.ts

# 3. Build and test
npm run build

# 4. Navigate to article
# http://localhost:5173/blog/test-article (after npm run dev)
```

## Troubleshooting

**Article not loading?**
- Check language code (en, ru, pl)
- Verify file path: `/blog/{slug}/{language}.md`
- Check browser console for fetch errors

**Images not showing?**
- Check image path: `/blog/{slug}/images/{filename}`
- Verify image file exists
- Check image extension (.svg, .png, .jpg)

**Build failing?**
- Run `npm run build` to see errors
- Check for syntax errors in markdown
- Verify no broken links

## Performance

Articles load efficiently:
- Markdown files: ~15-20KB each
- SVG images: < 10KB each
- Total per article: ~50KB (3 languages)
- Load time: <100ms per article

## Future Enhancements

Planned improvements:
- [ ] Article search functionality
- [ ] Full-text search
- [ ] Article categories/tags
- [ ] Reading time calculation
- [ ] Table of contents generation
- [ ] Copy-to-clipboard for code blocks
- [ ] Social sharing buttons
- [ ] Article comments section
- [ ] Author bios
- [ ] Related articles (auto-generated by tags)

---

**Last Updated:** February 22, 2026
**Maintained by:** graweo
**Status:** Active - Ready for new articles
