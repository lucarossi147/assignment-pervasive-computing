// server
// Required steps to create a servient for creating a thing
const Servient = require('@node-wot/core').Servient;
const HttpServer = require('@node-wot/binding-http').HttpServer;

interface EBike {
    upTime: number;
    position: Position;
    battery: number;
    pressureFrontWheel: number;
    pressureBackWheel: number;
    altitude: number;
    availability: Availability;
    maintenanceNeeded: boolean;
}

interface Position {
    lat: number;
    lng: number;
}

enum Availability {
    Available,
    Unavailable,
    Booked,
}

let eBike: EBike
const servient = new Servient();

servient.addServer(new HttpServer());

function availabilityAsString(availability:Availability): String {
    switch (availability) {
        case Availability.Available:
            return "available";
        case Availability.Booked:
            return "booked";
        default:
            return "unavailable";
    }
}
function stringToAvailability(availability: String): Availability {
    switch (availability){
        case "available":
            return Availability.Available;
        case "booked":
            return Availability.Booked;
        default:
            return Availability.Unavailable;
    }
}
//TODO implement something more serious
function notify(email, msg) {
    console.log(email)
    console.log(msg)
}
//actual implementation may differ from sensor to sensor
function readFromSensor(upTo: number = 100){
    return Math.floor(Math.random()*upTo)
}
async function init(){
    let WoT = await servient.start()

    // Then from here on you can use the WoT object to produce the thing
    // i.e WoT.produce({.....})
    let thing = await WoT.produce({
        title: 'Smart eBike',
        description: 'A Smart eBike, equipped with several sensors',
        properties:{
            battery: {
                type: "number",
                description: 'Current battery level.',
                minimum:0,
                maximum:100,
            },
            maintenanceNeeded: {
                type: "boolean",
                description: 'True if maintenance is needed',
            },
            pressureFrontWheel: {
                type: "number",
                description: 'Current pressure level of the front wheel expressed in bar.',
                minimum:0,
            },
            pressureBackWheel: {
                type: "number",
                description: 'Current pressure level of the back wheel expressed in bar.',
                minimum:0,
            },
            altitude:{
                type: "number",
                description: 'Current altitude expressed in meters.',
            },
            speedometer:{
                type: "number",
                description: 'Current speed expressed in Km/h.',
            },
            temperature:{
                type: "number",
                description: "Current temperature expressed in Celsius degrees",
            },
            position:{
                type: "object",
                description: "Current position",
                position:{
                    lat: "number",
                    lng: "number",
                }
            },
            availability:{
                type:"string",
                description: "Availability of the eBike, e.g. available, unavailable, booked",
                enum: [
                    "available",
                    "unavailable",
                    "booked",
                ],
            },
            upTime: {
                type: "number",
                description: 'The total upTime of the eBike.',
                minimum:0,
            }
        },
        actions:{
            start: {
                description: 'Start to use the eBike',
                output: {
                    type: "string",
                    description: 'returns the timestamp',
                    properties:{
                        time:{
                            type: "string",
                        }
                    }
                }
            },
            stop: {
                description: 'Stopped to use the eBike',
                output: {
                    type: "number",
                    description: 'returns the price of the ride',
                    properties:{
                        time:{
                            type: "string",
                        }
                    }
                }
            }
        },
        events:{
            lowBattery:{
                description:'Battery is running low and need to be replaced',
                data:{
                    type:"string",
                }
            }
        }
    })

    eBike = {
        altitude: readFromSensor(),
        battery: readFromSensor(),
        position: {lat : readFromSensor(), lng : readFromSensor()},
        pressureBackWheel: readFromSensor(10),
        pressureFrontWheel: readFromSensor(10),
        upTime: readFromSensor(),
        availability: Availability.Available,
        maintenanceNeeded: false,
    }

    thing.setPropertyReadHandler("position", async () => eBike.position);
    thing.setPropertyReadHandler("battery", async () => eBike.battery);
    thing.setPropertyReadHandler("upTime", async () => eBike.upTime);
    thing.setPropertyReadHandler("pressureBackWheel", async () => eBike.pressureBackWheel);
    thing.setPropertyReadHandler("pressureFrontWheel", async () => eBike.pressureFrontWheel);
    thing.setPropertyReadHandler("altitude", async () => eBike.altitude);
    thing.setPropertyReadHandler("availability", async () => availabilityAsString(eBike.availability))
    thing.setPropertyReadHandler("speedometer", async () => readFromSensor(35))

    thing.setPropertyWriteHandler("availability", async (val, options) => {
        eBike.availability = stringToAvailability(await val.value());
        if (eBike.availability == Availability.Unavailable) {
            notify("company@mail.com", "need to check this one")
        }
    })


    // Finally expose the thing
    thing.expose().then(() => {
        console.info(`${thing.getThingDescription().title} ready`);
    });
    console.log(`Produced ${thing.getThingDescription().title}`);
}

init().catch((e) => console.log(e))
