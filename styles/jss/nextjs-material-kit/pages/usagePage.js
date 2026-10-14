import { main, pageHeader } from "/styles/jss/nextjs-material-kit.js";

const usagePageStyle = {
  main,
  pageHeader,
  intro: {
    fontSize: "0.9rem",
    opacity: 0.8,
    maxWidth: 720,
  },
  metaTabs: {
    marginTop: "8px",
    marginBottom: "4px",
    borderBottom: "1px solid rgba(128,128,128,0.25)",
  },
  // Tables here are wider than a phone, so they scroll inside their own box rather than pushing the
  // page sideways.
  scroller: {
    overflowX: "auto",
    WebkitOverflowScrolling: "touch",
  },
};

export default usagePageStyle;
