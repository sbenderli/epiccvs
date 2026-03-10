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

## Site properties

These are the behavioral guarantees of the site. Any code change must preserve them.

#### P1: No JavaScript errors
The site must not produce uncaught exceptions, unhandled promise rejections, or console errors during normal use.

#### P2: No broken resources
All HTTP requests for assets (images, scripts, data files) must succeed. No 4xx or 5xx responses.

#### P3: Navigation is always visible
Every page must display the navigation header with the brand link, Home, About, and Random CV links.

#### P4: Every resume card links to a valid resume page
On the home page, every card in the grid must link to `/resume.html?id=<valid-id>`. No broken or missing links.

#### P5: Clearing search restores all cards
After a search term is entered and then fully cleared, the home page must display the same number of cards as it did at initial page load. Ensures the filter logic fully resets.

#### P6: Searching a known term returns results
If the search term matches any resume's title, role, or tags, at least one card must be visible. Ensures the filter logic is correct and doesn't silently discard valid matches.

#### P7: Resume page always displays content
When viewing a resume, the page must display a title and rendered content. The article area must not be empty after loading completes.

#### P8: "See also" never links to the current resume
The related resumes section at the bottom of a resume page must not include the resume currently being viewed.

#### P9: No duplicate cards on the home page
Every card in the grid must be unique. No resume should appear more than once.

## Testing

Properties are verified with [Bombadil](https://github.com/antithesishq/bombadil), a property-based testing framework for web UIs. Bombadil autonomously explores the site — clicking links, navigating pages, typing in the search box — while checking that all properties hold in every reachable state. The test specification is in `epiccvs-spec.ts`.

### Running tests

```bash
# Against the live site
bombadil test https://epiccvs.com epiccvs-spec.ts --output-path ./results --headless

# Against a local dev server
python3 -m http.server 8080
bombadil test http://localhost:8080 epiccvs-spec.ts --output-path ./results --headless
```

Add `--exit-on-violation` to stop on the first failure.

> **Note:** `www.epiccvs.com` redirects to `epiccvs.com`, so always use the non-www URL.

### Adding a new property

1. Define the property in this README under "Site properties" with the next `P<N>` ID. Describe the expected behavior in plain language, independent of any test framework.
2. Implement the assertion in `epiccvs-spec.ts`.
3. Verify by intentionally breaking the site and confirming the violation is caught.

## Donations
If the site ever generates revenue (through ads or otherwise), **100% of proceeds, minus hosting costs, will be donated to charitable causes** that promote tolerance, education, and human rights.

