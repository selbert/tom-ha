var jsonrpc = require('json-rpc-client')

var lightsClient = new jsonrpc({"path": "/var/run/lightsd/socket"})


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

sendLight
