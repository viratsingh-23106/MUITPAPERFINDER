## Add more courses and a new branch to Upload form

Update `src/lib/data.ts` to extend the static course/branch options used by the Upload page (and anywhere else `courses`/`branches` are consumed).

### Changes

1. **Add new courses** to the `courses` array:
   - `ba` → "B.A"
   - `mtech` → "M.Tech"
   - `bba` → "BBA"
   - `mba` → "MBA"

2. **Add B.Sc Agriculture as a branch** under `bsc` in the `branches` map:
   - `agriculture` → "Agriculture"

3. **M.Tech branches** — since M.Tech typically has engineering specializations, add a `mtech` entry to `branches` mirroring the B.Tech list (CSE, ECE, ME, CE, EE, IT), and include `"mtech"` in `courseHasBranches`.

4. **B.A / BBA / MBA** — keep as branch-less courses (no entry in `branches`, not added to `courseHasBranches`), matching how BCA/MCA are handled today.

### Files

- `src/lib/data.ts` — only file that needs editing. The Upload page, Search filters, and `getCourseName`/`getBranchName` helpers all read from this module, so they pick up the new options automatically.

No backend, schema, or UI component changes required.
