"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express = __importStar(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const uuid_1 = require("uuid");
const Schema = mongoose_1.default.Schema;
const SomeModelSchema = new Schema({
    tid: String,
    eid: String,
    status: String,
    percentageOf: Number,
    time: { type: String, default: (new Date()).toLocaleTimeString() }
});
const testModel = mongoose_1.default.model('taskStatus', SomeModelSchema);
class EventState {
}
EventState.percentageOf = 0;
EventState.status = 'running';
const emitEvent = (res, id, data) => {
    res.write('id: ' + id + '\n');
    res.write("data: " + JSON.stringify(data) + '\n\n');
};
const NewTask = (req, res) => {
    res.set('Content-Type', 'application/json');
    updatedTask(res);
};
const updatedTask = (res) => {
    clearInterval(EventState.updatingEventIntv);
    EventState.updatingEventIntv = false;
    EventState.eventId = res ? (0, uuid_1.v4)().split('-')[0] : EventState.eventId;
    EventState.updatingEventIntv = setInterval(function () {
        return __awaiter(this, void 0, void 0, function* () {
            EventState.percentageOf += 0.07;
            EventState.status = 'running';
            if (EventState.percentageOf >= 100) {
                EventState.percentageOf = 100;
                EventState.status = 'completed';
            }
            if (res) {
                try {
                    yield testModel.findOneAndUpdate({ "tid": "tid001" }, {
                        "status": EventState.status,
                        "percentageOf": EventState.percentageOf,
                        "time": EventState.updatedTime,
                        "eid": EventState.eventId
                    }, { new: true }).then(updatedTask => {
                        res.json(updatedTask);
                    });
                }
                catch (error) {
                }
            }
        });
    }, 3000);
};
const EmitTaskStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });
    EventState.updatedTime = (new Date()).toLocaleTimeString();
    const triggerCheckEventInt = () => {
        EventState.checkingEventIntv = setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
            try {
                yield testModel.findOneAndUpdate({ "tid": "tid001" }, {
                    "status": EventState.status,
                    "percentageOf": EventState.percentageOf,
                    "time": EventState.updatedTime,
                    "eid": EventState.eventId
                }, { new: true })
                    .then((updatedRes) => {
                    console.log(`check NewTask: ${EventState.eventId} ${updatedRes}`);
                    if (mongoose_1.default.connection.readyState === 1) {
                        emitEvent(res, EventState.eventId, { time: updatedRes.time, status: `${updatedRes.status}`, percentageOf: `${updatedRes.percentageOf}` });
                        if (updatedRes.status === 'stopped') {
                            clearInterval(EventState.checkingEventIntv);
                            EventState.checkingEventIntv = false;
                        }
                    }
                    else {
                        emitEvent(res, EventState.eventId, { time: EventState.updatedTime, status: `${EventState.status}`, percentageOf: `${EventState.percentageOf}` });
                        if (EventState.status === 'stopped') {
                            clearInterval(EventState.checkingEventIntv);
                            EventState.checkingEventIntv = false;
                        }
                    }
                });
            }
            catch (error) {
                clearInterval(EventState.checkingEventIntv);
                emitEvent(res, EventState.eventId, { time: EventState.updatedTime, status: `${EventState.status}`, percentageOf: `${EventState.percentageOf}` });
            }
        }), 3000);
    };
    if (EventState.updatingEventIntv && EventState.updatingEventIntv !== false) {
        triggerCheckEventInt();
    }
    else {
        const result = yield testModel.findOne({ "tid": "tid001" });
        if (result.status === 'running') {
            EventState.status = result.status;
            EventState.percentageOf = result.percentageOf;
            EventState.updatedTime = result.time;
            EventState.eventId = result.eid;
            triggerCheckEventInt();
            updatedTask();
        }
    }
});
const terminateTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    EventState.percentageOf = 0;
    EventState.status = 'stopped';
    const updatedTime = (new Date()).toLocaleTimeString();
    clearInterval(EventState.updatingEventIntv);
    clearInterval(EventState.checkingEventIntv);
    EventState.updatingEventIntv = false;
    EventState.checkingEventIntv = false;
    yield testModel.findOneAndUpdate({ "tid": "tid001" }, {
        "status": EventState.status,
        "percentageOf": EventState.percentageOf,
        "time": updatedTime
    }, { new: true }).then(updatedTask => {
        res.status = 200;
        res.json(updatedTask);
    });
});
const router = express.Router();
router.get('/v1', (req, res) => {
    res.set('Content-Type', 'application/json');
    res.json({ "name": "Fetching server apis works" });
});
router.get('/v1/newTask', NewTask);
router.get('/v1/checkTaskStatus', EmitTaskStatus);
router.get('/v1/terminateTask', terminateTask);
module.exports = router;
//# sourceMappingURL=api.js.map