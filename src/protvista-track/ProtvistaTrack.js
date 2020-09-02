import ProtvistaTrack from "protvista-track";
import _includes from "lodash-es/includes";
import FeatureShape from "./FeatureShape";

class ProtvistaShapeTrack extends ProtvistaTrack {
  connectedCallback() {
    super.connectedCallback();
    this._color = this.getAttribute("color");
    this._shape = this.getAttribute("shape");
    this._featureShape = new FeatureShape();
    this._layoutObj = this.getLayout();

    if (this._data) this._createTrack();

    this.addEventListener("load", (e) => {
      if (_includes(this.children, e.target)) {
        this.data = e.detail.payload;
      }
    });
  }
}

export default ProtvistaShapeTrack;
