define([
  "dojo/Evented",
  "dojo/_base/declare",
  "dijit/_WidgetBase",
  "dijit/_OnDijitClickMixin",
  "dijit/_TemplatedMixin",
  "dojo/on",
  "dojo/_base/array",
  // Template String
  "dojo/text!/template/ChatWidget.html"
],
function(Evented,declare,_WidgetBase,_OnDijitClickMixin,_TemplatedMixin,on,arrayUtils,widgetTemplate){

  var handles = [];
  // socket defined globally in App.socket, if not needed globally , define var socket, next to handles

  /* Evented allows for the widget to emit events that users can subscribe to via
   * this.emit("eventName",{
   *    data: myData
   * });
   *
   * _TemplatedMixin
   * Mixin for widgets that are instantiated from a template
   * (notably the templateString property and placeholders in template)
   *
   * _OnDijitClickMixin
   * Mixing in this class will make _WidgetBase.connect(node, "ondijitclick", ...) work.
   * It also used to be necessary to make templates with ondijitclick work,
   * but now you can just require dijit/a11yclick.
   *
   * _WidgetBase
   * Future base class for all Dijit widgets. _Widget extends this class adding support for various
   * features needed by desktop.  Provides stubs for widget lifecycle methods for subclasses to extend,
   * like postMixInProperties(), buildRendering(), postCreate(), startup(), and destroy(), and also
   * public API methods like set(), get(), and watch().
   */
  return declare([_WidgetBase, _OnDijitClickMixin, _TemplatedMixin, Evented],{
    templateString: widgetTemplate,
    options: {
      socketURL: null
    },
    constructor: function(options,srcRefNode){
      // Safely mix settings and defaults
      declare.safeMixin(this.options,options);
      // Node where the widget will live
      this.domNode = srcRefNode;

      this.set("socketURL",this.options.socketURL);

      this._defaults = {
        submitMsgText : options.submitMsgText || "Post Message",
        chatMsgPlaceholder: options.chatMsgPlaceholder || "Enter Message..."
      };

    },

    startup: function() {
      // Add Initialization Code Here
      if (!this.socketURL) {
        this.destroy();
        console.error('A URL and port for the socket must be specified.');
      }

      if (!io) {
        this.destroy();
        console.error("This widget is dependent on socket.io.  Make sure it is included in your index.html.");
      }

      this._init();

    },

    destroy: function() {
      arrayUtils.forEach(handles,function(handle){
        handle.remove();
      });
      App.socket.disconnect();
      this.inherited(arguments);
    },

    /***************************/
    /**** Public Functions *****/
    /***************************/

    /***************************/
    /**** Private Functions ****/
    /***************************/
    _init: function() {
      App.socket = App.socket || io.connect(this.socketURL,{
        reconnect: false
      });
      App.socket.on('connect',function(){
        App.socket.emit('newUser',prompt('Enter your name please.'));
      });
      App.socket.on('msgReceived',function(username,data){
        var chatroom = document.getElementById('chatMessageBoard');
        var message = document.createElement('span');
        if (username === 'SERVER')
          message.innerHTML = "<span class='serverInfo'>"+username+": "+data+'</span><br>';
        else
          message.innerHTML = "<span class='userNames'>"+username+":</span> "+data+'<br>';
        chatroom.appendChild(message);
        chatroom.scrollTop = chatroom.scrollHeight;
      });
      App.socket.on('disconnect',function(){
        App.socket.disconnect();
      });
      document.getElementById('postMessage').onclick = function(){
        var text = document.getElementById('chatMessage').value;
        App.socket.emit('sendChat',text);
        document.getElementById('chatMessage').value = '';
      };

      document.getElementById('chatMessage').onkeypress = function(evt){
        if (evt.keyCode === 13) {
          var text = document.getElementById('chatMessage').value;
          App.socket.emit('sendChat',text);
          document.getElementById('chatMessage').value = '';
        }
      };
    }

  });

});