// Shared static content for the frontend.
//
// NOTE: the dummy PRODUCTS catalogue that used to live here was deleted
// (clean-code pass, 2026-11-19). The frontend no longer ships mock data:
// the catalogue comes from the real API, and the demo catalogue lives in
// the database (see the backend seed script). Only genuinely static
// content remains here.

// NAVIGATION
export const NAV_LINKS = [
  { href: "/", key: "home", label: "Home" },
  { href: "/products", key: "products", label: "Products" },
  { href: "/contact-us", key: "contact", label: "Contact" },
  { href: "/about", key: "about", label: "About" },
];

export const TEAM = [
  {
    img: "/team_x.jpg",
    name: "Morgan Smith",
    jop: "CEO, Founder",
    key: "x",
  },
  {
    img: "/team_x.jpg",
    name: "Morgan Smith",
    jop: "CEO, Founder",
    key: "xx",
  },
  {
    img: "/team_x.jpg",
    name: "Morgan Smith",
    jop: "CEO, Founder",
    key: "xz",
  },
  {
    img: "/team_x.jpg",
    name: "Morgan Smith",
    jop: "CEO ,Founder",
    key: "xc",
  },
];
