import React, { useState } from "react";
import { makeStyles } from "@mui/styles";
import { Chip } from "@mui/material";
import { useTranslation } from "next-i18next";
import GridContainer from "/components/Grid/GridContainer.js";
import GridItem from "/components/Grid/GridItem.js";
import Card from "/components/Card/Card.js";
import discordServers from "../../api/discordServers";
import DiscordJoinModal from "./DiscordJoinModal";
import { track } from "../../utils/analytics";
import { EVENT, PARAM } from "../../utils/analyticsEvents";

const styles = {
  server: {
    // The card itself is already a flex column, so this only has to make every
    // tile in the row the same height regardless of description length.
    height: "calc(100% - 40px)",
    padding: 20,
    alignItems: "center",
    textAlign: "center",
    cursor: "pointer",
    // The card is the button here, so it needs to look like one on hover and
    // show a focus ring for keyboard users. cardStyle already animates `all`.
    "&:hover": {
      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.12)",
    },
    "&:focus-visible": {
      outline: "2px solid #00acc1",
      outlineOffset: 2,
    },
  },
  logo: {
    height: 72,
    width: 72,
    borderRadius: "50%",
    objectFit: "cover",
    marginBottom: 12,
  },
  name: {
    margin: 0,
    marginBottom: 8,
    fontSize: "1.1rem",
  },
  description: {
    marginTop: 10,
    marginBottom: 0,
    fontSize: 14,
  },
};

const useStyles = makeStyles(styles);

export default function DiscordServerList(props) {
  const { authId, playerName, onNameChange } = props;
  const { t } = useTranslation();
  const classes = useStyles();
  const [selectedServer, setSelectedServer] = useState(null);
  // Tracked separately from `selectedServer` so the dialog keeps its contents
  // (and so its exit transition) while it fades out.
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const onSelect = (server) => {
    track(EVENT.DISCORD_DIALOG_OPENED, { [PARAM.CONFIG_FLAGS]: server.id });
    setSelectedServer(server);
    setIsDialogOpen(true);
  };

  const onKeyDown = (event, server) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(server);
    }
  };

  return (
    <div>
      <h3>{t("discord_section_title")}</h3>
      <p>{t("discord_section_subtitle")}</p>
      <GridContainer>
        {discordServers.map((server) => (
          <GridItem xs={12} sm={6} md={3} key={server.id} style={{ display: "flex" }}>
            <Card
              className={classes.server}
              role="button"
              tabIndex={0}
              onClick={() => onSelect(server)}
              onKeyDown={(event) => onKeyDown(event, server)}
            >
              <img
                src={server.logoUrl}
                alt={server.name}
                className={classes.logo}
                height={72}
                width={72}
                loading="lazy"
              />
              {/* Server names are proper nouns and stay untranslated. */}
              <h4 className={classes.name}>{server.name}</h4>
              {server.languageKey != null && (
                <Chip label={t(server.languageKey)} size="small" color="info" />
              )}
              <p className={classes.description}>{t(server.descriptionKey)}</p>
            </Card>
          </GridItem>
        ))}
      </GridContainer>
      <DiscordJoinModal
        server={selectedServer}
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        authId={authId}
        playerName={playerName}
        onNameChange={onNameChange}
      />
    </div>
  );
}
