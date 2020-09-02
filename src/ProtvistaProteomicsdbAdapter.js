import ProtvistaFeatureAdapter from "protvista-feature-adapter";

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
          `;
};

export const transformData = data => {
  let adaptedData = [];
  if (data && data.length !== 0) {
    adaptedData = data.features.map(feature => {
      return Object.assign(feature, {
        tooltipContent: formatTooltip(feature),
        start: feature.start || feature.begin,
        shape: feature.shape || {
          rlShape: feature.rl_shape,
          tShape: feature.t_shape,
          bShape: feature.b_shape
        }
      });
    });
  }
  return adaptedData;
};

class ProtvistaProteomicsdbAdapter extends ProtvistaFeatureAdapter {
  parseEntry(data) {
    this._adaptedData = transformData(data);
    return this._adaptedData;
  }
}

export default ProtvistaProteomicsdbAdapter;
