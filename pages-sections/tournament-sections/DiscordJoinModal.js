import React, { useEffect, useState } from "react";
import {
  Alert,
  AlertTitle,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useTranslation } from "next-i18next";
import CustomInput from "/components/CustomInput/CustomInput.js";
import fetchApi from "../../api/fetchApi";
import { track } from "../../utils/analytics";
import { EVENT, PARAM, RESULT, SOURCE } from "../../utils/analyticsEvents";

/**
 * `shared/login` seeds every new account with `Player <random int>`. Walking
 * into a community Discord under that name leaves hosts with no way to tie a
 * dracoviz entry back to the person in the server, so the invite stays hidden
 * until the player sets a real trainer name.
 */
const DEFAULT_NAME_PATTERN = /^Player \d+$/;

export const isDefaultPlayerName = (name) => DEFAULT_NAME_PATTERN.test((name ?? "").trim());

export default function DiscordJoinModal(props) {
  const {
    server, open, onClose, authId, playerName, onNameChange,
  } = props;
  const { t } = useTranslation();
  // `null` means "not known yet" -- distinct from a player who genuinely has
  // no name, which would be "".
  const [name, setName] = useState(playerName ?? null);
  const [isLoadingName, setIsLoadingName] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (playerName != null) {
      setName(playerName);
    }
  }, [playerName]);

  // The public tournament list does not always carry the viewer's own name, so
  // look it up on demand rather than letting an unknown name quietly skip the
  // default-name check below.
  useEffect(() => {
    if (!open || name != null || authId == null || authId === "") {
      return undefined;
    }
    let isStale = false;
    setIsLoadingName(true);
    // A failed lookup resolves to "" so a network hiccup does not lock someone
    // out of the invite entirely.
    const resolve = (resolved) => {
      if (isStale) return;
      setName(resolved);
      setIsLoadingName(false);
      if (resolved !== "") {
        onNameChange?.(resolved);
      }
    };
    fetchApi("shared/get/", "GET", { x_session_id: authId })
      .then((response) => response.json())
      .then((data) => resolve(data?.name ?? ""))
      .catch(() => resolve(""));
    return () => { isStale = true; };
  }, [open, name, authId]);

  // Clear any previous attempt when the dialog is reopened, and start the field
  // empty: the point is to type a trainer name, not to edit "Player 12345".
  useEffect(() => {
    if (open) {
      setSaveError(null);
      reset({ name: "" });
    }
  }, [open, server?.id, reset]);

  if (server == null) {
    return null;
  }

  const onSaveName = async ({ name: newName }) => {
    const trimmed = (newName ?? "").trim();
    if (trimmed === "") {
      return;
    }
    setIsSaving(true);
    setSaveError(null);
    try {
      const response = await fetchApi(
        "shared/edit-profile/",
        "POST",
        { x_session_id: authId, "Content-Type": "application/json" },
        JSON.stringify({ name: trimmed }),
      );
      const data = await response.json();
      const { error } = data ?? {};
      // Field COUNT only -- the name itself is player-authored text and may
      // never reach analytics.
      track(EVENT.PROFILE_SAVED, {
        [PARAM.SOURCE]: SOURCE.LINK_DISCORD,
        [PARAM.FIELD_COUNT]: 1,
        [PARAM.ERROR_CODE]: error ?? undefined,
        [PARAM.RESULT]: error ? RESULT.FAILURE : RESULT.SUCCESS,
      });
      if (error != null) {
        setSaveError(t(error));
        return;
      }
      setName(trimmed);
      onNameChange?.(trimmed);
    } catch {
      setSaveError(t("discord_name_save_failed"));
    } finally {
      setIsSaving(false);
    }
  };

  const onOpenInvite = () => {
    track(EVENT.EXTERNAL_LINK_CLICKED, {
      [PARAM.SOURCE]: SOURCE.LINK_DISCORD,
      // CONFIG_FLAGS carries which server was opened -- the vocabulary keeps one
      // small shared param set rather than a bespoke dimension per feature.
      [PARAM.CONFIG_FLAGS]: server.id,
    });
    onClose();
  };

  const renderLoading = () => (
    <DialogContent style={{ display: "flex", justifyContent: "center", padding: 40 }}>
      <CircularProgress />
    </DialogContent>
  );

  const renderNameGate = () => (
    <form onSubmit={handleSubmit(onSaveName)}>
      <DialogContent>
        <Alert severity="error">
          <AlertTitle>{t("discord_name_required_title")}</AlertTitle>
          {t("discord_name_required", { name })}
        </Alert>
        <CustomInput
          labelText={t("trainer_name")}
          id="discordTrainerName"
          formControlProps={{ fullWidth: true }}
          inputProps={{
            ...register("name", {
              required: true,
              validate: (value) => {
                const trimmed = (value ?? "").trim();
                if (trimmed === "") return false;
                return !isDefaultPlayerName(trimmed) || t("discord_name_still_default");
              },
            }),
          }}
          error={errors.name != null || saveError != null}
        />
        {(saveError ?? errors.name?.message) != null && (
          <small style={{ color: "#f44336", display: "block" }}>
            {saveError ?? errors.name?.message}
          </small>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">{t("cancel")}</Button>
        <Button type="submit" variant="contained" disabled={isSaving}>
          {isSaving ? <CircularProgress size={20} color="inherit" /> : t("save")}
        </Button>
      </DialogActions>
    </form>
  );

  const renderRulesWarning = () => (
    <>
      <DialogContent>
        <Alert severity="warning">
          <AlertTitle>{t("discord_rules_warning_title")}</AlertTitle>
          {t("discord_rules_warning")}
        </Alert>
        {server.languageKey != null && (
          <Chip
            label={t(server.languageKey)}
            size="small"
            color="info"
            style={{ marginTop: 16 }}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">{t("cancel")}</Button>
        <Button
          component="a"
          href={server.inviteUrl}
          target="_blank"
          rel="noopener noreferrer"
          variant="contained"
          onClick={onOpenInvite}
        >
          {t("discord_open_invite")}
        </Button>
      </DialogActions>
    </>
  );

  const renderBody = () => {
    if (isLoadingName || name == null) {
      return renderLoading();
    }
    if (isDefaultPlayerName(name)) {
      return renderNameGate();
    }
    return renderRulesWarning();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="discord-join-title"
    >
      <DialogTitle id="discord-join-title">
        {t("discord_join_title", { server: server.name })}
      </DialogTitle>
      {renderBody()}
    </Dialog>
  );
}
