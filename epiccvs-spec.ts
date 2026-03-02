import { extract, always } from "@antithesishq/bombadil";

// Re-export defaults: noUncaughtExceptions, noConsoleErrors,
// noHttpErrorCodes, noUnhandledPromiseRejections,
// plus default actions (clicks, inputs, scroll, navigation)
export * from "@antithesishq/bombadil/defaults";

// Extract whether the site header with navigation is present
const hasNavHeader = extract((state) => {
  const nav = state.document.querySelector("nav");
  if (!nav) return false;
  const brand = nav.querySelector("a.brand");
  const links = nav.querySelectorAll("a");
  return brand !== null && links.length >= 3;
});

// Property: the navigation header must always be visible on every page
export const navigationAlwaysPresent = always(() => hasNavHeader.current === true);

// Extract whether every visible card has a valid resume link
const allCardsHaveValidLinks = extract((state) => {
  const cards = state.document.querySelectorAll("#list .card");
  return Array.from(cards).every((card) => {
    const href = card.getAttribute("href") ?? "";
    return href.startsWith("/resume.html?id=");
  });
});

// Property: every card in the grid must always link to a valid resume page
export const cardsAlwaysLinkToResumes = always(() => allCardsHaveValidLinks.current === true);
