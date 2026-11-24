import movesJson from "../api/moveData.json";

/**
 * The type api/moveData.json records for a move, or null for the handful of ids it has no entry
 * for (bare `WEATHER_BALL`, `HIDDEN_POWER`, ...). Callers reserve space rather than assume a type.
 */
export function getMoveType(move) {
  if (move == null) {
    return null;
  }
  return movesJson[move]?.type ?? null;
}

/** The CDN url of a type's icon. */
export function getTypeIconUrl(type) {
  return `https://imagedelivery.net/2qzpDFW7Yl3NqBaOSqtWxQ/POKEMON_TYPE_${type.toUpperCase()}.png/public`;
}

export default function getMoveIcon(move) {
  const type = getMoveType(move);
  if (type == null) {
    return null;
  }
  return (
    <img
      src={getTypeIconUrl(type)}
      height={15}
      width={15}
      alt={type}
      title={type}
      style={{ marginBottom: 3 }}
    />
  );
}
