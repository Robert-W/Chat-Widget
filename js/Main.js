define([
  "dojo/parser",
  "esri/map",
  "Utils/ChatWidget",
  "esri/graphic",
  "esri/toolbars/draw",
  "esri/geometry/Polygon",
  "esri/symbols/SimpleFillSymbol",
  "esri/symbols/SimpleLineSymbol",
  "dojo/on",
  "dojo/dom",
  "dojo/_base/Color"],
  function(parser,Map,ChatWidget,Graphic,Draw,Polygon,SFS,SLS,on,dom,Color){

    return {

      launchApp: function() {
        var self = this;
        parser.parse();
        self.map = new Map("map",{
          center: [-56.049, 38.485],
          zoom: 3,
          basemap: "gray"
        });
        if(self.map.loaded){
          self.addComponents();
        } else {
          on.once(self.map,"load",function(){
            self.addComponents();
          });
        }

      },

      addComponents: function() {
        var self = this;
        var widget = new ChatWidget({
          socketURL: App.socketURL
        },"myChatWidget");
        widget.startup();
        self.fillSymbol = new SFS(SFS.STYLE_SOLID,new SLS(SLS.STYLE_SOLID,new Color([255,0,0]),1),
                          new Color([255,255,255,0.75]));
        self.drawToolbar = new Draw(self.map);
        self.drawToolbar.setFillSymbol(self.fillSymbol);
        self.bindEvents();
      },

      bindEvents: function() {
        var self = this;

        on(dom.byId("freehandPoly"),"click",function(){
          self.drawToolbar.activate(Draw["FREEHAND_POLYGON"]);
        });

        on(dom.byId("polygon"),"click",function(){
          self.drawToolbar.activate(Draw["POLYGON"]);
        });

        App.socket = App.socket || io.connect(App.socketURL,{
          reconnect: false
        });

        // bind self to the function handling the event or else all this/self calls in broadcastGeom
        // will refer to the window and not this class, this keeps the context correct
        self.drawToolbar.on('draw-end',self.broadcastGeom.bind(self));

        App.socket.on('newGeom',self.addGeomFromSocket.bind(self));

      },

      broadcastGeom: function(event) {
        var self = this;
        self.drawToolbar.deactivate();
        self.map.graphics.add(new Graphic(event.geometry,self.fillSymbol));
        App.socket.emit('geomReceived',event.geometry);
      },

      addGeomFromSocket: function(newGeom) {
        var self = this;
        var geom = new Polygon(newGeom);
        var graphic = new Graphic(geom,self.fillSymbol);
        self.map.graphics.add(graphic);
      }

    }

  });