import React, { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import {
  Button, Tabs, Tab, TextField, CircularProgress, Alert,
} from "@mui/material";
import { useTranslation } from "next-i18next";
import {
  loadGamemaster, parsePvPokeTeam, serializePvPokeTeam,
} from "pvpoke-converter";
import {
  formValuesToUnified, unifiedToFormValues, TEAM_SIZE,
} from "../../api/teamFormat";

/**
 * Import and export the team currently in the form as a PvPoke team string.
 *
 * The gamemaster is what lets CP be derived from level/IVs on import and default levels/IVs be
 * filled in on export. It is a ~2MB fetch from PvPoke's repo, so it is loaded on first open and
 * kept for the life of the component. Failing to load it is not fatal — both directions still work,
 * they just carry across whatever the string already spelled out.
 */
export default function PvPokeDialog(props) {
  const {
    open, onClose, getValues, setValue, pokemonOptions, teamSize = TEAM_SIZE, league = "great",
  } = props;
  const { t } = useTranslation();
  const [tab, setTab] = useState(0);
  const [text, setText] = useState("");
  const [message, setMessage] = useState(null);
  const [gamemaster, setGamemaster] = useState(null);
  const [isLoadingGamemaster, setIsLoadingGamemaster] = useState(false);
  const [copied, setCopied] = useState(false);

  // The dialog stays mounted between openings, so start each visit on a clean import tab rather
  // than on whatever the previous visit left behind.
  useEffect(() => {
    if (open) {
      setTab(0);
      setText("");
      setMessage(null);
      setCopied(false);
    }
  }, [open]);

  const ensureGamemaster = async () => {
    if (gamemaster != null) {
      return gamemaster;
    }
    setIsLoadingGamemaster(true);
    try {
      const loaded = await loadGamemaster();
      setGamemaster(loaded);
      return loaded;
    } catch (ex) {
      console.error(ex);
      return null;
    } finally {
      setIsLoadingGamemaster(false);
    }
  };

  const buildExport = async () => {
    const gm = await ensureGamemaster();
    const unified = formValuesToUnified(getValues(), teamSize, pokemonOptions);
    if (unified.length <= 0) {
      setText("");
      setMessage({ severity: "info", text: t("pvpoke_nothing_to_export") });
      return;
    }
    setMessage(null);
    setText(serializePvPokeTeam(unified, gm == null ? {} : { gamemaster: gm, league }));
  };

  const handleTabChange = (_event, value) => {
    setTab(value);
    setCopied(false);
    setMessage(null);
    if (value === 1) {
      buildExport();
    } else {
      setText("");
    }
  };

  const handleImport = async () => {
    if (text.trim() === "") {
      return;
    }
    const gm = await ensureGamemaster();

    let unified;
    try {
      unified = parsePvPokeTeam(text, gm ?? undefined);
    } catch (ex) {
      setMessage({ severity: "error", text: t("pvpoke_parse_failed") });
      return;
    }

    // A PvPoke team may reference forms this tournament's dex does not carry (or more than six
    // Pokemon). Keep what fits and name what did not.
    const unknown = [];
    const usable = unified.filter((pokemon) => {
      const key = pokemon.shadow ? `${pokemon.speciesId}_shadow` : pokemon.speciesId;
      if (pokemonOptions?.[key] == null) {
        unknown.push(key);
        return false;
      }
      return true;
    }).slice(0, teamSize);

    if (usable.length <= 0) {
      setMessage({ severity: "error", text: t("pvpoke_no_usable_pokemon") });
      return;
    }

    const values = unifiedToFormValues(usable, pokemonOptions);
    for (let index = 0; index < teamSize; index += 1) {
      setValue(`pokemon.${index}`, values.pokemon[index] ?? "", { shouldValidate: true });
      setValue(`fastMoves.${index}`, values.fastMoves[index] ?? "", { shouldValidate: true });
      setValue(`chargedMoves.${index}.0`, values.chargedMoves[index]?.[0] ?? "", { shouldValidate: true });
      setValue(`chargedMoves.${index}.1`, values.chargedMoves[index]?.[1] ?? "", { shouldValidate: true });
      setValue(`cp.${index}`, values.cp[index] ?? "", { shouldValidate: true });
      setValue(`hp.${index}`, values.hp[index] ?? "", { shouldValidate: true });
      setValue(`nickname.${index}`, values.nickname[index] ?? "", { shouldValidate: true });
      setValue(`purified.${index}`, values.purified[index] ?? false, { shouldValidate: true });
      setValue(`bestBuddy.${index}`, values.bestBuddy[index] ?? false, { shouldValidate: true });
      setValue(`level.${index}`, values.level[index] ?? "");
      setValue(`attackIv.${index}`, values.attackIv[index] ?? "");
      setValue(`defenseIv.${index}`, values.defenseIv[index] ?? "");
      setValue(`hpIv.${index}`, values.hpIv[index] ?? "");
    }

    if (unknown.length > 0) {
      setMessage({
        severity: "warning",
        text: t("pvpoke_unknown_species", { species: unknown.join(", ") }),
      });
      return;
    }
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t("pvpoke_title")}</DialogTitle>
      <DialogContent>
        <Tabs value={tab} onChange={handleTabChange} style={{ marginBottom: 15 }}>
          <Tab label={t("import_from_pvpoke")} />
          <Tab label={t("export_to_pvpoke")} />
        </Tabs>
        {isLoadingGamemaster && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <CircularProgress size={18} />
            <span>{t("pvpoke_loading_gamemaster")}</span>
          </div>
        )}
        {message != null && (
          <Alert severity={message.severity} style={{ marginBottom: 10 }}>{message.text}</Alert>
        )}
        <TextField
          multiline
          minRows={8}
          fullWidth
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={t("pvpoke_paste_placeholder")}
          InputProps={{ readOnly: tab === 1, style: { fontFamily: "monospace", fontSize: "0.8rem" } }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("cancel")}</Button>
        {tab === 0 ? (
          <Button onClick={handleImport} disabled={text.trim() === ""}>
            {t("import_from_pvpoke")}
          </Button>
        ) : (
          <Button onClick={handleCopy} disabled={text === ""}>
            {copied ? t("pvpoke_copied") : t("pvpoke_copy")}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
