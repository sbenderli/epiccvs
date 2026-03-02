# EPIC CVs

This project is a **satirical website** that imagines how famous (or infamous) historical figures might present themselves if they were writing modern résumés or LinkedIn profiles.

⚠️ **Important disclaimer**  
- These résumés are entirely fictional.  
- They are written for humor, commentary, and educational purposes.  
- They should not be taken as factual, career advice, or endorsements of the individuals depicted.  

## How it works
- Résumés are stored as Markdown files in `resumes/`.  
- A small script (`gen_manifest.py`) generates `resumes.json` as a manifest.  
- The site (served via GitHub Pages) dynamically loads that manifest and displays the résumés in the browser.  

## Live Site
[GitHub Pages link will appear here after you enable Pages in repo settings]

## License
© 2025 Serdar Benderli
Content is released under **Creative Commons Attribution–NonCommercial–ShareAlike 4.0 International (CC BY-NC-SA 4.0)**.  
This means you may share and remix the work, but you cannot use it commercially, and you must provide attribution.  

## Testing

The site is tested with [Bombadil](https://github.com/antithesishq/bombadil), a property-based testing framework for web UIs. Unlike traditional test scripts that check specific scenarios, Bombadil autonomously explores the site — clicking links, navigating pages, typing in the search box — while verifying that properties (assertions) always hold.

### Running tests

```bash
bombadil test https://epiccvs.com epiccvs-spec.ts --output-path ./results
```

> **Note:** `www.epiccvs.com` redirects to `epiccvs.com`, so always use the non-www URL.

### Adding properties

Properties are defined in `epiccvs-spec.ts`. To add a new one, define an extractor to capture DOM state and export a property using temporal logic operators:

```typescript
import { extract, always } from "@antithesishq/bombadil";

const pageTitle = extract((state) => state.document.title);

export const titleAlwaysPresent = always(() => pageTitle.current !== "");
```

Key operators:
- `always(() => ...)` — must hold in every state Bombadil visits
- `eventually(() => ...).within(n, "seconds")` — must become true within a time bound
- `.implies(...)` — if the left side holds, the right side must too

See the [Bombadil specification language docs](https://github.com/antithesishq/bombadil) for full details.

## Donations
If the site ever generates revenue (through ads or otherwise), **100% of proceeds, minus hosting costs, will be donated to charitable causes** that promote tolerance, education, and human rights.

