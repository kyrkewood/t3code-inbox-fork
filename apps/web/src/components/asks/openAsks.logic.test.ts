import { EnvironmentId, MessageId, ProjectId, ThreadId } from "@t3tools/contracts";
import * as DateTime from "effect/DateTime";
import { describe, expect, it } from "vite-plus/test";

import { makeThreadFixture, type ThreadFixtureOverrides } from "../../test-fixtures";
import { deriveOpenAsks, groupOpenAsks, type OpenAskKind } from "./openAsks.logic";

const NOW = "2026-03-09T12:00:00.000Z";
const environmentId = EnvironmentId.make("environment-test");

const UNREAD: ThreadFixtureOverrides = {
  latestRun: {
    runId: "run-1" as never,
    status: "completed",
    assistantMessageId: null,
    requestedAt: null,
    startedAt: null,
    completedAt: "2026-03-09T10:05:00.000Z",
  },
  lastVisitedAt: "2026-03-09T10:00:00.000Z",
};

function thread(id: string, overrides: ThreadFixtureOverrides = {}) {
  return makeThreadFixture({ id: ThreadId.make(id), environmentId, ...overrides });
}

function withAssistantText(
  base: ReturnType<typeof thread>,
  role: "assistant" | "user",
  text: string,
) {
  return {
    ...base,
    source: {
      ...base.source,
      latestVisibleMessage: {
        id: MessageId.make("message-1"),
        role,
        text,
        updatedAt: DateTime.makeUnsafe(NOW),
      },
    },
  };
}

function derive(threads: ReturnType<typeof thread>[], hidden: string[] = []) {
  return deriveOpenAsks({
    threads,
    delegatedUnderParent: new Set(),
    hiddenThreadKeys: new Set(hidden),
    now: NOW,
  });
}

describe("deriveOpenAsks", () => {
  it.each<[OpenAskKind, ThreadFixtureOverrides]>([
    ["input", { hasPendingUserInput: true }],
    ["approval", { hasPendingApprovals: true }],
    ["guest", { pendingGuestMessageCount: 1 }],
    ["unread", UNREAD],
  ])("lists a thread whose status needs you as %s", (kind, overrides) => {
    expect(derive([thread("a", overrides)]).map((ask) => ask.kind)).toEqual([kind]);
  });

  it.each<[string, ThreadFixtureOverrides]>([
    ["has nothing pending", {}],
    ["is settled", { hasPendingUserInput: true, settledOverride: "settled" }],
    ["is archived", { hasPendingUserInput: true, archivedAt: "2026-03-09T11:00:00.000Z" }],
    ["is snoozed with only unread output", { ...UNREAD, snoozedUntil: "2099-01-01T00:00:00.000Z" }],
  ])("skips a thread that %s", (_label, overrides) => {
    expect(derive([thread("a", overrides)])).toEqual([]);
  });

  it("lists a snoozed thread that has since raised a question", () => {
    const snoozed = thread("a", {
      hasPendingUserInput: true,
      snoozedUntil: "2099-01-01T00:00:00.000Z",
    });
    expect(derive([snoozed]).map((ask) => ask.kind)).toEqual(["input"]);
  });

  it("skips threads the tag filter hides", () => {
    const hidden = thread("hidden", { hasPendingUserInput: true });
    const [ask] = derive([hidden]);
    expect(derive([hidden], [ask!.key])).toEqual([]);
  });

  it("puts questions before approvals, then oldest first", () => {
    const asks = derive([
      thread("approval", { hasPendingApprovals: true }),
      thread("newer-input", {
        hasPendingUserInput: true,
        pendingUserInputAt: "2026-03-09T11:00:00.000Z",
      }),
      thread("older-input", {
        hasPendingUserInput: true,
        pendingUserInputAt: "2026-03-09T09:00:00.000Z",
      }),
    ]);
    expect(asks.map((ask) => ask.thread.id)).toEqual(["older-input", "newer-input", "approval"]);
  });

  it("keeps the tail of a long assistant message, where the question is", () => {
    const long = `${"Context. ".repeat(100)}Should I merge now?`;
    const [ask] = derive([
      withAssistantText(thread("a", { hasPendingUserInput: true }), "assistant", long),
    ]);
    expect(ask!.context).toMatch(/^….*Should I merge now\?$/);
    expect(ask!.context!.length).toBeLessThanOrEqual(281);
  });

  it("shows no context for a user message", () => {
    const [ask] = derive([
      withAssistantText(thread("a", { hasPendingUserInput: true }), "user", "hi"),
    ]);
    expect(ask!.context).toBeNull();
  });
});

describe("groupOpenAsks", () => {
  it("leads with the group holding the most pressing ask and keeps ask order inside", () => {
    const asks = derive([
      thread("p1-approval", { projectId: ProjectId.make("p1"), hasPendingApprovals: true }),
      thread("p2-input", { projectId: ProjectId.make("p2"), hasPendingUserInput: true }),
      thread("p1-guest", { projectId: ProjectId.make("p1"), pendingGuestMessageCount: 1 }),
    ]);
    const groups = groupOpenAsks(asks, (ask) => ask.thread.projectId);
    expect(groups.map((group) => group.groupKey)).toEqual(["p2", "p1"]);
    expect(groups[1]!.asks.map((ask) => ask.thread.id)).toEqual(["p1-approval", "p1-guest"]);
  });
});
