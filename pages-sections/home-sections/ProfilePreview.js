import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@mui/styles";
import { Button } from "@mui/material";
import Card from "../../components/Card/Card";
import styles from "/styles/jss/nextjs-material-kit/sections/homeProfileStyle.js";
import i18n from "../../i18n";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles(styles);

export default function ProfilePreview(props) {
  const { imageUrl, username, description, onClick } = props;
  const { t } = useTranslation();
  const classes = useStyles();
  return (
    <Card className={classes.root}>
      <div className={classes.profile}>
        <img src={imageUrl} alt={username} height={60} width={60} />
        <p className={classes.profileContent}>
          <strong className={classes.username}>{username}</strong>
          <br />
          {description}
        </p>
      </div>
      <Button onClick={onClick}>
        {t("edit")}
      </Button>
    </Card>
  )
}

ProfilePreview.propTypes = {
  imageUrl: PropTypes.string,
  username: PropTypes.string,
  description: PropTypes.string,
  onClick: PropTypes.func,
};
