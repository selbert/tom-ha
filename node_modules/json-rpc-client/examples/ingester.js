var jsonrpc = require('../')

// create client and connect
var client = jsonrpc({ port: 1338, host: '10.1.3.31'}, function(error)
{
    // check if connection failed
    if (error)
        return console.log(error)

    client.send('addChannel', ["test","udp","232.235.0.73", 1234])
})

// catch generic errors
client.on('error', function(error)
{
    console.log(error)
})

client.on('close', function()
{
    console.log('close called')
})
