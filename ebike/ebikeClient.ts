// client.js
// Required steps to create a servient for a client
const { Servient, Helpers } = require("@node-wot/core");
const { HttpClientFactory } = require('@node-wot/binding-http');

const servient = new Servient();
servient.addClientFactory(new HttpClientFactory(null));
const WoTHelpers = new Helpers(servient);

WoTHelpers.fetch("http://localhost:8080/smart-ebike").then(async (td) => {
    try {
        servient.start().then(async (WoT) => {
            // Then from here on you can consume the thing
            // i.e let thing = await WoT.consume(td) ...
            const thing = await WoT.consume(td)
            //initial state
            let availability = await (await thing.readProperty("availability")).value();
            console.log(availability)
            //set available
            await thing.writeProperty("availability", "available")
            availability = await (await thing.readProperty("availability")).value();
            console.log(availability)
            //set unavailable
            await thing.writeProperty("availability", "unavailable")
            availability = await (await thing.readProperty("availability")).value();
            console.log(availability)

            const startAction = await thing.invokeAction("start");
        });
    }
    catch (err) {
        console.error("Script error:", err);
    }
}).catch((err) => { console.error("Fetch error:", err); });
