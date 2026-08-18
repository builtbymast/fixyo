import dotenv from "dotenv";

// Must be its own zero-dependency module imported first in index.ts. ES
// module evaluation runs an importing module's own top-level statements
// only AFTER all of its imported dependencies have been fully evaluated --
// so calling dotenv.config() directly in index.ts, even textually before
// `import { createApp } from "./createApp"`, would still run AFTER
// createApp's transitive dependency on env.ts (which reads process.env at
// module-load time), leaving every ENV field frozen at "".
dotenv.config({ path: [".env.local", ".env"] });
