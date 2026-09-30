/**
 * Retrieves the first letter(s) from a given text.
 */
const getFirstLetter = (text: string, numberLetter = 1) => {
  text = text.trim();
  if (text.split(' ').length === 1) {
    return text.substring(0, numberLetter);
  } else {
    let letter = '';
    text.split(' ').forEach((item: string, index: number) => {
      if (index < numberLetter) {
        letter += item.charAt(0);
      }
      return item;
    });
    return letter;
  }
};

export default getFirstLetter;
