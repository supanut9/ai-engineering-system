# Phase Gates

## Purpose

These gates prevent AI agents from skipping critical planning and verification
steps.

## Gate 1: Product Clarity

Cannot proceed beyond intake until:
- product goal is clear
- user types are clear
- problem statement is clear
- key constraints are known

## Gate 2: Requirements Ready

Cannot proceed to architecture until:
- core features are listed
- non-goals are listed
- acceptance criteria exist
- important edge cases are known

## Gate 3: Functional Spec Ready

Cannot proceed to implementation planning until:
- major flows are defined
- states and errors are defined
- API and data model impact are understood

## Gate 4: Architecture Ready

Cannot proceed to implementation until:
- stack choices are explicit
- service boundaries are explicit
- major tradeoffs are documented
- major decisions are captured in ADRs when needed

## Gate 5: Task Ready

Cannot implement a task until:
- the task goal is clear
- acceptance criteria exist
- affected services are known
- test plan is known

## Gate 6: Release Ready

Cannot call the project ready to ship until:
- tests and build status are known
- deployment steps exist
- rollback steps exist
- operational risks are documented
