import { Splitter, Toast } from "@bryntum/schedulerpro";
import Schedule from "./lib/Schedule.js";
import Task from "./lib/Task.js";
import MapPanel from "./lib/MapPanel.js";

const detectWebGL = () => {
  try {
    const canvas = document.createElement("canvas");
    document.body.appendChild(canvas);
    const supported = Boolean(canvas.getContext("webgl"));
    canvas.remove();
    return supported;
  } catch (e) {
    return false;
  }
};

let mapPanel;

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
  listeners: {
    eventClick: ({ eventRecord }) => {
      // When an event bar is clicked, bring the marker into view and show a tooltip
      if (eventRecord.marker) {
        mapPanel?.showTooltip(eventRecord, true);
      }
    },
    afterEventSave: ({ eventRecord }) => {
      if (eventRecord.marker) {
        mapPanel?.scrollMarkerIntoView(eventRecord);
      }
    },
  },
});

// A draggable splitter between the two main widgets
new Splitter({
  appendTo: "main",
});

if (detectWebGL()) {
  // A custom MapPanel wrapping the MapboxGL JS map. We provide it with the timeAxis and the eventStore
  // So the map can show the same data as seen in the schedule
  mapPanel = new MapPanel({
    ref: "map",
    appendTo: "main",
    flex: 2,
    eventStore: schedule.eventStore,
    timeAxis: schedule.timeAxis,
    listeners: {
      // When a map marker is clicked, scroll the event bar into view and highlight it
      markerclick: async ({ eventRecord }) => {
        await schedule.scrollEventIntoView(eventRecord, {
          animate: true,
          highlight: true,
        });
        schedule.selectedEvents = [eventRecord];
      },
    },
  });
} else {
  Toast.show({
    html: `ERROR! Cannot show map. WebGL is not supported!`,
    color: "b-red",
    style: "color:white",
    timeout: 0,
  });
}