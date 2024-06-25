import movesJson from "../api/moveData.json";

export default function getMoveIcon(move) {
  if (move == null || movesJson[move] == null) {
    return null;
  }
  return (
    <img
      src={"https://imagedelivery.net/2qzpDFW7Yl3NqBaOSqtWxQ/POKEMON_TYPE_" + movesJson[move].type.toUpperCase() + ".png/public"}
      height={15}
      width={15}
      style={{ marginBottom: 3 }}
    />
  );
}