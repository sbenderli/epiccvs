import { extract, always, now, time, actions, weighted, type Action } from "@antithesishq/bombadil";

// P1: No JavaScript errors
export {
  noUncaughtExceptions,
  noUnhandledPromiseRejections,
  noConsoleErrors,
} from "@antithesishq/bombadil/defaults/properties";

// P2: No broken resources
export { noHttpErrorCodes } from "@antithesishq/bombadil/defaults/properties";

// Default action generators (imported, not exported — combined into a weighted tree below)
import { clicks, inputs, scroll, navigation } from "@antithesishq/bombadil/defaults/actions";

// Extract whether the site header with navigation is present
const hasNavHeader = extract((state) => {
  const nav = state.document.querySelector("nav");
  if (!nav) return false;
  const brand = nav.querySelector("a.brand");
  const links = nav.querySelectorAll("a");
  return brand !== null && links.length >= 3;
});

// P3: Navigation is always visible
export const navigationAlwaysPresent = always(() => hasNavHeader.current === true);

// Extract whether every visible card has a valid resume link
const allCardsHaveValidLinks = extract((state) => {
  const cards = state.document.querySelectorAll("#list .card");
  return Array.from(cards).every((card) => {
    const href = card.getAttribute("href") ?? "";
    return href.startsWith("/resume.html?id=");
  });
});

// P4: Every resume card links to a valid resume page
export const cardsAlwaysLinkToResumes = always(() => allCardsHaveValidLinks.current === true);

// --- Search behavior ---

// Extract words from currently visible cards for use as search keywords
const pageWords = extract((state) => {
  const cards = state.document.querySelectorAll("#list .card");
  const words: string[] = [];
  for (const card of Array.from(cards)) {
    const text = card.textContent ?? "";
    for (const word of text.split(/\s+/)) {
      const clean = word.replace(/[^a-zA-Z0-9]/g, "");
      if (clean.length >= 4) words.push(clean);
    }
  }
  return words;
});

// Whether the search input is currently focused
const isSearchFocused = extract((state) => {
  return state.document.activeElement?.id === "q";
});

// Click coordinates of the search input (null if not on home page)
const searchInputPoint = extract((state) => {
  const input = state.document.querySelector("#q");
  if (!input) return null;
  const rect = input.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return null;
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
});

// Click the search input to focus it
const focusSearch = actions(() => {
  if (isSearchFocused.current) return []; // already focused
  const point = searchInputPoint.current;
  if (!point) return []; // not on home page
  return [{ Click: { name: "INPUT", content: "Search resumes", point } } as Action];
});

// When the search input is focused, type a word from the page
const searchWithKeywords = actions(() => {
  if (!isSearchFocused.current) return [];
  const words = pageWords.current;
  if (words.length === 0) return [];
  return words.map(
    (word) => ({ TypeText: { text: word, delayMillis: 50 } }) as Action,
  );
});

// Single weighted action tree — search actions get 3x weight over defaults
export const allActions = weighted([
  [1, clicks],
  [1, inputs],
  [1, scroll],
  [1, navigation],
  [3, focusSearch],
  [3, searchWithKeywords],
]);

// Extract search state on the home page
const searchState = extract((state) => {
  const list = state.document.querySelector("#list");
  if (!list) return null; // not on the home page
  const input = state.document.querySelector("#q") as HTMLInputElement | null;
  const searchValue = input?.value?.trim() ?? "";
  const cardCount = list.querySelectorAll(".card").length;
  return { searchValue, cardCount };
});

// Capture text content of all cards (used at initial load to know what searches should match)
const allCardTexts = extract((state) => {
  const cards = state.document.querySelectorAll("#list .card");
  return Array.from(cards).map((card) => (card.textContent ?? "").toLowerCase());
});

// P5: Home page shows cards when search is empty
export const emptySearchShowsCards = always(() => {
  if (!searchState.current) return true; // not on home page
  if (searchState.current.searchValue !== "") return true; // search is active
  return searchState.current.cardCount > 0;
});

// P6: Searching a known term returns results
export const validSearchFindsCards = now(() => {

  const initialTime = time.current;
  return always(
    now(() => {
      // Condition: we're on the home page and the search term matches a known resume
      const s = searchState.current;
      if (!s || !s.searchValue) return false;
      const initialTexts = allCardTexts.at(initialTime);
      if (!initialTexts.length) return false;
      return initialTexts.some((t) => t.includes(s.searchValue.toLowerCase()));
    }).implies(
      now(() => {
        // Assertion: at least one card is visible
        return (searchState.current?.cardCount ?? 0) > 0;
      }),
    ),
  );
});

// --- Resume page ---

// Extract resume page state (null if not on resume page)
const resumePageState = extract((state) => {
  const md = state.document.querySelector("#md");
  if (!md) return null; // not on resume page
  const title = state.document.querySelector("#title")?.textContent ?? "";
  const hasContent = md.children.length > 0 || (md.textContent ?? "").trim().length > 0;
  return { title, hasContent };
});

// P7: Resume page always displays content
export const resumePageShowsContent = always(() => {
  if (!resumePageState.current) return true; // not on resume page
  if (resumePageState.current.title === "Loading…") return true; // still loading, not a violation yet
  return resumePageState.current.hasContent;
});

// Extract "See also" links on resume pages
const seeAlsoState = extract((state) => {
  const related = state.document.querySelector("#related");
  if (!related) return null;
  const currentId = new URLSearchParams(state.window.location.search).get("id") ?? "";
  const relCardIds = Array.from(related.querySelectorAll(".rel-card"))
    .map((card) => {
      const href = card.getAttribute("href") ?? "";
      try {
        return new URLSearchParams(new URL(href, state.window.location.origin).search).get("id");
      } catch {
        return null;
      }
    })
    .filter(Boolean);
  return { currentId, relCardIds };
});

// P8: "See also" never links to the current resume
export const seeAlsoExcludesCurrentResume = always(() => {
  if (!seeAlsoState.current) return true;
  const { currentId, relCardIds } = seeAlsoState.current;
  if (!currentId || relCardIds.length === 0) return true;
  return !relCardIds.includes(currentId);
});
