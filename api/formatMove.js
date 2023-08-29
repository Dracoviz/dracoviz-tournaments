const formatMove = (move) => {
    const words = move.split("_");
    return words.map((word) => { 
        return word[0].toUpperCase() + word.substring(1).toLowerCase(); 
    }).join(" ");
}

export default formatMove;
