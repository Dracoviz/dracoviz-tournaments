import React, { createContext, useContext, useMemo, useRef, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { Button, TextField } from "@mui/material";
import { useTranslation } from "next-i18next";

/**
 * In-page replacements for window.alert, window.confirm and window.prompt.
 *
 * Native dialogs cannot be relied on for anything that matters. A browser told to "prevent
 * this page from creating additional dialogs" (Chrome, Firefox) or to "not show more alerts"
 * (Safari) silently drops every later one — confirm() then returns false and prompt() null
 * without ever asking — and the in-app browsers that links from Discord or Instagram open in
 * often never implement the JS dialog callbacks at all. The effect is a host who is never
 * shown the question, an error that never reaches a player, or a button that appears to do
 * nothing. These are ordinary DOM, so they render everywhere and nothing can suppress them.
 *
 * All three are promise-based, since a React dialog cannot block the way the native ones do:
 *
 *   if (!await dialog.confirm(t("confirm_leave_session"))) return;
 *   const name = await dialog.prompt(t("add_host_prompt"));   // null if dismissed
 *   dialog.alert(t(newData.error));            // await it only if something follows
 */
const DialogContext = createContext(null);

const ALERT = "alert";
const CONFIRM = "confirm";
const PROMPT = "prompt";

export function MessageDialog(props) {
  const {
    open, kind, title, message, defaultValue, confirmLabel, cancelLabel, confirmColor,
    onConfirm, onCancel,
  } = props;
  const { t } = useTranslation();
  const [value, setValue] = useState(defaultValue ?? "");
  const isPrompt = kind === PROMPT;
  // Nothing to send for a prompt nobody typed in. The native dialog would have handed back an
  // empty string and left the caller to post it and surface whatever the API said about it.
  const canConfirm = !isPrompt || value.trim().length > 0;
  const confirm = () => {
    if (!canConfirm) {
      return;
    }
    onConfirm?.(isPrompt ? value : true);
  };
  return (
    <Dialog
      open={open === true}
      onClose={onCancel}
      fullWidth
      maxWidth="xs"
      aria-labelledby={title != null ? "message-dialog-title" : undefined}
      aria-describedby="message-dialog-description"
    >
      {title != null && (<DialogTitle id="message-dialog-title">{title}</DialogTitle>)}
      <DialogContent>
        {/* Some prompts join a warning and the question itself with a blank line, the way they
            read in a native dialog, so keep the line breaks. */}
        <div id="message-dialog-description" style={{ whiteSpace: "pre-wrap" }}>
          {message}
        </div>
        {isPrompt && (
          <TextField
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              // Enter submits, the way it does in the native prompt this replaces.
              if (event.key === "Enter") {
                event.preventDefault();
                confirm();
              }
            }}
            autoFocus
            fullWidth
            margin="dense"
            variant="standard"
          />
        )}
      </DialogContent>
      <DialogActions>
        {/* On a question, the dismissing button takes the focus: these guard actions that are
            destructive or hard to walk back, so a stray Enter should not be the one that goes
            through. A prompt puts it in the field instead, and a message has nothing to guard. */}
        {kind !== ALERT && (
          <Button type="button" color="primary" onClick={onCancel} autoFocus={kind === CONFIRM}>
            {cancelLabel ?? t("cancel")}
          </Button>
        )}
        <Button
          type="button"
          color={confirmColor ?? "primary"}
          variant={kind === CONFIRM ? "contained" : "text"}
          onClick={confirm}
          disabled={!canConfirm}
          autoFocus={kind === ALERT}
        >
          {confirmLabel ?? (kind === CONFIRM ? t("yes") : t("ok"))}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function DialogProvider({ children }) {
  // Requests queue rather than replace each other: a handler that reports an error and then
  // says what to do next would otherwise lose the first message, and a dropped request would
  // leave whoever awaited it hanging forever.
  const queue = useRef([]);
  const nextId = useRef(0);
  const [current, setCurrent] = useState(null);

  const push = (request) => new Promise((resolve) => {
    nextId.current += 1;
    queue.current.push({ ...request, id: nextId.current, resolve });
    setCurrent((shown) => shown ?? queue.current[0]);
  });

  const settle = (answer) => {
    const [done] = queue.current.splice(0, 1);
    setCurrent(queue.current[0] ?? null);
    done?.resolve?.(answer);
  };

  const api = useMemo(() => ({
    alert: (message, options = {}) => push({ ...options, message, kind: ALERT }),
    confirm: (message, options = {}) => push({ ...options, message, kind: CONFIRM }),
    prompt: (message, options = {}) => push({ ...options, message, kind: PROMPT }),
  }), []);

  return (
    <DialogContext.Provider value={api}>
      {children}
      <MessageDialog
        // Remounting per request is what gives a prompt a fresh, empty field each time.
        key={current?.id ?? "none"}
        open={current != null}
        kind={current?.kind}
        title={current?.title}
        message={current?.message}
        defaultValue={current?.defaultValue}
        confirmLabel={current?.confirmLabel}
        cancelLabel={current?.cancelLabel}
        confirmColor={current?.confirmColor}
        onConfirm={(answer) => settle(answer)}
        // Escape, the backdrop and Cancel all mean "no": false for a question, null for a
        // prompt, which is what the natives returned.
        onCancel={() => settle(current?.kind === PROMPT ? null : false)}
      />
    </DialogContext.Provider>
  );
}

/**
 * The fallback keeps a component that somehow renders outside the provider working instead of
 * throwing mid-tournament; _app wraps every page, so it should never be reached.
 */
const nativeFallback = {
  alert: async (message) => window.alert(message),
  confirm: async (message) => window.confirm(message),
  prompt: async (message, options = {}) => window.prompt(message, options.defaultValue ?? ""),
};

export function useDialog() {
  return useContext(DialogContext) ?? nativeFallback;
}
