import React from "react";
import formatMove from "../../api/formatMove";
import { getMoveType, getTypeIconUrl } from "../../utils/get-moves-icon";

const ICON_SIZE = 18;

/**
 * A move's type icon beside its name, for use as the body of a move option.
 *
 * Several moves share one localised name -- Weather Ball has five typed variants, Aura Wheel two --
 * so the name on its own cannot tell them apart in a dropdown; the type icon is what does. Every
 * move dropdown in the app renders its options through this, so the icon is always present and
 * always in the same place. The icon's slot is held open for the few ids with no type data and for
 * the "None" option, which keeps the names in a menu aligned down a single edge.
 */
export default function MoveLabel(props) {
  const { move, locale, label } = props;
  const type = getMoveType(move);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", minWidth: 0 }}>
      <span
        style={{
          flex: `0 0 ${ICON_SIZE}px`,
          height: ICON_SIZE,
          marginRight: 8,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {type == null ? null : (
          <img
            src={getTypeIconUrl(type)}
            alt={type}
            title={type}
            height={ICON_SIZE}
            width={ICON_SIZE}
          />
        )}
      </span>
      <span>{label ?? formatMove(move, locale)}</span>
    </span>
  );
}
