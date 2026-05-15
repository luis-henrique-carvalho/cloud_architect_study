# Place the Next.js App at the Repository Root and Study Content in a Content Library

The Personal Study Portal will be implemented as a Next.js app at the repository root, while Study Content will live in a dedicated Content Library at `content/modules/`. This keeps application code and authored study material separate, lets the app read a single organized content source, and treats the existing `index.html` as UI/UX reference rather than the product runtime.

The initial implementation will not preserve legacy GitHub Markdown navigation links after the content move. Local app navigation is the intended way to browse the Study Content.

The current `index.html` will be moved to `docs/reference/index-ui-reference.html` so it remains available as UI/UX reference without competing with the Next.js app runtime.
