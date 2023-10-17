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
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
  },
  pokemonRoot: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    width: "30%",
  },
  description: {
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  }
}
  
export default singlePlayerStyle;