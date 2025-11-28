/**
 * Save.ca Article Scraper
 *
 * Scrapes deal articles from Save.ca to extract:
 * - Product names
 * - Prices and discounts
 * - Product images
 * - Direct Amazon affiliate links
 */

const { chromium } = require('@playwright/test');

async function scrapeArticle(url) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log(`Scraping: ${url}`);
  await page.goto(url, { timeout: 60000 });
  await page.waitForTimeout(5000);

  const deals = await page.evaluate(() => {
    const results = [];
    const seenLinks = new Set();

    // Find ALL amazon affiliate links
    const amazonLinks = document.querySelectorAll('a[href*="amzlink"], a[href*="amzn.to"]');

    amazonLinks.forEach(link => {
      const linkText = link.textContent.trim().toLowerCase();
      // Skip generic/browse links
      if (linkText === 'browse more options' || linkText.includes('click here')) return;

      const affiliateUrl = link.href;
      if (seenLinks.has(affiliateUrl)) return;
      seenLinks.add(affiliateUrl);

      // Walk up to find a container with an image
      let container = link.parentElement;
      let img = null;
      for (let i = 0; i < 10 && container; i++) {
        img = container.querySelector('img[src*="image-"], img[src*="uploads"]');
        if (img) break;
        container = container.parentElement;
      }

      // Skip if no image found
      if (img === null) return;

      // Get image URL
      const imageUrl = img.src;

      // Find title - prioritize strong/bold text, then headings
      let title = '';
      if (container) {
        // First try: look for strong/bold tags (product names are usually bolded)
        const boldTags = container.querySelectorAll('strong, b');
        for (const b of boldTags) {
          const t = b.textContent.trim();
          // Good title: 5-80 chars, not a sentence, not prices/discounts
          if (t.length >= 5 && t.length <= 80) {
            if (t.match(/^\d+%/) || t.match(/^\$/) || t.match(/^Save /i)) continue;
            if (t.includes('. ') || t.includes('you') || t.includes('your')) continue;
            title = t;
            break;
          }
        }

        // Second try: headings
        if (title === '') {
          const headings = container.querySelectorAll('h2, h3, h4, h5');
          for (const h of headings) {
            const t = h.textContent.trim();
            if (t.length >= 5 && t.length <= 80 && !t.includes('. ')) {
              title = t;
              break;
            }
          }
        }
      }

      // Skip if still no good title
      if (title === '' || title.length < 5) return;
      // Skip if title is just a button label
      if (['shop now', 'buy now', 'get deal', 'view deal'].includes(title.toLowerCase())) return;

      // Get price and discount from container text
      const containerText = container ? container.textContent : '';
      const priceMatch = containerText.match(/\$(\d+(?:\.\d{2})?)/);
      const discountMatch = containerText.match(/(\d+)%\s*OFF/i);

      results.push({
        title,
        imageUrl,
        price: priceMatch ? parseFloat(priceMatch[1]) : null,
        discount: discountMatch ? parseInt(discountMatch[1]) : null,
        affiliateUrl,
      });
    });

    return results;
  });

  await browser.close();
  return deals;
}

async function getArticleLinks() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Get deal articles from save.ca
  await page.goto('https://www.save.ca/community/category/steals-deals/', { timeout: 60000 });
  await page.waitForTimeout(5000);

  const articles = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('article a.elementor-post__thumbnail__link'))
      .map(a => a.href)
      .filter(href => href.includes('/community/'));
  });

  await browser.close();
  return [...new Set(articles)]; // Dedupe
}

async function main() {
  console.log('🐧 Save.ca Deal Scraper\n');

  // Get article URLs
  console.log('Finding deal articles...');
  const articleUrls = await getArticleLinks();
  console.log(`Found ${articleUrls.length} articles\n`);

  // Scrape each article
  const allDeals = [];

  for (const url of articleUrls.slice(0, 10)) { // Scrape up to 10 articles
    try {
      const deals = await scrapeArticle(url);
      console.log(`  → ${deals.length} deals extracted\n`);
      allDeals.push(...deals);
    } catch (err) {
      console.log(`  ✗ Error: ${err.message}\n`);
    }
  }

  // Dedupe by title
  const uniqueDeals = [];
  const seen = new Set();
  for (const deal of allDeals) {
    if (!seen.has(deal.title)) {
      seen.add(deal.title);
      uniqueDeals.push(deal);
    }
  }

  console.log(`\n✓ Total unique deals: ${uniqueDeals.length}`);
  console.log('\nSample deals:');
  uniqueDeals.slice(0, 10).forEach((deal, i) => {
    console.log(`\n${i + 1}. ${deal.title}`);
    console.log(`   Price: $${deal.price || 'N/A'} | Discount: ${deal.discount || 0}% OFF`);
    console.log(`   Image: ${deal.imageUrl?.substring(0, 60)}...`);
    console.log(`   Link: ${deal.affiliateUrl}`);
  });

  // Output JSON
  const fs = require('fs');
  fs.writeFileSync('saveca-deals.json', JSON.stringify(uniqueDeals, null, 2));
  console.log('\n✓ Saved to saveca-deals.json');
}

main().catch(console.error);
