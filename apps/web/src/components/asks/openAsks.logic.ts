import { scopedThreadKey, scopeThreadRef } from "@t3tools/client-runtime/environment";
import type { EnvironmentThreadShell } from "@t3tools/client-runtime/state/models";
import { effectiveSnoozed } from "@t3tools/client-runtime/state/thread-settled";
import * as DateTime from "effect/DateTime";
import { msg } from "gt-react";

import { detectAsk, type DetectedAsk } from "./askDetection.logic";
import {
  filterSidebarV2VisibleThreads,
  resolveThreadStatusPill,
  type ThreadStatusPill,
} from "../Sidebar.logic";

export type OpenAskKind =
  | "input"
  | "approval"
  | "marked"
  | "plan"
  | "guest"
  | "failed"
  | "inferred"
  | "unread";

// Answering unblocks the agent, so questions lead; unread output is the softest ask.
const KIND_RANK: Record<OpenAskKind, number> = {
  input: 0,
  approval: 1,
  marked: 2,
  plan: 3,
  guest: 4,
  failed: 5,
  inferred: 6,
  unread: 7,
};

const KIND_BY_PILL: Partial<Record<ThreadStatusPill["label"], OpenAskKind>> = {
  "Awaiting Input": "input",
  "Pending Approval": "approval",
  "Plan Ready": "plan",
  "Guest Request": "guest",
  Failed: "failed",
  Completed: "unread",
};

export const OPEN_ASK_KIND_LABEL = {
  input: msg("Answer"),
  approval: msg("Approve"),
  marked: msg("Needs you"),
  plan: msg("Review plan"),
  guest: msg("Guest message"),
  failed: msg("Failed"),
  inferred: msg("Might need you"),
  unread: msg("Finished, unread"),
} satisfies Record<OpenAskKind, ReturnType<typeof msg>>;

// The ask sits at the end of an agent message, so keep the tail.
const CONTEXT_MAX_CHARS = 280;

export interface OpenAsk {
  readonly key: string;
  readonly thread: EnvironmentThreadShell;
  readonly kind: OpenAskKind;
  readonly since: string;
  readonly context: string | null;
  // The message an ask was read from, so "Not an ask" can dismiss it. Null when none applies.
  readonly messageId: string | null;
}

function askSince(thread: EnvironmentThreadShell, kind: OpenAskKind): string {
  const request = thread.source.pendingRuntimeRequest;
  if (kind === "input") {
    if (thread.pendingUserInputAt) return thread.pendingUserInputAt;
    if (request) return DateTime.formatIso(request.createdAt);
  }
  if (kind === "approval" && request) return DateTime.formatIso(request.createdAt);
  if (kind === "failed") return thread.runtime?.updatedAt ?? thread.updatedAt;
  return thread.latestRun?.completedAt ?? thread.updatedAt;
}

/** Unread output may turn out to hold an ask; structured kinds already say what is needed. */
function upgrade(kind: OpenAskKind, detected: DetectedAsk | null): OpenAskKind {
  return kind === "unread" && detected !== null ? detected.kind : kind;
}

function askContext(thread: EnvironmentThreadShell): string | null {
  const message = thread.source.latestVisibleMessage;
  if (message === null || message.role !== "assistant") return null;
  const text = message.text.replace(/\s+/g, " ").trim();
  if (text.length === 0) return null;
  return text.length > CONTEXT_MAX_CHARS ? `…${text.slice(-CONTEXT_MAX_CHARS).trimStart()}` : text;
}

function compareOpenAsks(a: OpenAsk, b: OpenAsk): number {
  return (
    KIND_RANK[a.kind] - KIND_RANK[b.kind] ||
    Date.parse(a.since) - Date.parse(b.since) ||
    a.key.localeCompare(b.key)
  );
}

/**
 * One ask per thread: the shell carries a single pending request, so a thread with an approval
 * and a question lists only the first the sidebar would show.
 */
export function deriveOpenAsks(input: {
  readonly threads: readonly EnvironmentThreadShell[];
  readonly delegatedUnderParent: ReadonlySet<string>;
  readonly hiddenThreadKeys: ReadonlySet<string>;
  // Messages the user marked "Not an ask"; they stop counting as marked or inferred asks.
  readonly dismissedMessageIds: ReadonlySet<string>;
  readonly now: string;
}): OpenAsk[] {
  const asks: OpenAsk[] = [];
  const visible = filterSidebarV2VisibleThreads(input.threads, null, input.delegatedUnderParent);
  for (const thread of visible) {
    const key = scopedThreadKey(scopeThreadRef(thread.environmentId, thread.id));
    if (
      thread.deletedAt !== null ||
      thread.settledOverride === "settled" ||
      input.hiddenThreadKeys.has(key) ||
      effectiveSnoozed(thread, { now: input.now })
    ) {
      continue;
    }
    const pill = resolveThreadStatusPill({ thread });
    const pillKind = pill === null ? undefined : KIND_BY_PILL[pill.label];
    // A thread that is working, connecting or waiting on a subthread is not at a stopping point.
    if (pill !== null && pillKind === undefined) continue;
    const message = thread.source.latestVisibleMessage;
    const detected =
      message?.role === "assistant" && !input.dismissedMessageIds.has(message.id)
        ? detectAsk(message.text)
        : null;
    // The thread's own status says it needs nothing, so only an explicit line can add an ask.
    const kind =
      pillKind === undefined
        ? detected?.kind === "marked"
          ? "marked"
          : undefined
        : upgrade(pillKind, detected);
    if (kind === undefined) continue;
    const fromMessage = kind === "marked" || kind === "inferred";
    asks.push({
      key,
      thread,
      kind,
      since:
        fromMessage && message ? DateTime.formatIso(message.updatedAt) : askSince(thread, kind),
      // A marked line is the exact ask; otherwise show the end of the message it came from.
      context: detected?.kind === "marked" ? detected.summary : askContext(thread),
      messageId: fromMessage && message ? message.id : null,
    });
  }
  return asks.sort(compareOpenAsks);
}

export interface OpenAskGroup {
  readonly groupKey: string;
  readonly asks: readonly OpenAsk[];
}

/** Groups keep ask order inside; groups lead with their most pressing ask. */
export function groupOpenAsks(
  asks: readonly OpenAsk[],
  groupKeyOf: (ask: OpenAsk) => string,
): OpenAskGroup[] {
  const groups = new Map<string, OpenAsk[]>();
  for (const ask of asks) {
    const groupKey = groupKeyOf(ask);
    const members = groups.get(groupKey);
    if (members === undefined) groups.set(groupKey, [ask]);
    else members.push(ask);
  }
  return [...groups.entries()]
    .map(([groupKey, members]) => ({ groupKey, asks: members }))
    .sort((a, b) => compareOpenAsks(a.asks[0]!, b.asks[0]!));
}
