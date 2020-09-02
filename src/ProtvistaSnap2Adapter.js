import ProtvistaVariationAdapter from "protvista-variation-adapter";

const SCORE_SIGNIFICANEC_THRESHOLD = 40;

const formatTooltip = (variation) => {
  return `
  ${variation.name ? `<h5>Name:</h5><p>${variation.name}</p>` : ""}
  ${variation.start ? `<h5>Position:</h5><p>${variation.start}</p>` : ""}
  ${variation.score ? `<h5>Score:</h5><p>${variation.score}</p>` : ""}
  `;
};

const scoreToSize = score => {
  const minSize = 2;
  const maxSize = 6;
  const normalizedScore = Math.abs(score / 100.0); // Normalize to range (0, 1);
  return normalizedScore * (maxSize - minSize) + minSize;
};

export const transformData = data => {
  if (!data) return null;

  const { sequence, variants } = data;

  if (!sequence || !variants || variants.length === 0) return null;

  const updatedVariants = variants
    .filter(variation => Math.abs(variation.score) > SCORE_SIGNIFICANEC_THRESHOLD)
    .map(variation => {
      return Object.assign(variation, {
        size: scoreToSize(variation.score),
        color: variation.color || (variation.score < 0 ? "blue" : "red")
      });
    })
    .map(variation => {
      return Object.assign(variation, {
        tooltipContent: formatTooltip(variation)
      });
    });

  return {
    sequence,
    variants: updatedVariants
  };
};

class ProtvistaSnap2Adapter extends ProtvistaVariationAdapter {
  parseEntry(data) {
    this._adaptedData = transformData(data);
  }
}

export default ProtvistaSnap2Adapter;
