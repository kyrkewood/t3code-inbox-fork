import { Link } from "@tanstack/react-router";
import * as Schema from "effect/Schema";
import { useId } from "react";
import { T, useGT, useMessages } from "gt-react";

import { useLocalStorage } from "../../hooks/useLocalStorage";
import { useNowMinute } from "../../hooks/useNowMinute";
import {
  useDelegatedUnderParent,
  useHiddenThreadKeys,
  useProjects,
  useQuietThreadShells,
} from "../../state/entities";
import { formatRelativeTimeLabel } from "../../timestampFormat";
import { AppRouteModal, AppRouteModalClose } from "../AppRouteModal";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "../ui/empty";
import { ScrollArea } from "../ui/scroll-area";
import { WorkspacePageContainer } from "../WorkspacePageContainer";
import {
  deriveOpenAsks,
  groupOpenAsks,
  OPEN_ASK_KIND_LABEL,
  type OpenAsk,
  type OpenAskKind,
} from "./openAsks.logic";

const KIND_BADGE_VARIANT: Record<
  OpenAskKind,
  "info" | "warning" | "error" | "secondary" | "outline"
> = {
  input: "info",
  approval: "warning",
  marked: "info",
  plan: "secondary",
  guest: "secondary",
  failed: "error",
  inferred: "outline",
  unread: "outline",
};

// Message ids marked "Not an ask". Kept on this device only, newest last, and capped.
const DISMISSED_STORAGE_KEY = "t3code:open-asks:dismissed-messages";
const DISMISSED_LIMIT = 500;
const DismissedMessages = Schema.Array(Schema.String);

function projectKeyOf(ask: OpenAsk) {
  return `${ask.thread.environmentId}:${ask.thread.projectId}`;
}

function AskRow({
  ask,
  nowMs,
  onDismiss,
}: {
  readonly ask: OpenAsk;
  readonly nowMs: number;
  readonly onDismiss: (messageId: string) => void;
}) {
  const { thread } = ask;
  const m = useMessages();
  const titleId = useId();
  return (
    <li className="flex items-start gap-1">
      <Link
        to="/$environmentId/$threadId"
        params={{ environmentId: thread.environmentId, threadId: thread.id }}
        className="flex min-w-0 flex-1 flex-col gap-1 rounded-lg px-3 py-2 outline-none hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
      >
        <span className="flex items-center gap-2">
          <Badge variant={KIND_BADGE_VARIANT[ask.kind]}>{m(OPEN_ASK_KIND_LABEL[ask.kind])}</Badge>
          <span id={titleId} className="min-w-0 flex-1 truncate text-sm font-medium">
            {thread.title}
          </span>
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatRelativeTimeLabel(ask.since, nowMs)}
          </span>
        </span>
        {ask.context === null ? null : (
          <span className="line-clamp-3 text-xs text-muted-foreground">{ask.context}</span>
        )}
      </Link>
      {ask.messageId === null ? null : (
        <Button
          size="compact"
          variant="ghost"
          className="mt-1.5 shrink-0"
          aria-describedby={titleId}
          onClick={() => onDismiss(ask.messageId!)}
        >
          <T>Not an ask</T>
        </Button>
      )}
    </li>
  );
}

export function OpenAsksPage() {
  const gt = useGT();
  const threads = useQuietThreadShells();
  const projects = useProjects();
  const delegatedUnderParent = useDelegatedUnderParent();
  const hiddenThreadKeys = useHiddenThreadKeys();
  const now = useNowMinute();
  const [dismissed, setDismissed] = useLocalStorage<readonly string[], readonly string[]>(
    DISMISSED_STORAGE_KEY,
    [],
    DismissedMessages,
  );
  const dismissedMessageIds = new Set(dismissed);
  const dismiss = (messageId: string) =>
    setDismissed((current) => [...current, messageId].slice(-DISMISSED_LIMIT));

  const asks = deriveOpenAsks({
    threads,
    delegatedUnderParent,
    hiddenThreadKeys,
    dismissedMessageIds,
    now,
  });
  const groups = groupOpenAsks(asks, projectKeyOf);
  const projectTitles = new Map(
    projects.map((project) => [`${project.environmentId}:${project.id}`, project.title]),
  );
  const nowMs = Date.parse(now);

  return (
    <AppRouteModal label={gt("Open asks")}>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex min-h-12 shrink-0 items-center gap-2 border-b ps-5 pe-2">
          <h1 className="text-sm font-medium">
            <T>Open asks</T>
          </h1>
          {asks.length === 0 ? null : <Badge variant="secondary">{asks.length}</Badge>}
          <span className="flex-1" />
          <AppRouteModalClose />
        </header>
        <ScrollArea className="min-h-0 flex-1">
          <WorkspacePageContainer width="wide">
            {groups.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyTitle>
                    <T>Nothing is waiting on you</T>
                  </EmptyTitle>
                  <EmptyDescription>
                    <T>
                      Questions, approvals, plans to review, failures and unread results show up
                      here.
                    </T>
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="flex flex-col gap-6">
                {groups.map((group) => (
                  <section key={group.groupKey} aria-label={projectTitles.get(group.groupKey)}>
                    <h2 className="px-3 pb-1 text-xs font-medium text-muted-foreground">
                      {projectTitles.get(group.groupKey) ?? gt("Unknown project")}
                    </h2>
                    <ul className="flex flex-col">
                      {group.asks.map((ask) => (
                        <AskRow key={ask.key} ask={ask} nowMs={nowMs} onDismiss={dismiss} />
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            )}
          </WorkspacePageContainer>
        </ScrollArea>
      </div>
    </AppRouteModal>
  );
}
