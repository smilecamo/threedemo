var myViewer = {
  viewer: null,
  anno: null,

  init: function () {
    this.initCurtainSyncViewer();
    this.initViewActions();
    this.initModeActions();
    this.initZoomActions();
  },

  initCurtainSyncViewer: function () {
    var container = document.querySelector("#viewer");
    var images = [
      {
        key: "vis",
        tileSource:
          "https://theleidencollection.iiifhosting.com/iiif/8e3d19d335208e49762884ef22f748f105d656f6bff9229e2d45ce0dd18a8fe/info.json",
        shown: true,
      },
      {
        key: "xra",
        tileSource:
          "https://theleidencollection.iiifhosting.com/iiif/414651b43289b76c10777455db288ed5b43eae4c1818b52c90fb316db3b20075/info.json",
        shown: true,
      },
      {
        key: "irr",
        tileSource:
          "https://theleidencollection.iiifhosting.com/iiif/7bf215d80e55221b9ad70edd504d717c5ba93d6455cb863c647a1e94f34c6179/info.json",
      },
    ];
    const osdOptions = {
      id: "my-viewer",
      showNavigationControl: false,
      maxZoomPixelRatio: 2,
      minZoomLevel: 1,
      maxZoomLevel: 20,
      // 其他自定义选项...
    };
    this.viewer = new CurtainSyncViewer(
      {
        container: container,
        images: images,
      },
      {
        updateBrightness: function () {
          // 在这里不执行任何操作,以取消默认的亮度调整
        },
        updateContrast: function () {
          // 在这里不执行任何操作,以取消默认的对比度调整
        },
      }
    );
  },

  initAnnotorious: function () {
    try {
      console.log("Initializing Annotorious");
      this.anno = OpenSeadragon.Annotorious(this.viewer, {
        container: document.getElementById("viewer"),
      });
      this.anno.loadAnnotations("annotations.w3c.json");
      console.log("Annotorious initialized:", this.anno);

      // Attach handlers to listen to events
      this.anno.on("createAnnotation", function (a) {
        console.log("Annotation created:", a);
      });
    } catch (error) {
      console.error("Error initializing Annotorious:", error);
    }
  },

  initViewActions: function () {
    $(".view-trigger").on("click", function (e) {
      var thisView = $(this);
      e.preventDefault();
      thisView.toggleClass("active");
      myViewer.viewer.setImageShown(
        thisView.data("type"),
        thisView.hasClass("active")
      );
    });
  },

  initModeActions: function () {
    $(".mode-trigger").on("click", function (e) {
      var thisMode = $(this);
      e.preventDefault();

      if ($(window).width() < 768) {
        alert(
          "Modes are not available on small screens. Please view on a larger screen to access modes."
        );
        return false;
      }

      $(".mode-trigger").removeClass("active");
      thisMode.addClass("active");
      myViewer.viewer.setMode(thisMode.data("mode"));
    });
  },

  initZoomActions: function () {
    $(".zoom-trigger").on("click", function () {
      var thisZoom = $(this);

      if (thisZoom.data("type") === "in") {
        myViewer.viewer.zoomIn();
      } else {
        myViewer.viewer.zoomOut();
      }
    });
  },
};

$(document).ready(function () {
  myViewer.init();
});
