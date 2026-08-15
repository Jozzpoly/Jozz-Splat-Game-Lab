# C0a local-LAB security review

Date: 2026-08-15
Scope: owner launcher, local HTTP server and externally derived candidate GLB serving.

Reviewed properties:

- server binds loopback only;
- Host allowlist accepts only `127.0.0.1` / `localhost`;
- malformed and traversal-style paths are rejected or not served;
- exact F0 ZIP is hashed before extraction;
- exact F0 PLY is size/hash checked before any source stream is served;
- every candidate GLB is checked against its committed byte count and SHA-256 before the server starts;
- candidate names are constrained before being mapped to filesystem paths;
- derived geometry remains outside public Git;
- C0a browser evidence remains explicitly non-metric and cannot silently become Box3D/metric authority.

No dedicated Codex Security scan runtime was available in the ChatGPT host; this is a scoped manual/diff-oriented review following the installed Codex Security procedure, not a claim of an automated repository-wide scan.
