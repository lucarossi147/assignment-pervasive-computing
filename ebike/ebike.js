var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
// server
// Required steps to create a servient for creating a thing
var Servient = require('@node-wot/core').Servient;
var HttpServer = require('@node-wot/binding-http').HttpServer;
var eBike;
var servient = new Servient();
servient.addServer(new HttpServer());
//actual implementation may differ from sensor to sensor
function readFromSensor(upTo) {
    if (upTo === void 0) { upTo = 100; }
    return Math.floor(Math.random() * upTo);
}
function init() {
    return __awaiter(this, void 0, void 0, function () {
        var WoT, thing;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, servient.start()
                    // Then from here on you can use the WoT object to produce the thing
                    // i.e WoT.produce({.....})
                ];
                case 1:
                    WoT = _a.sent();
                    return [4 /*yield*/, WoT.produce({
                            // '@context': [
                            //     'https://www.w3.org/2022/wot/td/v1.1',
                            //     { "saref": "https://w3id.org/saref#" }
                            // ],
                            // id: "cicciaculo",
                            title: 'Smart eBike',
                            // '@type':'saref:EBike',
                            description: 'A Smart eBike, equipped with several sensors',
                            properties: {
                                battery: {
                                    type: "number",
                                    description: 'Current battery level.',
                                    minimum: 0,
                                    maximum: 100
                                },
                                pressureFrontWheel: {
                                    type: "number",
                                    description: 'Current pressure level of the front wheel expressed in bar.',
                                    minimum: 0
                                },
                                pressureBackWheel: {
                                    type: "number",
                                    description: 'Current pressure level of the back wheel expressed in bar.',
                                    minimum: 0
                                },
                                altitude: {
                                    type: "number",
                                    description: 'Current altitude expressed in meters.'
                                },
                                speedometer: {
                                    type: "number",
                                    description: 'Current speed expressed in Km/h.'
                                },
                                temperature: {
                                    type: "number",
                                    description: "Current temperature expressed in Celsius degrees"
                                },
                                position: {
                                    type: "object",
                                    description: "Current position",
                                    position: {
                                        lat: "number",
                                        lng: "number"
                                    }
                                },
                                availability: {
                                    type: "string",
                                    description: "Availability of the eBike, e.g. available, unavailable, booked",
                                    "enum": [
                                        "available",
                                        "unavailable",
                                        "booked",
                                    ]
                                },
                                upTime: {
                                    type: "number",
                                    description: 'The total upTime of the eBike.',
                                    minimum: 0
                                }
                            },
                            actions: {
                                start: {
                                    description: 'Start to use the eBike',
                                    output: {
                                        type: "string",
                                        description: 'returns the timestamp',
                                        properties: {
                                            time: {
                                                type: "string"
                                            }
                                        }
                                    }
                                }
                            },
                            events: {
                                lowBattery: {
                                    description: 'Battery is running low and need to be repalced',
                                    data: {
                                        type: "string"
                                    }
                                }
                            }
                        })];
                case 2:
                    thing = _a.sent();
                    eBike = {
                        altitude: readFromSensor(),
                        battery: readFromSensor(),
                        position: { lat: readFromSensor(), lng: readFromSensor() },
                        pressureBackWheel: readFromSensor(10),
                        pressureFrontWheel: readFromSensor(10),
                        upTime: readFromSensor()
                    };
                    thing.setPropertyReadHandler("position", function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                        return [2 /*return*/, eBike.position];
                    }); }); });
                    thing.setPropertyReadHandler("battery", function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                        return [2 /*return*/, eBike.battery];
                    }); }); });
                    thing.setPropertyReadHandler("upTime", function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                        return [2 /*return*/, eBike.upTime];
                    }); }); });
                    thing.setPropertyReadHandler("pressureBackWheel", function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                        return [2 /*return*/, eBike.pressureBackWheel];
                    }); }); });
                    thing.setPropertyReadHandler("pressureFrontWheel", function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                        return [2 /*return*/, eBike.pressureFrontWheel];
                    }); }); });
                    thing.setPropertyReadHandler("altitude", function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                        return [2 /*return*/, eBike.altitude];
                    }); }); });
                    // Finally expose the thing
                    thing.expose().then(function () {
                        console.info("".concat(thing.getThingDescription().title, " ready"));
                    });
                    console.log("Produced ".concat(thing.getThingDescription().title));
                    return [2 /*return*/];
            }
        });
    });
}
init()["catch"](function (e) { return console.log(e); });
