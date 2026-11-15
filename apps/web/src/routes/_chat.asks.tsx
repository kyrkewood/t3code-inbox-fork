import { createFileRoute } from "@tanstack/react-router";

import { OpenAsksPage } from "../components/asks/OpenAsksPage";

export const Route = createFileRoute("/_chat/asks")({
  component: OpenAsksPage,
});
