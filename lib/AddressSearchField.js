import { Combo } from "@bryntum/schedulerpro";
import Address from "./Address.js";

// A custom remote search field, querying OpenStreetMap for addresses.
export default class AddressSearchField extends Combo {
  // Factoryable type name
  static get type() {
    return "addresssearchfield";
  }

  static get $name() {
    return "AddressSearchField";
  }

  static get configurable() {
    return {
      clearable: true,
      displayField: "display_name",
      // Setting the value field to null indicates we want the Combo to get/set address *records* as opposed to the
      // id of an address record.
      valueField: null,
      keyStrokeFilterDelay: 1000,
      minChars: 8,
      store: {
        modelClass: Address,
        readUrl: "https://nominatim.openstreetmap.org/?format=json&q=",
        restfulFilter: true,
        fetchOptions: {
          // Please see MDN for fetch options: https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch
          credentials: "omit",
        },
      },
      // Addresses can be long
      pickerWidth: 450,
      validateFilter: false,
      listCls: "address-results",
      // Custom list item template to show a map icon with lat + lon
      listItemTpl: (address) => `<i class="b-fa b-fa-map-marker-alt"></i>
                <div class="address-container">
                    <span class="address-name">${address.display_name}</span>
                    <span class="lat-long">${address.lat}°, ${address.lon}°</span>
                </div>
            `,
    };
  }
}

AddressSearchField.initClass();
