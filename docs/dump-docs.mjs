import { chromium } from "playwright";
import fs from "node:fs/promises";

const URL = "https://api-staging.megaport.com";
const OUT = "docs.full.html";

async function autoScroll(page) {
    await page.evaluate(async () => {
        const sleep = (ms) => new Promise(r => setTimeout(r, ms));

        // Scroll down in steps to trigger lazy-load / intersection observers
        let lastHeight = 0;
        for (let i = 0; i < 80; i++) {
            window.scrollBy(0, Math.max(600, Math.floor(window.innerHeight * 0.8)));
            await sleep(250);

            const h = document.documentElement.scrollHeight;
            if (h === lastHeight) break;
            lastHeight = h;
        }

        // Scroll back up (some sites lazy-load both ways)
        for (let i = 0; i < 10; i++) {
            window.scrollBy(0, -Math.floor(window.innerHeight * 0.9));
            await sleep(150);
        }
        window.scrollTo(0, 0);
    });
}

async function expandCommonCollapsibles(page) {
    await page.evaluate(async () => {
        const sleep = (ms) => new Promise(r => setTimeout(r, ms));

        // 1) Open all <details>
        document.querySelectorAll("details:not([open])").forEach(d => d.setAttribute("open", ""));

        // 2) Click elements that look like expand/collapse toggles
        const clickables = Array.from(document.querySelectorAll(`
      button,
      [role="button"],
      summary,
      a
    `));

        const looksExpandable = (el) => {
            const t = (el.textContent || "").trim().toLowerCase();
            const ariaExpanded = el.getAttribute("aria-expanded");
            const hasAria = ariaExpanded === "false";
            const textHint =
                t === "expand" ||
                t === "expand all" ||
                t.includes("expand") ||
                t.includes("show") ||
                t.includes("view") ||
                t.includes("more") ||
                t.includes("operations") ||
                t.includes("endpoints");
            return hasAria || textHint;
        };

        // Click a few passes because expanding can reveal more expandable nodes
        for (let pass = 0; pass < 6; pass++) {
            // remove simple hidden attributes
            document.querySelectorAll("[hidden]").forEach(el => el.removeAttribute("hidden"));

            // click aria-expanded=false first
            const ariaTargets = Array.from(document.querySelectorAll('[aria-expanded="false"]'));
            for (const el of ariaTargets) {
                try { el.click(); } catch {}
                await sleep(30);
            }

            // then click text-hinted expanders
            for (const el of clickables) {
                if (!looksExpandable(el)) continue;
                // Avoid clicking external nav links
                if (el.tagName === "A" && el.getAttribute("href")) continue;
                try { el.click(); } catch {}
                await sleep(30);
            }
        }
    });
}

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({
        viewport: { width: 1400, height: 900 },
    });

    // Some doc sites load a lot of content dynamically
    await page.goto(URL, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);

    // Do a few cycles: expand -> scroll -> expand -> scroll
    for (let i = 0; i < 3; i++) {
        await expandCommonCollapsibles(page);
        await autoScroll(page);
        await page.waitForTimeout(500);
    }

    // Let any final async rendering finish
    await page.waitForTimeout(1500);

    const html = await page.content();
    await fs.writeFile(OUT, html, "utf8");
    console.log(`Saved: ${OUT} (${html.length} chars)`);

    await browser.close();
})();