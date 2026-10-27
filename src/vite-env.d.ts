/// <reference types="vite/client" />

/** a source file highlighted at build time by scripts/highlight-plugin.ts */
declare module "*?highlight" {
  const listing: import("./code/listing").Listing;
  export default listing;
}
/** the same, in another theme: "./file.py?theme=github-light&highlight" */
declare module "*&highlight" {
  const listing: import("./code/listing").Listing;
  export default listing;
}
