# Enhance filter toolbar UI/UX in TransactionDataTable

## Goal

Redesign the filter bar in `app/profile/[id]/transactions-table.tsx` into a contained, labeled, responsive toolbar with debounced fetching. Scope confirmed by user: **full toolbar redesign** (no collapsible section, no filter chips, no new dependencies).

## Current problems

- Bare `FieldLegend` "Filters" floats above the table with no container.
- Single `flex flex-row` overflows/cramps on narrow screens.
- No labels or icons — placeholders only.
- Server fetch fires on every keystroke (no debounce).
- Clear button only exists in the controls row, no active-filter count.
- Unused imports: `Label`, `Switch` (already dead), plus `FieldGroup`/`FieldLegend`/`FieldSet` become dead after redesign.
- Item-name clear button has wrong `aria-label` ("Clear person name search").
- base-ui `ToggleGroup` already deselects on re-click (verified in `node_modules/@base-ui/react/toggle-group/ToggleGroup.mjs` ~line 64) — keep behavior, no code change needed for it.

## Tasks

### 1. `app/profile/[id]/transactions-table.tsx`

**State/effect changes**
- Replace the `filterEnabled` state + its `setFilterEnabled` call inside `useEffect` with a derived const:
  ```tsx
  const activeFilterCount =
      (filterSearchPersonName !== "" ? 1 : 0) +
      (filterSearchItemName !== "" ? 1 : 0) +
      (filterDateRange !== undefined ? 1 : 0) +
      (filterTransactionType !== undefined ? 1 : 0);
  ```
- Debounce the fetch: add `useRef` to the react import; add `const didMount = useRef(false);` and `const DEBOUNCE_MS = 300;` (module-level const). In the existing `useEffect`:
  ```tsx
  const delay = didMount.current ? DEBOUNCE_MS : 0;
  didMount.current = true;
  const timer = setTimeout(() => { startTransition(async () => { /* existing fetch body */ }); }, delay);
  return () => clearTimeout(timer);
  ```
  Keep the same dependency array. This fetches immediately on first mount and debounces all subsequent filter/page/pageSize changes. Remove `setFilterEnabled(...)` from the effect.

**Imports**
- `@/components/ui/field`: keep `Field`, `FieldLabel`; drop `FieldGroup`, `FieldLegend`, `FieldSet`.
- Drop `Switch` (`@/components/ui/switch`) and `Label` (`@/components/ui/label`) imports.
- `lucide-react`: keep `X`, `FunnelX`; add `Search` and `Filter`.

**Toolbar JSX** — replace the whole `<div className="flex flex-col sm:flex-row w-full mb-4">…` filter block with:

```tsx
<div className="mb-4 w-full rounded-lg border bg-card p-3">
  <div className="mb-3 flex items-center justify-between gap-2">
    <div className="flex items-center gap-2 text-sm font-medium">
      <Filter className="size-4 text-muted-foreground" />
      Filters
    </div>
    {activeFilterCount > 0 && (
      <Button variant="ghost" size="sm" onClick={clearAllFilters}>
        <FunnelX />
        Clear filters ({activeFilterCount})
      </Button>
    )}
  </div>
  <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end">
    <Field className="md:w-60">
      <FieldLabel htmlFor="date-picker-range">Date Range</FieldLabel>
      <DateRangeFilterPicker value={filterDateRange} onChange={handleDataRangeChange} />
    </Field>
    <Field className="md:w-56">
      <FieldLabel htmlFor="input-field-person-name">Person Name</FieldLabel>
      <InputGroup>
        <InputGroupAddon align="inline-start"><Search className="size-4" /></InputGroupAddon>
        <InputGroupInput id="input-field-person-name" placeholder="Search person name..." value={filterSearchPersonName} onChange={/* existing */} />
        {filterSearchPersonName && <InputGroupAddon align="inline-end">{/* existing X clear button */}</InputGroupAddon>}
      </InputGroup>
    </Field>
    <Field className="md:w-56">
      <FieldLabel htmlFor="input-field-item-name">Item Name</FieldLabel>
      <InputGroup>{/* search icon + input + X clear, fix aria-label to "Clear item name search" */}</InputGroup>
    </Field>
    <Field className="md:w-auto">
      <FieldLabel>Type</FieldLabel>
      <ToggleGroup value={...} onValueChange={...}>{/* Payment/Debt, variant="outline" (default size so h-8 aligns with inputs) */}</ToggleGroup>
    </Field>
  </div>
</div>
```

Notes:
- Extract the "Clear all" handler to a named `clearAllFilters` function (resets the 4 filter states + `setPage(1)`), reuse for the header button.
- `DateRangeFilterPicker`'s `className` prop is currently unused (dropped) — control width via the wrapping `Field`.
- All onChange/onValueChange/clear handlers keep resetting `setPage(1)`.
- The toggle group: remove `size="lg"` so controls share height `h-8` with the inputs.

## Out of scope

- Column sorting (commented-out code in `columns.tsx`).
- Collapsible filter section and active-filter chips (explicitly not chosen).
- Date quick-presets (e.g. "This month").
- Server-side changes to `getTransactionsWithAccumulation`.

## Validation

- `pnpm lint` — confirms no unused imports.
- `pnpm build` — confirms the client component compiles.
- Manual: initial table loads immediately; typing in a search input shows a ~300ms debounce then refetch; date/type changes refetch; header "Clear filters (N)" appears with active filters, count matches, clears everything and resets to page 1; toolbar wraps on narrow widths; keyboard tab order works (labels `htmlFor` correct).
