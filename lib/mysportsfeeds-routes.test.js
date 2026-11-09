const test = require("node:test");
const assert = require("node:assert/strict");

const {
  validateMySportsFeedsRequest: validate,
} = require("./mysportsfeeds-routes");

const ROOT = "/v2.1/pull/nfl";

test("allows team standings requests", () => {
  assert.equal(
    validate("/2026-2027-regular/team_stats_totals.json", "?stats=W,L,T"),
    `${ROOT}/2026-2027-regular/team_stats_totals.json?stats=W,L,T`,
  );
});

test("allows full-season schedules", () => {
  assert.equal(
    validate("/2026-2027-regular/games.json"),
    `${ROOT}/2026-2027-regular/games.json`,
  );
});

test("allows regular-season weeks 1–18", () => {
  for (let week = 1; week <= 18; week++) {
    assert.equal(
      validate(`/2026-2027-regular/week/${week}/games.json`),
      `${ROOT}/2026-2027-regular/week/${week}/games.json`,
    );
  }
});

test("rejects unsupported weeks", () => {
  for (const week of ["0", "19", "22", "-1", "abc", "01"]) {
    assert.equal(validate(`/2026-2027-regular/week/${week}/games.json`), null);
  }
});

test("rejects unsupported endpoints", () => {
  assert.equal(validate("/2026-2027-regular/players.json"), null);
  assert.equal(validate("/2026-2027-regular/roster_players.json"), null);
});

test("rejects invalid seasons", () => {
  for (const season of [
    "26",
    "abcd",
    "2026",
    "2026-2027",
    "2026-2027-preseason",
    "2026-2027-playoffs",
    "2026-2028-regular",
  ]) {
    assert.equal(validate(`/${season}/games.json`), null);
  }
});

test("rejects unexpected query parameters", () => {
  assert.equal(validate("/2026-2027-regular/games.json", "?foo=bar"), null);
  assert.equal(
    validate(
      "/2026-2027-regular/team_stats_totals.json",
      "?stats=W,L,T&extra=1",
    ),
    null,
  );
  assert.equal(
    validate(
      "/2026-2027-regular/team_stats_totals.json",
      "?stats=W,L,T&stats=W",
    ),
    null,
  );
});

test("rejects encoded or ambiguous paths", () => {
  for (const path of [
    "/2026-2027-regular/%2e%2e/games.json",
    "/2026-2027-regular//games.json",
    "/2026\\games.json",
    "/2026-2027-regular/week/18/../games.json",
    "/2026-2027-regular/games.json%00",
  ]) {
    assert.equal(validate(path), null);
  }
});

test("rejects malformed query encoding", () => {
  assert.equal(
    validate("/2026-2027-regular/team_stats_totals.json", "?stats=W,L,T%"),
    null,
  );
  assert.equal(
    validate("/2026-2027-regular/team_stats_totals.json", "?stats=W,L,T%GG"),
    null,
  );
});
