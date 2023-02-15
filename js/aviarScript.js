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
  
  const colorsB = [[255, 255, 115, 0.6], [255, 255, 255, 0.6], [163, 255, 115, 0.6], [115, 223, 255, 0.6]];

  const commonPropertiesB = {
    type: "simple-marker",
    // width: "4px",
    size: "10px",
    style: "circle",
    outline: null,
  };

  // Symbol for Interstate highways
  const PetSym = {
    ...commonPropertiesB,
    color: colorsB[0]
  };

  // Symbol for U.S. Highways
  const DomesticSym = {
    ...commonPropertiesB,
    color: colorsB[1]
  };

  // Symbol for state highways
  const WildSym = {
    ...commonPropertiesB,
    color: colorsB[2]
  } ;
// Symbol for other major highways
const CaptiveSym = {
  ...commonProperties,
  color: colorsB[3]
}/*;
// Symbol for other major highways
const A5Sym = {
  ...commonProperties,
  color: colorsB[4]
}; */

  // Symbol for other major highways
  //   const otherSym = {
  //   ...commonProperties,
  //   color: colors[5]
  //  };



  const brotesRenderer = {
    type: "unique-value", // autocasts as new UniqueValueRenderer()
    legendOptions: {
      title: "Especies"
    },
    //defaultSymbol: otherSym,
    //defaultLabel: "Other",
    field: "is_wild",

    uniqueValueInfos: [
      {
        value: "Wild", // code for U.S. highways
        symbol: WildSym,
        label: "Wild"
      },
      {
        value: "Domestic", // code for U.S. highways
        symbol: DomesticSym,
        label: "Domestic"
      },
      {
        value: "Pet", // code for interstates/freeways
        symbol: PetSym,
        label: "Pet"
      }/* ,
    {
      value: "Captive", // code for U.S. highways
      symbol: CaptiveSym,
      label: "Captive"
    },
    {
      value: "A5", // code for U.S. highways
      symbol: A5Sym,
      label: "Major road"
    } */
    ]
  };

  // Request feature layers and overwrite renderer https://gis.inia.es/server/rest/services/Hosted/SARS_animals_OIE/FeatureServer
  const featureLayerBrotes = new FeatureLayer({
    url: "https://gis.inia.es/server/rest/services/CISA/capa_sars_XY/MapServer/0",
    copyright: "Carlos Blanco Urbina",
    title: "Brotes",
    outFields: ['*'],
    visible: true,
    renderer: brotesRenderer,
    
    
    popupTemplate: {
      title: "SARS-CoV-2 in animals",
      content: getInfoBrotes,
      visible: false,
      returnGeometry: true,
      fieldInfos: [
        {
          fieldName: 'Reporting_date',
          format: {
            dateFormat: 'short-date'
          }
        }
      ],
    },
  });


  function getInfoBrotes(feature) {
    content = "<p>Número de casos: <b>{cases}</b> " +
      "<ul><li>Region: {Region}.</li>" +
      "<ul><li>Country: {Country}.</li>" +
      "<ul><li>Location: {Location_name}.</li>" +
      "<li>Report date: {Reporting_date}.</li>" +
      "<li>Species: {Species}.</li>" +
      "<li>Scientific name: {Scientific_name}.</li>" +
      "<li>Type animal: {Type_animal}.</li>" ;

    return content;

  }

  // Create the Map
  const map = new Map({
    basemap: "hybrid",
    layers: [featureLayerBrotes]
  });

  // Create the SceneView and set initial camera
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
