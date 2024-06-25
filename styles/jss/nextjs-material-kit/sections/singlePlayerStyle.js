const singlePlayerStyle = {
  root: {
    paddingTop: 10,
    paddingLeft: 30,
    paddingRight: 30,
  },
  tourneyRoot: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 30,
    paddingRight: 30,
    display: "flex",
    alignItems: "center",
  },
  metas: {
    display: "flex",
    flexDirection: "column",
    paddingTop: 30,
  },
  playerMetaRow: {
    display: "flex",
  },
  playerNameRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  pokemonRow: {
    display: "grid",
  },
  pokemonRoot: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-around",
    textAlign: "center",
  },
  description: {
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  },
  pokemonImgWrapper: {
    position: "relative",
    height: 80,
    width: 80,
  },
  iconOverlayBottom: {
    position: "absolute",
    bottom: 0,
    right: 0
  },
  iconOverlayTop: {
    position: "absolute",
    top: 0,
    right: 0
  }
}
  
export default singlePlayerStyle;