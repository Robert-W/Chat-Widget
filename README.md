ChatWidget
==========

<p>Custom dojo templated widget that uses socket.io and express to load a chatroom style widget on to the map so that users of the app can communicate with each other while they view the map.  Also demonstrates collaborative editing so users can work on editing geometry simultaneously.  This is not a widget or structured well for scalability, just proof of concept.</p>

<p><strong>Note:</strong> This can also be used as a template or reference when trying to create new custom dojo widgets.  Look at the ChatWidget.js file for a reference on how to setup the structure of a widget.  It requires obviously Dojo, and a templated html file, and a css file with base styles.  Base styles could be added inline so there is no dependency on a css file or the user can just include the css file or copy its contents to their css file and then concat the css file's.</p>

<h3>Dependencies</h3>
* node.js
* socket.io
* express

<h3>Use</h3>
<p>Start chat server using <pre>node chatServer</pre> on command line. Then open your browser to <pre>http://localhost:8000/index.html</pre> or if your serving on a different URL and/or port, customize the port number in chatServer.js by changing the following line to use whatever port you want <pre>chatServer.listen(8000);</pre>and the socketURL in Main.js to be the <pre>&lt;your-url>:&lt;port#>/index.html</pre></p>