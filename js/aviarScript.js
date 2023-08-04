require([
  "esri/Map",
  "esri/views/SceneView",
  "esri/layers/FeatureLayer",
  "esri/renderers/SimpleRenderer",
  "esri/symbols/LineSymbol3DLayer",
  "esri/symbols/LineSymbol3D",
  "esri/widgets/TimeSlider",
  "esri/widgets/Expand",
  "esri/widgets/Legend",
  "esri/widgets/BasemapGallery",
  "esri/widgets/Home",
  "esri/widgets/ScaleBar",
  "esri/widgets/Search",
  "esri/tasks/QueryTask",
  "esri/tasks/support/Query",
  "esri/Graphic",

], (Map,
  SceneView,
  FeatureLayer,
  SimpleRenderer,
  LineSymbol3DLayer,
  LineSymbol3D,
  TimeSlider,
  Expand,
  Legend,
  BasemapGallery,
  Home,
  ScaleBar,
  Search,
  QueryTask,
  Query,
  Graphic) => {

  // Request feature layers and overwrite renderer
  const featureLayerBrotes = new FeatureLayer({
    url: "https://gis.inia.es/server/rest/services/CISA/brotes_SARS/MapServer/0",
    copyright: "CISA-INIA-CSIC",
    title: "Brotes",
    outFields: ['*'],
    visible: true,

    renderer: {
      type: "simple",
      field: "Types",

      symbol: {
          type: "simple-marker",
          label: "Type animal",
          style: "circle",
          size: "20px",
          outline: null,
      },

      label: "Type animal",
      visualVariables: [

          {
              type: "color",
              field: "Type_animal_value",
              stops: [
                  {
                      value: 3,
                      color: [255, 255, 115, 0.6],
                      label: "Pet",
                  }, {
                      value: 2,
                      color: [255, 255, 255, 0.6],
                      label: "Domestic",
                  },
                  {
                      value: 4,
                      color: [163, 255, 115, 0.6],
                      label: "Wild",
                  },
                  {
                      value: 1,
                      color: [115, 223, 255, 0.6],
                      label: "Captive",
                  }
              ]
          },

      ],

  },

    popupTemplate: {
      title: "SARS-CoV-2 in animals",
      content: getInfoBrotes,
      visible: false,
      returnGeometry: true,
      fieldInfos: [
        {
          fieldName: 'reporting_date',
          format: {
            dateFormat: 'short-date'
          }
        }
      ],
    },
  });


  function getInfoBrotes(feature) {
    content = "<p>Número de casos: <b>{cases}</b> " +
      "<ul><li>Region: {region}.</li>" +
      "<ul><li>Country: {country}.</li>" +
      "<ul><li>Location: {location_name}.</li>" +
      "<li>Report date: {reporting_date}.</li>" +
      "<li>Species: {Species}.</li>" +
      "<li>Scientific name: {scientific_name}.</li>" +
      "<li>Type animal: {type_animal}.</li>" ;

    return content;

  }

  // Create the Map
  const map = new Map({
    basemap: "hybrid",
    layers: [featureLayerBrotes]
  });

  // Create the SceneView and set initial camera ffff
  const view = new SceneView({
    container: "viewDiv",
    map: map,
    camera: {
      position: {
        latitude: 25.00000,
        longitude: 20.00000,
        z: 10000000
      },
      tilt: 11.5,
      heading: 1
    },


    highlightOptions: {
      color: "cyan"
    }
  });

  view.constraints = {

    minScale: 147000000
  };

  // Agregar la leyenda
  const legendExpand = new Expand({
    collapsedIconClass: "esri-icon-legend",
    expandIconClass: "esri-icon-legend",
    expandTooltip: "Legend",
    view: view,
    content: new Legend({
      view: view
    }),
    expanded: false
  });
  view.ui.add(legendExpand, "top-left");


  //// SCALEBAR

  var scaleBar = new ScaleBar({
    view: view,
    unit: "metric",
    estilo: "line",
  });
  // Add widget to the bottom left corner of the view
  view.ui.add(scaleBar, {
    position: "bottom-right",

  });

  /// SEARCH WIDGET
  var searchWidget = new Search({
    view: view
  });
  // Add the search widget to the top right corner of the view
  view.ui.add(searchWidget, {
    position: "top-right"
  });

  /// WIDGET DE MAPAS BASES

  var basemapGallery = new BasemapGallery({
    view: view,
    container: document.createElement("div")
  });

  /// BASEMAP GALLERY

  // Create an Expand instance and set the content
  // property to the DOM node of the basemap gallery widget
  // Use an Esri icon font to represent the content inside
  // of the Expand widget
  var bgExpand = new Expand({
    collapsedIconClass: "esri-icon-basemap",
    expandIconClass: "esri-icon-basemap",
    expandTooltip: "Mapas",
    content: basemapGallery,
    view: view
  });

  // close the expand whenever a basemap is selected
  basemapGallery.watch("activeBasemap", function () {
    var mobileSize =
      view.heightBreakpoint === "xsmall" ||
      view.widthBreakpoint === "xsmall";

    if (mobileSize) {
      bgExpand.collapse();
    }
  });

  // Add the expand instance to the ui

  view.ui.add(bgExpand, "top-right");

  /// WIDGET DE HOME PARA LA VISTA INICIAL
  var homeBtn = new Home({
    view: view,

  });

  // Add the home button to the top left corner of the view
  view.ui.add(homeBtn, "top-right");

  ///TIMESLIDER DE BROTES

  const timeSliderBrotes = new TimeSlider({
    container: "timeSliderBrotes",
    // la propiedad "playRate" del widgetb es el tiempo (en milisegundos) entre los pasos de la animación. Este valor predeterminado es 1000.
    playRate: 100,
    view: featureLayerBrotes,
    stops: {
      interval: {
        value: 1,
        unit: "days"
      }
    }
  });
  view.ui.add(timeSliderBrotes, "manual");

  // espera hasta que se cargue la vista de capa
  view.whenLayerView(featureLayerBrotes).then(function (lv) {
    layerViewBrotes = lv;

    // hora de inicio del control deslizante de tiempo
    const startBrotes = new Date(2020, 0, 1);
    /* startBrotes.setHours(0, 0, 0, 0);
    startBrotes.setDate(startBrotes.getDate());
    startBrotes.setDate(startBrotes.getDate() - 1095); */

    const LastMonday = new Date();
    LastMonday.setHours(0, 0, 0, 0);
    LastMonday.setDate(LastMonday.getDate());

    // set time slider's full extent to
    // until end date of layer's fullTimeExtent
    timeSliderBrotes.fullTimeExtent = {
      start: startBrotes,
      end: LastMonday
    };
    const endBrotes = new Date(LastMonday);
    endBrotes.setDate(endBrotes.getDate() - 165);

    timeSliderBrotes.values = [endBrotes, LastMonday];
  });

});
