# {{FEATURE}} — Project Plan

> Use this when starting a substantial feature or initiative. Write to the project root as
> `<feature>-plan.md` (e.g., `cms-plan.md`, `form-plan.md`). Plans capture the design and
> approval before implementation begins.

**Status:** TBD  <!-- plan only | in progress | complete -->
**Last updated:** {{DATE}}
**Owner:** {{OWNER}}
**Audience:** TBD  <!-- who reads this and makes decisions from it -->

---

## 1. context & goal

Problem:
- TBD

Prompt / trigger:
- TBD

Intended outcome:
- TBD

---

## 2. locked scope

- TBD  <!-- user-decided constraints that are not open for re-discussion -->

---

## 3. audit

| Area | Exists | Status |
|---|---|---|
| TBD | Yes / No | TBD |

---

## 4. locked stack / versions

| Layer | Choice | Version |
|---|---|---|
| TBD | TBD | TBD |

> Use latest verified stable versions unless a constraint pins otherwise.

---

## 5. architecture

TBD  <!-- concise design: service boundaries, data flow, key tradeoffs -->

---

## 6. file layout

```
project-root/
  TBD/
```

---

## 7. phased roadmap

Phases run sequentially. Lanes within a wave run in parallel.

### phase 1 — {{TITLE}}

**Wave 1**

| Lane | Work |
|---|---|
| L1 | TBD |
| L2 | TBD |

---

## 8. parallel sub-agent execution plan

### wave 1

| Lane | Agent type | Owned paths | Must-not-touch | Acceptance criteria |
|---|---|---|---|---|
| L1 | TBD | TBD | TBD | TBD |

---

## 9. critical decisions (locked)

| # | Decision | Rationale |
|---|---|---|
| 1 | TBD | TBD |

---

## 10. verification

Concrete end-to-end smoke test:
1. TBD

---

## 11. risks & open questions

1. TBD

---

## 12. pre-flight before execution

- [ ] Scope locked and agreed
- [ ] Stack / version choices confirmed
- [ ] Agent wave assignments reviewed
- [ ] Must-not-touch paths listed for every lane
- [ ] Acceptance criteria defined for every lane
