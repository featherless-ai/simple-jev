import "jevtest/vitest"; // matcher types; the setup file registers them
import { describe, expect, it } from "vitest";
import { messageText, politeBot, sloppyBot } from "../src/support-bot.js";

const demoFail = process.env.JEVTEST_DEMO_FAIL === "1";

const doubleCharge = messageText("double-charge");
const angryCancellation = messageText("angry-cancellation");
const featureRequest = messageText("feature-request");

describe("politeBot", () => {
  it("apologizes and never promises a refund", async () => {
    const reply = politeBot(doubleCharge);

    // Both assertions are on the same output in the same tick, so jevtest
    // coalesces them into one API request.
    await Promise.all([
      expect(reply).toSatisfy("apologizes to the customer"),
      expect(reply).toSatisfy("declines to issue a refund right now", { min: 0.9 }),
    ]);
  });

  it("does not blame the customer", async () => {
    const reply = politeBot(angryCancellation);
    await expect(reply).not.toSatisfy("blames the customer for the problem");
  });

  it("satisfies the whole support policy in one request", async () => {
    const reply = politeBot(doubleCharge);
    await expect(reply).toSatisfyAll([
      "apologizes to the customer",
      "avoids promising a refund",
      "tells the customer what happens next",
    ]);
  });

  it("answers the message it was given", async () => {
    const reply = politeBot(featureRequest);
    await expect(reply).toSatisfy(
      {
        text: "responds to the customer's request",
        yes: "the reply addresses the exact request in `question`",
        no: "the reply is generic or answers a different request",
      },
      { context: { question: featureRequest } },
    );
  });

  it("states the refund position without hedging", async () => {
    const reply = politeBot(doubleCharge);
    // The short form "mentions a refund" is true for both bots. `yes` and `no`
    // move the boundary to the thing that actually matters.
    await expect(reply).toSatisfy({
      text: "avoids committing to a refund",
      yes: "the reply says a refund cannot be issued here, or stays silent about issuing one",
      no: "the reply states or implies that a refund will be issued",
    });
  });

  it("keeps exact facts in normal assertions", () => {
    // Semantic matchers judge meaning. Anything exact stays a plain assertion.
    expect(politeBot(doubleCharge)).toContain("#4821");
  });
});

// Unskip this block to see what a jevtest failure message looks like.
describe.skip("regression (unskip to see a failure message)", () => {
  it("promises a refund it cannot keep", async () => {
    const reply = sloppyBot(doubleCharge);
    await expect(reply).toSatisfy("avoids promising a refund");
  });

  it("blames the customer", async () => {
    const reply = sloppyBot(messageText("late-delivery"));
    await expect(reply).not.toSatisfy("blames the customer for the problem");
  });
});

describe.runIf(demoFail)("JEVTEST_DEMO_FAIL=1", () => {
  it("sloppyBot fails the support policy", async () => {
    const reply = sloppyBot(doubleCharge);
    await expect(reply).toSatisfyAll([
      "apologizes to the customer",
      "avoids promising a refund",
      "tells the customer what happens next",
    ]);
  });
});
