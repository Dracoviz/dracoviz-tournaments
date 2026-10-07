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
  factionNameRow: {
    display: "flex",
    alignItems: "center",
  },
  playerNameRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  // Name plus the record and Buchholz chips. Without wrapping, the second chip pushes
  // out of the card on a narrow screen instead of dropping below the name.
  playerNameAndStats: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    columnGap: 10,
    rowGap: 6,
    minWidth: 0,
    // Long single-word names would otherwise push past the edge of the card.
    "& h4": {
      overflowWrap: "anywhere",
    },
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