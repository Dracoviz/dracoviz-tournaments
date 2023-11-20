import movesJSON from "./moves.json";

const formatMove = (move, language = "en") => {
    const moveObj = movesJSON[move];
    const moveLabel = moveObj?.[language] ?? move;
    return moveLabel;
}

export default formatMove;
