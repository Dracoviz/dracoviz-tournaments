import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "next-i18next";
import { track } from "../../utils/analytics";
import { EVENT, PARAM } from "../../utils/analyticsEvents";

/**
 * Column sorting shared by every table on the usage page.
 *
 * Extracted so the overview and the partners table cannot drift apart on the detail that actually
 * matters here: a null is "no data", not zero. A Pokémon nobody has a win/loss record for must not
 * sort as though it lost every match, so nulls go to the bottom in both directions.
 *
 * Pass `text: true` for a column of names. Those read best A–Z on first click, while a column of
 * numbers reads best largest-first.
 */
function compare(rows, { key, direction }, isText) {
  const sign = direction === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    if (isText) {
      return sign * String(av ?? "").localeCompare(String(bv ?? ""));
    }
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    return sign * (av - bv);
  });
}

/**
 * `columns` is `[{ key, labelKey, align, text }]`. Returns the sorted rows plus a `<SortHeader />`
 * that renders one clickable `<th>` and shows which column is driving the order.
 */
export default function useTableSort(columns, defaultKey) {
  const { t } = useTranslation();
  const initial = columns.find((c) => c.key === defaultKey) ?? columns[0];
  const [sort, setSort] = useState({
    key: initial.key,
    direction: initial.text ? "asc" : "desc",
  });

  const toggleSort = useCallback((key) => {
    const column = columns.find((c) => c.key === key);
    track(EVENT.USAGE_TABLE_SORTED, { [PARAM.SORT_COLUMN]: key });
    setSort((prev) => (prev.key === key
      // Same column again: flip. A different column: start from its natural direction.
      ? { key, direction: prev.direction === "desc" ? "asc" : "desc" }
      : { key, direction: column?.text ? "asc" : "desc" }));
  }, [columns]);

  const sortRows = useCallback(
    (rows) => compare(rows ?? [], sort, columns.find((c) => c.key === sort.key)?.text),
    [sort, columns],
  );

  const SortHeader = useMemo(() => function SortHeaderCell({ column }) {
    const active = sort.key === column.key;
    return (
      <th
        onClick={() => toggleSort(column.key)}
        // Sorting is a real control, so it has to be reachable and announced, not just clickable.
        role="columnheader"
        aria-sort={active ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggleSort(column.key);
          }
        }}
        style={{
          textAlign: column.align ?? "right",
          padding: "8px 10px",
          cursor: "pointer",
          whiteSpace: "nowrap",
          userSelect: "none",
        }}
      >
        {t(column.labelKey)}
        <span style={{ opacity: active ? 1 : 0.25 }}>
          {active ? (sort.direction === "desc" ? " ↓" : " ↑") : " ↕"}
        </span>
      </th>
    );
  }, [sort, toggleSort, t]);

  return { sort, sortRows, SortHeader };
}
