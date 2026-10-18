import { test } from "node:test";
import assert from "node:assert/strict";
import { isSameOriginRequest } from "../lib/request-origin";

test("same-origin browser calls survive NextURL loopback normalization", () => {
  assert.equal(
    isSameOriginRequest(
      "http://127.0.0.1:3000",
      "http://localhost:3000/api/ai",
      "127.0.0.1:3000",
    ),
    true,
  );
  assert.equal(
    isSameOriginRequest(
      "http://localhost:3000",
      "http://localhost:3000/api/ai",
      "localhost:3000",
    ),
    true,
  );
  assert.equal(
    isSameOriginRequest(
      "http://[::1]:3000",
      "http://localhost:3000/api/ai",
      "[::1]:3000",
    ),
    true,
  );
});

test("foreign hosts, loopback aliases, ports and protocols remain blocked", () => {
  const target = "http://localhost:3000/api/ai";
  for (const origin of [
    "https://untrusted.example",
    "http://localhost:3000",
    "http://127.0.0.1:3001",
    "https://127.0.0.1:3000",
    "null",
    "not-a-url",
    "http://127.0.0.1:3000/path",
    "http://127.0.0.1:3000/",
  ]) {
    assert.equal(
      isSameOriginRequest(origin, target, "127.0.0.1:3000"),
      false,
      origin,
    );
  }
});

test("deployed origins and origin-less CLI requests retain their behaviour", () => {
  assert.equal(
    isSameOriginRequest(
      "https://prep.example",
      "https://internal.example/api/ai",
      "prep.example",
    ),
    true,
  );
  assert.equal(
    isSameOriginRequest(
      "https://attacker.example",
      "https://prep.example/api/ai",
      "prep.example",
    ),
    false,
  );
  assert.equal(
    isSameOriginRequest(null, "http://localhost:3000/api/ai", "127.0.0.1:3000"),
    true,
  );
  assert.equal(
    isSameOriginRequest(
      "https://prep.example",
      "https://prep.example/api/ai",
      null,
    ),
    true,
  );
  assert.equal(
    isSameOriginRequest(
      "https://attacker.example",
      "https://prep.example/api/ai",
      "prep.example@attacker.example",
    ),
    false,
  );
});
