var uuid = require('uuid');
var jsonrpc = require('json-rpc-client')
var fliclib = require("./flic/fliclibNodeJs");
var FlicClient = fliclib.FlicClient;
var FlicConnectionChannel = fliclib.FlicConnectionChannel;
var FlicScanner = fliclib.FlicScanner;
var config = require('config');


var lightsClient = new jsonrpc({"path": "/var/run/lightsd/socket"})
var flicClient = new FlicClient("localhost", 5551);


function sendLightMethod(method, target, callback) {
  console.log(method + " " + target)
  lightsClient.connect().then(function()
  {
    console.log("connected");
    lightsClient.send(method, [target]).then(function(reply)
    {
      console.log(reply);
      if (callback)
        callback(reply.result)
    },
    function(error)
    {
      console.error(error)
    })
  },
  function(error)
  {
    console.error(error)
  })
}

var buttonTimers = {}

function listenToButton(bdAddr, buttonUpCallBack) {
  var cc = new FlicConnectionChannel(bdAddr);
  flicClient.addConnectionChannel(cc);
  cc.on("buttonUpOrDown", function(clickType, wasQueued, timeDiff) {
    if ("ButtonDown" === clickType && timeDiff < 5) {
      buttonTimers[bdAddr] = setTimeout(function() {
          buttonTimers[bdAddr] = null;
          buttonLongClicked(bdAddr);
        }, 1000);
    }
    console.log(bdAddr + " " + clickType + " " + (wasQueued ? "wasQueued" : "notQueued") + " " + timeDiff + " seconds ago");
    if ("ButtonUp" === clickType) {
      if (buttonTimers[bdAddr]) {
        clearTimeout(buttonTimers[bdAddr]);
        if (timeDiff < 5) {
          buttonClicked(bdAddr);
        }
      }
      buttonTimers[bdAddr] = null;
    }
  });
  cc.on("connectionStatusChanged", function(connectionStatus, disconnectReason) {
    console.log(bdAddr + " " + connectionStatus + (connectionStatus == "Disconnected" ? " " + disconnectReason : ""));
  });
}
var toggleConfig = config.get("Toggles");
console.dir(toggleConfig);
function buttonClicked(button) {
  sendLightMethod("power_on",toggleConfig[button]); 
}

function buttonLongClicked(button) {
  sendLightMethod("power_off",toggleConfig[button]);
}


for (var button in toggleConfig) {
  listenToButton(button);  
};

