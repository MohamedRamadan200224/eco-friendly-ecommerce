// Shared fetch / search / paginate hook.
//
// Every list page in the app hand-rolled the same pattern (a {results,
// loading, status, reload} state object, a search() filter and slice-based
// pagination) with copy-paste drift — including `==` comparisons and
// unguarded `item[field].toString()` calls that throw on null fields.
// This hook is the one implementation; pages only supply how to load the
// rows and which fields are searchable.
//
// Usage:
//   const list = useApiList({
//     load: () => api.get("/api/v1/users").then((resp) => resp.data.data.data),
//     searchFields: ["name", "email", "role"],
//     perPage: 10,
//   });
//   // list.results, list.loading, list.status, list.q / list.setQ,
//   // list.currentItems (searched + paginated), list.paginate(n),
//   // list.reload()
//
// `load` must return a promise of an array (already unwrapped from the
// response envelope — the envelope shape differs per endpoint, so unwrapping
// stays at the call site). Any value `load` closes over must be listed in
// `deps` so the list refetches when it changes (e.g. the active tab in
// Products.jsx). Errors are already toasted once by the api client's
// response interceptor, so this hook only flips loading / status.
import { useCallback, useEffect, useMemo, useState } from "react";

// Supports dotted paths ("user.name", "user.email") as well as plain fields.
const getFieldValue = (item, field) =>
  field
    .split(".")
    .reduce((acc, key) => (acc === null || acc === undefined ? acc : acc[key]), item);

export function useApiList({ load, searchFields = [], perPage = 10, deps = [] }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("fail");
  const [reloadKey, setReloadKey] = useState(0);
  const [q, setQ] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Intentionally NOT depending on `load` itself (it is re-created every
  // render): `deps` lists the values it closes over, plus `reloadKey`.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    load()
      .then((data) => {
        if (cancelled) return;
        setResults(Array.isArray(data) ? data : []);
        setStatus("success");
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("fail");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey, ...deps]);

  const reload = useCallback(() => {
    setReloadKey((key) => key + 1);
  }, []);

  // Substring, case-insensitive search. Null / undefined fields are skipped
  // (never .toString() on them) and comparisons use === throughout.
  const search = useCallback(
    (items) => {
      const query = q.trim().toLowerCase();
      if (query === "") return items;
      return items.filter((item) =>
        searchFields.some((field) => {
          const value = getFieldValue(item, field);
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(query);
        })
      );
    },
    [q, searchFields]
  );

  const filtered = useMemo(() => search(results), [results, search]);

  const indexOfLastItem = currentPage * perPage;
  const indexOfFirstItem = indexOfLastItem - perPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return {
    results,
    filtered,
    currentItems,
    loading,
    status,
    q,
    setQ,
    currentPage,
    perPage,
    paginate,
    setCurrentPage,
    reload,
  };
}

export default useApiList;
