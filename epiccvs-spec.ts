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
