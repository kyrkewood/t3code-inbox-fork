import { Link } from "@tanstack/react-router";

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
  plan: "secondary",
  guest: "secondary",
  failed: "error",
  unread: "outline",
};

function projectKeyOf(ask: OpenAsk) {
  return `${ask.thread.environmentId}:${ask.thread.projectId}`;
}

function AskRow({ ask, nowMs }: { readonly ask: OpenAsk; readonly nowMs: number }) {
  const { thread } = ask;
  return (
    <li>
      <Link
        to="/$environmentId/$threadId"
        params={{ environmentId: thread.environmentId, threadId: thread.id }}
        className="flex flex-col gap-1 rounded-lg px-3 py-2 outline-none hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
      >
        <span className="flex items-center gap-2">
          <Badge variant={KIND_BADGE_VARIANT[ask.kind]}>{OPEN_ASK_KIND_LABEL[ask.kind]}</Badge>
          <span className="min-w-0 flex-1 truncate text-sm font-medium">{thread.title}</span>
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatRelativeTimeLabel(ask.since, nowMs)}
          </span>
        </span>
        {ask.context === null ? null : (
          <span className="line-clamp-3 text-xs text-muted-foreground">{ask.context}</span>
        )}
      </Link>
    </li>
  );
}

export function OpenAsksPage() {
  const threads = useQuietThreadShells();
  const projects = useProjects();
  const delegatedUnderParent = useDelegatedUnderParent();
  const hiddenThreadKeys = useHiddenThreadKeys();
  const now = useNowMinute();

  const asks = deriveOpenAsks({ threads, delegatedUnderParent, hiddenThreadKeys, now });
  const groups = groupOpenAsks(asks, projectKeyOf);
  const projectTitles = new Map(
    projects.map((project) => [`${project.environmentId}:${project.id}`, project.title]),
  );
  const nowMs = Date.parse(now);

  return (
    <AppRouteModal label="Open asks">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex min-h-12 shrink-0 items-center gap-2 border-b ps-5 pe-2">
          <h1 className="text-sm font-medium">Open asks</h1>
          {asks.length === 0 ? null : <Badge variant="secondary">{asks.length}</Badge>}
          <span className="flex-1" />
          <AppRouteModalClose />
        </header>
        <ScrollArea className="min-h-0 flex-1">
          <WorkspacePageContainer width="wide">
            {groups.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyTitle>Nothing is waiting on you</EmptyTitle>
                  <EmptyDescription>
                    Questions, approvals, plans to review, failures and unread results show up here.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="flex flex-col gap-6">
                {groups.map((group) => (
                  <section key={group.groupKey} aria-label={projectTitles.get(group.groupKey)}>
                    <h2 className="px-3 pb-1 text-xs font-medium text-muted-foreground">
                      {projectTitles.get(group.groupKey) ?? "Unknown project"}
                    </h2>
                    <ul className="flex flex-col">
                      {group.asks.map((ask) => (
                        <AskRow key={ask.key} ask={ask} nowMs={nowMs} />
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
