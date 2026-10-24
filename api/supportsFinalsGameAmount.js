// Keep in step with dracoviz-site's util/bracket/finalsGameAmount.js, which is what
// actually decides whether a host's finals game count is stored and which match it
// applies to. The stored bracket type strings are the ones in getBracketTypeLabel.js.
//
// These are the formats that end in a single deciding match, so there is a "finals" to
// point at: swiss and round robin just stop when their rounds run out.
export default function supportsFinalsGameAmount(bracketType) {
  return bracketType === "singleElim"
    || bracketType === "doubleElim"
    || bracketType === "swissDoubleElim";
}
