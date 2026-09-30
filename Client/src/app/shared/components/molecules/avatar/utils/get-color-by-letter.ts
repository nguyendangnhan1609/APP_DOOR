import constants from '../constants';

/**
 * Returns a color based on the first letter of the given text.
 */
const getColorByLetter = (text: string) => {
  text = text.trim();
  return constants.COLOR[
    constants.LETTER.indexOf(text.charAt(0).toUpperCase()) % (constants.COLOR.length - 1)
  ];
};

export default getColorByLetter;
