import Schedule from "./lib/Schedule.js";
import Task from "./lib/Task.js";

const schedule = new Schedule({
  ref: "schedule",
  insertFirst: "main",
  startDate: new Date(2025, 11, 1, 8),
  endDate: new Date(2025, 11, 1, 20),
  flex: 5,
  // Configure the Project with a path, and the Store or Model to use for the loaded data.
  project: {
    autoLoad: true,
    eventStore: {
      modelClass: Task,
    },
    transport: {
      load: {
        url: "data/data.json",
      },
    },

    // This config enables response validation and dumping of found errors to the browser console.
    // It's meant to be used as a development stage helper only so please set it to false for production systems.
    validateResponse: true,
  },
});
