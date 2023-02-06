/* global mapboxgl */
import { Panel, StringHelper } from "@bryntum/schedulerpro";

// NOTE: You must use your own Mapbox access token
mapboxgl.accessToken =
  "<your-mapbox-accessToken>";

// A simple class containing a MapboxGL JS map instance
export default class MapPanel extends Panel {
  // Factoryable type name
  static get type() {
    return "mappanel";
  }

  // Required to store class name for IdHelper and bryntum.query in IE11
  static get $name() {
    return "MapPanel";
  }

  static get defaultConfig() {
    return {
      monitorResize: true,
      // Some defaults of the initial map display
      zoom: 11,
      lat: 40.7128,
      lon: -74.006,
      textContent: false,
    };
  }

  composeBody() {
    const result = super.composeBody();

    result.listeners = {
      click: "onMapClick",
      delegate: ".mapboxgl-marker",
    };

    return result;
  }

  construct(config) {
    const me = this;
    super.construct(config);
    const mapEl = me.bodyElement;

    // NOTE: You must use your own Mapbox access token
    me.map = new mapboxgl.Map({
      container: mapEl,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [me.lon, me.lat],
      zoom: me.zoom,
    });

    // First load the map and then setup our event listeners for store CRUD and time axis changes
    me.map.on("load", () => {
      me.eventStore.on("change", me.onStoreChange, me);
      me.timeAxis.on("reconfigure", me.onTimeAxisReconfigure, me);

      // If data loaded before the map, trigger onStoreChange manually
      if (me.eventStore.count) {
        me.onStoreChange({ action: "dataset", records: me.eventStore.records });
      }
    });
  }

  // When data changes in the eventStore, update the map markers accordingly
  onStoreChange(event) {
    switch (event.action) {
      case "add":
      case "dataset":
        if (event.action === "dataset") {
          this.removeAllMarkers();
        }
        event.records.forEach((eventRecord) =>
          this.addEventMarker(eventRecord)
        );
        break;

      case "remove":
        event.records.forEach((event) => this.removeEventMarker(event));
        break;

      case "update": {
        const eventRecord = event.record;

        this.removeEventMarker(eventRecord);
        this.addEventMarker(eventRecord);

        break;
      }

      case "filter": {
        const renderedMarkers = [];

        this.eventStore
          .query((rec) => rec.marker, true)
          .forEach((eventRecord) => {
            if (!event.records.includes(eventRecord)) {
              this.removeEventMarker(eventRecord);
            } else {
              renderedMarkers.push(eventRecord);
            }
          });

        event.records.forEach((eventRecord) => {
          if (!renderedMarkers.includes(eventRecord)) {
            this.addEventMarker(eventRecord);
          }
        });

        break;
      }
    }
  }

  // Only show markers for events inside currently viewed time axis
  onTimeAxisReconfigure() {
    this.eventStore.forEach((eventRecord) => {
      this.removeEventMarker(eventRecord);
      this.addEventMarker(eventRecord);
    });
  }

  // Puts a marker on the map, if it has lat/lon specified + the timespan intersects the time axis
  addEventMarker(eventRecord) {
    if (!eventRecord.address) return;

    const { lat, lon } = eventRecord.address;

    if (lat && lon && this.timeAxis.isTimeSpanInAxis(eventRecord)) {
      const color =
          eventRecord.eventColor ||
          eventRecord.resource?.eventColor ||
          "#f0f0f0",
        marker = new mapboxgl.Marker({
          color,
        })
          .setLngLat([lon, lat])
          .addTo(this.map);

      marker.getElement().id = eventRecord.id;

      eventRecord.marker = marker;
      marker.eventRecord = eventRecord;
      marker.addTo(this.map);
    }
  }

  removeEventMarker(eventRecord) {
    const marker = eventRecord.marker;

    if (marker) {
      marker.popup && marker.popup.remove();
      marker.popup = null;
      marker.remove();
    }
    eventRecord.marker = null;
  }

  removeAllMarkers() {
    this.eventStore.forEach((eventRecord) =>
      this.removeEventMarker(eventRecord)
    );
  }

  scrollMarkerIntoView(eventRecord) {
    const marker = eventRecord.marker;

    this.map.easeTo({
      center: marker.getLngLat(),
    });
  }

  onMapClick({ target }) {
    const markerEl = target.closest(".mapboxgl-marker");

    if (markerEl) {
      const eventRecord = this.eventStore.getById(markerEl.id);

      this.showTooltip(eventRecord);
      this.trigger("markerclick", { marker: eventRecord.marker, eventRecord });
    }
  }

  showTooltip(eventRecord, centerAtMarker) {
    const me = this,
      marker = eventRecord.marker;

    me.popup && me.popup.remove();

    if (centerAtMarker) {
      me.scrollMarkerIntoView(eventRecord);
    }

    const popup =
      (me.popup =
      marker.popup =
        new mapboxgl.Popup({
          offset: [0, -21],
        }));

    popup.setLngLat(marker.getLngLat());
    popup.setHTML(
      StringHelper.xss`<span class="event-name">${eventRecord.name}</span><span class="location"><i class="b-fa b-fa-map-marker-alt"></i>${eventRecord.shortAddress}<span>`
    );
    popup.addTo(me.map);
  }

  onResize() {
    // This widget was resized, so refresh the Mapbox map
    this.map?.resize();
  }
}

// Register this widget type with its Factory
MapPanel.initClass();
