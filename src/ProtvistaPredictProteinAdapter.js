import ProtvistaFeatureAdapter from "protvista-feature-adapter";

const scoreToColor = {
  "very low": "#4040a0",
  low: "#40a0a0",
  intermediate: "#40a040",
  high: "#a0a040",
  "very high": "#a04040"
};

const extractScore = (description) => {
  const pattern = /\((Very Low|Low|Intermediate|High|Very High|)\)/ig;
  const results = pattern.exec(description); // returns e.g. [ "(High)", "High" ]
  if (results && results.length === 2) {
    return results[results.length - 1].toLowerCase();
  }
  return undefined;
};

const getColor = feature => {
  if (feature.category === "CONSERVATION_(CONSEQ)" || feature.category === "RELATIVE_B-VALUE_(PROF-BVAL)") {
    const score = extractScore(feature.type);
    return scoreToColor[score];
  } else if (feature.category === "SOLVENT_ACCESSIBILITY_(REPROF)") {
    if (feature.type === "Exposed") {
      return "#a04040";
    } else if (feature.type === "Buried") {
      return "#4040a0";
    }
  }
  return undefined;
};

const formatTooltip = feature => {
  return `
    ${
      feature.sequence
        ? `<h5>Sequence</h5><p>${feature.sequence}</p>`
        : ""
    }
    ${
      feature.q_value
        ? `<h5>Q-Value</h5><p>${feature.q_value}</p>`
        : ""
    }
    ${
      feature.peptide_id
        ? `<h5>Peptid ID</h5><a href=${feature.peptide_id} style="color:#FFF" target="_blank">Link</a>`
        : ""
    }
    ${
      feature.description
        ? `<h5>Description</h5><p>${feature.description}</p>`
        : ""
    }
    `;
};

export const transformData = data => {
  let adaptedData = [];
  if (data.features && data.features.length > 0) {
    adaptedData = data.features.map(feature => {
      return Object.assign(feature, {
        tooltipContent: formatTooltip(feature),
        start: feature.begin,
        color: getColor(feature) || feature.color
      });
    });
  }
  return adaptedData;
};

class ProtvistaPredictProteinAdapter extends ProtvistaFeatureAdapter {
  parseEntry(data) {
    this._adaptedData = transformData(data);
    return this._adaptedData;
  }
}

export default ProtvistaPredictProteinAdapter;
