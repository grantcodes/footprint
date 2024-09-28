import test from "node:test";
import assert from "node:assert";

import { example } from "../lib/example";

test("example", (t) => {
  assert.strictEqual(example("Grant"), "Hello Grant 👋");
});
