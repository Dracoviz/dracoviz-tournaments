import Filter from "bad-words";
const filter = new Filter();
filter.addWords("racist", "tinder", "noggers", "nogger"); //Darn Pocket

const cleanText = (text) => {
  const splitRegex = /\b/;
  if (splitRegex.exec(text)?.[0] == null || filter?.clean == null || text == null || text.trim() === "") {
    return text;
  }
  if (text.replace(/[^\x00-\x7F]/g, "").replaceAll(".").trim() === "") {
    return text;
  }
  const filteredText = filter.clean(text);
  return filteredText;
};

export default cleanText;
