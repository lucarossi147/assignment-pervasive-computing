// server
// Required steps to create a servient for creating a thing

const Servient = require('@node-wot/core').Servient;
const HttpServer = require('@node-wot/binding-http').HttpServer;
const schedule = require('node-schedule');

interface EBike {
    upTime: number;
    position: Position;
    battery: number;
    pressureFrontWheel: number;
    pressureBackWheel: number;
    altitude: number;
    temperature: number;
    availability: Availability;
    //air quality
    co2: number;
    particulateMatter: number;

    maintenanceNeeded: boolean;
    startTripTime: number;
    endTripTime: number;
    problems: Set<Problem>

    booking:Booking;
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

enum Problem {
    LowBattery,
    AltitudeSensor,
    PressureFrontWheel,
    PressureBackWheel,
    Altitude,
    MaintenanceNeeded
}
interface Booking {
    from: String;
    expirationDate: number;
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

function addProblem(p : Problem){
    eBike.problems.add(p)
    eBike.availability = Availability.Unavailable
}

function deleteProblem(p : Problem){
    eBike.problems.delete(p)
    if (eBike.problems.size == 0){
        eBike.availability = Availability.Available
    }
}

function getAvailability():Availability{
    if (eBike.booking == null || Date.now() > eBike.booking.expirationDate){
        if ( eBike.problems.size == 0 ) {
            eBike.availability = Availability.Available
        } else {
             eBike.availability = Availability.Unavailable
        }
    }
    return eBike.availability
}
function book(from : String ):String{
    if (eBike.availability== Availability.Available){
        //book for 30 minutes
        eBike.booking = {
            from: from,
            expirationDate: Date.now() + (1000 * 60 * 30)
        }
        eBike.availability = Availability.Booked
        return "Bike correctly booked until "+ eBike.booking.expirationDate
    }
    throw Error("This bike can not be booked")
}

function unBook(from: String): String {
    if (getAvailability() != Availability.Booked) {
        throw Error("This bike is not booked")
    }
    if (eBike.booking.from != from) {
        throw Error("Only the person who booked this bike can remove the booking from it")
    }
    eBike.booking = null
    return "This bike is now "+ availabilityAsString(getAvailability())
}

function requireMaintenance(thing) {
    eBike.maintenanceNeeded = true
    thing.emitEvent("maintenanceNeeded", true);
    addProblem(Problem.MaintenanceNeeded)
    notify("company@mail.com", "need to check this one")
}

async function init(){
    let WoT = await servient.start()


    // Then from here on you can use the WoT object to produce the thing
    // i.e WoT.produce({.....})
    let thing = await WoT.produce({
	'@type': 'ebike',
        title: 'Smart eBike',
        description: 'A Smart eBike, equipped with several sensors',
        properties:{
            everything:{
                type: "object",
                description: "Every eBike sensor",
                eBike:{
                    upTime: "number",
                    position: {
                        lat: "number",
                       lng: "number",
                    },
                    battery: "number",
                    co2: "number",
                    particulateMatter: "number",
                    pressureFrontWheel: "number",
                    pressureBackWheel: "number",
                    altitude: "number",
                    temperature: "number",
                    availability: "string",
                    maintenanceNeeded: "boolean",
                }
            },
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
            co2: {
                type: "number",
                description: 'Current level of co2.'
            },
            particulateMatter: {
                type: "number",
                description: 'Current level of particulate matter.'
            }
            ,
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
                    type: "object",
                    description: 'Returns the time at which the bike has begun to be used and a message.',
                    properties:{
                        time:{
                           type:'number'
                        },
                        elapsedTime:{
                            type:'number'
                        },
                        message: {
                            type: 'string'
                        }
                    }
                }
            },
            stop: {
                description: 'Stopped to use the eBike',
                output: {
                    type: "object",
                    description: 'Returns the time at which the bike has been stopped.',
                    properties:{
                        time:{
                            type:'number'
                        },
                        message: {
                            type: 'string'
                        }
                    }
                }
            },
            swapBattery: {
                description: 'Battery charged successfully',
                properties:{
                    message: 'string'
                }
            },
            book: {
                description: "Book this bike for 30 minutes",
                data: {
                    type:"string",
                }
            },
            unBook: {
                description: "Unbook this bike for 30 minutes",
                data: {
                    type:"string",
                }
            },
            performMaintenance: {
                description: "Perform maintenance on the bike and solve all its problems",
                data: {
                    type: "string",
                }
            },
        },
        events:{
            lowBattery:{
                description:'Battery is running low and need to be replaced',
                data:{
                    type:"string",
                }
            },
            flatFrontWheel:{
                description:'Front wheel is down',
                data:{
                    type:"string",
                }
            },
            flatBackWheel:{
                description:'Back wheel is down',
                data:{
                    type:"string",
                }
            },
            maintenanceNeeded:{
                description:'Maintenance Needed',
                type: "boolean"
            },
        }
    })

    eBike = {
        altitude: readFromSensor(),
        temperature: readFromSensor(40),
        battery: readFromSensor(),
        position: {lat : readFromSensor(), lng : readFromSensor()},
        pressureBackWheel: 7,
        pressureFrontWheel: 7,
        upTime: readFromSensor(),
        availability: Availability.Available,
        co2: readFromSensor(),//maybe less than 100
        particulateMatter:readFromSensor(), //maybe less than 100
        maintenanceNeeded: false,
        startTripTime: null,
        endTripTime: null,
        problems: new Set<Problem>(),
        booking: null,
    }

    thing.setPropertyReadHandler("maintenanceNeeded", async () => eBike.maintenanceNeeded);
    thing.setPropertyReadHandler("position", async () => eBike.position);
    thing.setPropertyReadHandler("battery", async () => eBike.battery);
    thing.setPropertyReadHandler("upTime", async () => eBike.upTime);
    thing.setPropertyReadHandler("pressureBackWheel", async () => eBike.pressureBackWheel);
    thing.setPropertyReadHandler("pressureFrontWheel", async () => eBike.pressureFrontWheel);
    thing.setPropertyReadHandler("altitude", async () => eBike.altitude);
    thing.setPropertyReadHandler("temperature", async () => eBike.temperature);
    thing.setPropertyReadHandler("availability", async () => {
        eBike.availability = getAvailability()
        return availabilityAsString(eBike.availability)
    })
    thing.setPropertyReadHandler("speedometer", async () => {
        console.log("speedometer")
        readFromSensor(35)
    })
    thing.setPropertyReadHandler("co2", async () => readFromSensor())
    thing.setPropertyReadHandler("particulateMatter", async () => readFromSensor())
    thing.setPropertyReadHandler("everything", async () => {
        return {
            upTime: eBike.upTime,
            position: eBike.position,
            battery: eBike.battery,
            pressureFrontWheel: eBike.pressureFrontWheel,
            pressureBackWheel: eBike.pressureBackWheel,
            altitude: eBike.altitude,
            availability: eBike.availability,
            maintenanceNeeded: eBike.maintenanceNeeded,
        }
    })


    thing.setPropertyWriteHandler("availability", async (val) => {
        eBike.availability = stringToAvailability(await val.value());
        if (eBike.availability == Availability.Unavailable) {
            notify("company@mail.com", "need to check this one")
        }
    })

    thing.setActionHandler('start',  () => {
        console.log("start received!")
        if (eBike.availability == Availability.Available && eBike.battery > 25) {
            eBike.startTripTime = Date.now()
            return { time: eBike.startTripTime, message: "Trip correctly begun"}
        }
        throw Error("this bike is currently unavailable or booked by another person")
    })

    thing.setActionHandler('stop',  () => {
        if (eBike.availability == Availability.Available){
            eBike.endTripTime = Date.now()
            const elapsedTime = ( eBike.endTripTime-eBike.startTripTime )
            eBike.battery = eBike.battery - (elapsedTime / 1000)
            eBike.upTime += elapsedTime
            if (eBike.battery<=25){
                addProblem(Problem.LowBattery)
                thing.emitEvent("lowBattery", `Critical battery level!! Current level is: ${eBike.battery}`);
            }
            if (eBike.upTime > 1000 * 60 ) { //one minute
                requireMaintenance(thing)
            }
            return { time: eBike.endTripTime, elapsedTime: elapsedTime ,message: "Trip correctly ended"}
        }
        throw Error("this bike is currently unavailable or booked by another person")
    })

    thing.setActionHandler('swapBattery', ()=>{
        eBike.battery = 100;
        deleteProblem(Problem.LowBattery)
        return "Battery is now at "+ eBike.battery
    })

    thing.setActionHandler("book", async (params)=> {
        const paramsp = await params.value();
        if (paramsp && typeof paramsp === "object" && "user" in paramsp ) {
            return book(paramsp.user);
        }
    })

    thing.setActionHandler("performMaintenance", ()=> {
        eBike.problems.clear()
        eBike.upTime = 0
        eBike.maintenanceNeeded = false
        eBike.battery = 100
        eBike.pressureBackWheel = 7
        eBike.pressureFrontWheel = 7
        return "Correctly performed maintenance"
    })


    // Finally expose the thing
    thing.expose().then(() => {
        console.info(`${thing.getThingDescription().title} ready`);
    });
    console.log(`Produced ${thing.getThingDescription().title}`);

    schedule.scheduleJob('* * * * *', function(){
        console.log("=============================================")
        console.log('checkup!');
        console.log("=============================================")
        checkup(thing)
    });
}

function checkup(thing) {
    if (eBike.pressureBackWheel< 3) {
        addProblem(Problem.PressureBackWheel)
        thing.emitEvent("flatBackWheel", `Back wheel is down, it must be changed`);
    }
    if (eBike.pressureFrontWheel< 3) {
        addProblem(Problem.PressureFrontWheel)
        thing.emitEvent("flatFrontWheel", `Front wheel is down, it must be changed`);
    }
    if (eBike.availability == Availability.Booked) {
        getAvailability()
    }
    console.log(eBike)
}
init().catch((e) => console.log(e))
//it could save a snapshot of every read from every sensor every x seconds and then save it to a file or in a set.
