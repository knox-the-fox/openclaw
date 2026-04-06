import { describe, expect, it } from "vitest";
import { resolveAnnounceOrigin } from "./subagent-announce-origin.js";

describe("resolveAnnounceOrigin slack thread threadId propagation", () => {
  it("preserves threadId from requesterOrigin for slack thread sessions", () => {
    const result = resolveAnnounceOrigin(
      {
        lastChannel: "slack",
        lastTo: "user:U02GYHT6MCZ",
        lastAccountId: "default",
        lastThreadId: "1775497096.054149",
        deliveryContext: {
          channel: "slack",
          to: "user:U02GYHT6MCZ",
          accountId: "default",
          threadId: "1775497096.054149",
        },
      },
      {
        channel: "slack",
        to: "user:U02GYHT6MCZ",
        accountId: "default",
        threadId: "1775497096.054149",
      },
    );
    expect(result).toEqual({
      channel: "slack",
      to: "user:U02GYHT6MCZ",
      accountId: "default",
      threadId: "1775497096.054149",
    });
  });

  it("preserves threadId even when session entry has no threadId", () => {
    const result = resolveAnnounceOrigin(
      {
        lastChannel: "slack",
        lastTo: "user:U02GYHT6MCZ",
        lastAccountId: "default",
      },
      {
        channel: "slack",
        to: "user:U02GYHT6MCZ",
        accountId: "default",
        threadId: "1775497096.054149",
      },
    );
    expect(result).toEqual({
      channel: "slack",
      to: "user:U02GYHT6MCZ",
      accountId: "default",
      threadId: "1775497096.054149",
    });
  });

  it("preserves threadId when session entry has stale/different threadId", () => {
    const result = resolveAnnounceOrigin(
      {
        lastChannel: "slack",
        lastTo: "user:U02GYHT6MCZ",
        lastAccountId: "default",
        lastThreadId: "9999999999.000000",
      },
      {
        channel: "slack",
        to: "user:U02GYHT6MCZ",
        accountId: "default",
        threadId: "1775497096.054149",
      },
    );
    expect(result).toEqual({
      channel: "slack",
      to: "user:U02GYHT6MCZ",
      accountId: "default",
      threadId: "1775497096.054149",
    });
  });

  it("falls back to session entry threadId when requesterOrigin omits it", () => {
    const result = resolveAnnounceOrigin(
      {
        lastChannel: "slack",
        lastTo: "user:U02GYHT6MCZ",
        lastAccountId: "default",
        lastThreadId: "1775497096.054149",
      },
      {
        channel: "slack",
        to: "user:U02GYHT6MCZ",
        accountId: "default",
      },
    );
    expect(result).toEqual({
      channel: "slack",
      to: "user:U02GYHT6MCZ",
      accountId: "default",
      threadId: "1775497096.054149",
    });
  });
});

describe("resolveAnnounceOrigin telegram forum topics", () => {
  it("preserves stored forum topic thread ids when requester origin omits one for the same chat", () => {
    expect(
      resolveAnnounceOrigin(
        {
          lastChannel: "telegram",
          lastTo: "telegram:-1001234567890:topic:99",
          lastThreadId: 99,
        },
        {
          channel: "telegram",
          to: "telegram:-1001234567890",
        },
      ),
    ).toEqual({
      channel: "telegram",
      to: "telegram:-1001234567890",
      threadId: 99,
    });
  });

  it("preserves stored forum topic thread ids for legacy group-prefixed requester targets", () => {
    expect(
      resolveAnnounceOrigin(
        {
          lastChannel: "telegram",
          lastTo: "telegram:-1001234567890:topic:99",
          lastThreadId: 99,
        },
        {
          channel: "telegram",
          to: "group:-1001234567890",
        },
      ),
    ).toEqual({
      channel: "telegram",
      to: "group:-1001234567890",
      threadId: 99,
    });
  });

  it("still strips stale thread ids when the stored telegram route points at a different chat", () => {
    expect(
      resolveAnnounceOrigin(
        {
          lastChannel: "telegram",
          lastTo: "telegram:-1009999999999:topic:99",
          lastThreadId: 99,
        },
        {
          channel: "telegram",
          to: "telegram:-1001234567890",
        },
      ),
    ).toEqual({
      channel: "telegram",
      to: "telegram:-1001234567890",
    });
  });
});
