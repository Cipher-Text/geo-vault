# Contributing

Geo Vault is intended to stay accurate, structured, and easy to consume.

## Data Changes

When adding or updating records:

- Keep IDs stable unless a dataset is being intentionally rebuilt.
- Preserve parent-child references, such as `division_id`, `district_id`, and `upazilla_id`.
- Include source notes for new datasets or major corrections.
- Prefer UTF-8 encoded JSON with two-space indentation.
- Keep primary JSON files as plain arrays of objects.

## Bangladesh Data

Bangladesh administrative data currently uses string values for IDs and coordinates because that is how the source dataset was published. Avoid changing field types unless the repository adopts a versioned breaking-change policy.

## World Data

Before adding world datasets, define or update schemas in [`../schemas`](../schemas) and document source licensing in [`data-sources.md`](data-sources.md).
