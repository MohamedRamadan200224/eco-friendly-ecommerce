// URL slugs for products (no new dependency — this is a small local
// helper, not the `slugify` package).
//
// slugify('Eco-Friendly Electric Car!') -> 'eco-friendly-electric-car'
// Lowercase, every run of non-alphanumerics becomes one hyphen, leading /
// trailing hyphens trimmed, repeats collapsed. A name with no usable
// characters (e.g. '!!!') falls back to 'product' so the slug is never
// empty; uniqueness against that fallback is handled by the caller's
// -2 / -3 suffixing.
const slugify = (value) => {
  const slug = String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'product';
};

module.exports = { slugify };
