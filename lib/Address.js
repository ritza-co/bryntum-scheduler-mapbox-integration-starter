import { Model } from "@bryntum/schedulerpro";

// The data model for a task address
export default class Address extends Model {
  static get fields() {
    return ["display_name", "lat", "lon"];
  }
}
