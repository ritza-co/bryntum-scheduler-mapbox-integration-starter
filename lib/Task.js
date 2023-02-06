import { EventModel } from "@bryntum/schedulerpro";

// Simple task class with an extra address field (which can be edited with the AddressSearchField)
export default class Task extends EventModel {
  static get fields() {
    return [
      { name: "duration", defaultValue: 1 },
      { name: "durationUnit", defaultValue: "h" },
    ];
  }
}
