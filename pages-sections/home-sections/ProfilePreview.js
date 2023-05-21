import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core";
import { Button, Card } from "@material-ui/core";
import styles from "/styles/jss/nextjs-material-kit/sections/homeProfileStyle.js";

const useStyles = makeStyles(styles);

export default function ProfilePreview(props) {
  const { imageUrl, username, description, onClick } = props;
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
        Edit
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
