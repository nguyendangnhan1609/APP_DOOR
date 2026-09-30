/**
 * Calculates the number of pages based on the height of the document body.
 */
export default ({
  height = 28,
  minusNumber = 4,
  element = document.getElementsByTagName('tbody')[0],
}: {
  readonly height?: number;
  readonly minusNumber?: number;
  readonly element: HTMLElement;
}) =>
  Math.floor(
    (document.body.getBoundingClientRect().height - element.getBoundingClientRect().top) / height,
  ) - minusNumber;
