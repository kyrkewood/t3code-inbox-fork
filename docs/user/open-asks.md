# Open asks

Open asks lists the threads that are waiting on you, grouped by project, so you
do not have to scan the sidebar to find them. Open it from the command palette
with **Open asks**.

## What counts as an ask

A thread is listed when it has stopped and needs something from you:

- **Answer** or **Approve**, when the agent asked a question or for permission.
- **Review plan**, **Guest message**, or **Failed**.
- **Finished, unread**, when a turn ended and you have not looked at it yet.

Questions come first, then older asks before newer ones. Threads you have
settled, snoozed or hidden are left out.

## Asks the agent only wrote in its reply

Agents often end a turn with a question in plain text instead of asking through
T3 Code. Open asks reads the last message of a stopped thread:

- **Needs you** is shown when the message ends with a `Needs you:` line, whether
  or not you have read it. This is exact, so the line is shown as the ask.
- **Might need you** is a guess, made only for threads you have not looked at
  yet. It appears when the last paragraph is a question, or says something like
  "let me know" or "ready for your review". It recognizes these hand-offs in
  English, German, Swedish, Spanish, French, Portuguese, Russian, Japanese,
  Chinese and Korean. It is deliberately cautious, so some asks are missed.

Choose **Not an ask** on either to remove that message from the list. This is
remembered on this device only.

## Make your agent flag asks

Open asks works without any setup. For exact results, tell your agent to end a
turn that is waiting on you with one line per ask. Add this to your
`AGENTS.md`, `CLAUDE.md`, or whichever instructions file your provider reads:

```md
When you stop and need something from me, end your final message with one line
per item, in this form and with nothing after them:

Needs you: <what you need from me>
```

Write `Needs you:` in English whatever language you talk to the agent in. Only
lines at the very end of the message count. A `Needs you:` line earlier in
the message, or inside a code block, is ignored.
