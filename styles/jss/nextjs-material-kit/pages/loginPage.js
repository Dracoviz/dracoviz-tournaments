import { main, infoColor, pageHeader } from "/styles/jss/nextjs-material-kit.js";

const signupPageStyle = {
  main,
  cardHidden: {
    opacity: "0",
    transform: "translate3d(0, -60px, 0)"
  },
  progress: {
    color: infoColor,
    width: "6rem !important",
    height: "6rem !important"
  },
  pageHeader,
  form: {
    margin: "0"
  },
  card: {
    padding: "20px 20px",
  },
  cardHeader: {
    width: "auto",
    textAlign: "center",
    marginLeft: "20px",
    marginRight: "20px",
    marginTop: "-40px",
    padding: "20px 0",
    marginBottom: "15px"
  },
  socialIcons: {
    maxWidth: "24px",
    marginTop: "0",
    width: "100%",
    transform: "none",
    left: "0",
    top: "0",
    height: "100%",
    lineHeight: "41px",
    fontSize: "20px"
  },
  divider: {
    marginTop: "30px",
    marginBottom: "0px",
    textAlign: "center"
  },
  cardFooter: {
    paddingTop: "0rem",
    border: "0",
    borderRadius: "6px",
    justifyContent: "center !important"
  },
  socialLine: {
    marginTop: "1rem",
    textAlign: "center",
    padding: "0"
  },
  inputIconsColor: {
    color: "#495057"
  }
};

export default signupPageStyle;
