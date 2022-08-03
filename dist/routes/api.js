"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
const express = __importStar(require("express"));
const uuid_1 = require("uuid");
class EventState {
}
EventState.percentageOf = 0;
EventState.status = 'running';
const emitEvent = (res, id, data) => {
    res.write('id: ' + id + '\n');
    res.write("data: " + JSON.stringify(data) + '\n\n');
    // res.flush()
};
const CheckTask = (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });
    clearInterval(EventState.eventIntv);
    EventState.eventIntv = setInterval(function () {
        EventState.percentageOf += 23;
        EventState.status = 'running';
        if (EventState.percentageOf >= 100) {
            EventState.percentageOf = 100;
            EventState.status = 'completed';
        }
        emitEvent(res, uuid_1.v4().split('-')[0], { time: (new Date()).toLocaleTimeString(), status: `${EventState.status}`, percentageOf: `${EventState.percentageOf}` });
    }, 2500);
};
const terminateTask = (req, res) => {
    EventState.percentageOf = 0;
    EventState.status = 'stopped';
    clearInterval(EventState.eventIntv);
    res.sendStatus(200);
};
const router = express.Router();
router.get('/v1', (req, res) => {
    res.set('Content-Type', 'application/json');
    // res
    //   .writeHead(200, {
    //     'Content-Type': 'application/json'
    //   })
    // .json({ "name": "Fetching server apis works" });
    res.json({ "name": "Fetching server apis works" });
    // const json = JSON.stringify(
    //   { "name": "Fetching server apis works" }
    // );
    // res.end(json);
});
router.get('/v1/listenSourceEvent', CheckTask);
router.get('/v1/terminateListening', terminateTask);
module.exports = router;
//# sourceMappingURL=api.js.map