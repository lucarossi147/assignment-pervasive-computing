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
            //waiting for the action to complete
            const startActionProperties = (await startAction.value());
            if (startActionProperties.message != null){
                console.log("=====================================")
                console.log(startActionProperties.message)
                console.log(startActionProperties.time)
                console.log("=====================================")
            }
            await new Promise(f => setTimeout(f, 5000));

            const stopAction = await thing.invokeAction("stop");
            const stopActionProperties = (await stopAction.value());
            if (stopActionProperties.message != null){
                console.log("=====================================")
                console.log(stopActionProperties.message)
                console.log(stopActionProperties.time)
                console.log("=====================================")
            }
            console.log("Total time spent: " + (stopActionProperties.time - startActionProperties.time))
        });
    }
    catch (err) {
        console.error("Script error:", err);
    }
}).catch((err) => { console.error("Fetch error:", err); });
