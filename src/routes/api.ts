import * as express from 'express';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const Schema = mongoose.Schema;
const SomeModelSchema = new Schema({
  tid: String,
  eid: String,
  status: String,
  percentageOf: Number,
  time: { type: String, default: (new Date()).toLocaleTimeString() }
});

const testModel = mongoose.model('taskStatus', SomeModelSchema);
class EventState {
  static eventId: string;
  static percentageOf = 0;
  static status = 'running';
  static updatedTime: string;
  static updatingEventIntv: any;
  static checkingEventIntv: any;
}

const emitEvent = (res: any, id: any, data: any) => {
  res.write('id: ' + id + '\n');
  res.write("data: " + JSON.stringify(data) + '\n\n');
  // res.flush()
}

const NewTask = (req: any, res: any) => {
  // NewTaskRes.writeHead(200, {
  //   'Content-Type': 'text/event-stream',
  //   'Cache-Control': 'no-cache',
  //   'Connection': 'keep-alive'
  // });
  // EventState.updatedTime = (new Date()).toLocaleTimeString();

  // if (EventState.updatingEventIntv && EventState.updatingEventIntv !== false) {
  //   EventState.checkingEventIntv = setInterval(async () => {
  //     console.log(`fetch NewTask: ${EventState}`);
  //     emitEvent(NewTaskRes, EventState.eventId, { time: EventState.updatedTime, status: `${EventState.status}`, percentageOf: `${EventState.percentageOf}` });
  //     if (EventState.checkingEventIntv === false) {
  //       clearInterval(EventState.checkingEventIntv);
  //     }
  //   }, 3000);
  // }
  // else {
  res.set('Content-Type', 'application/json');

  updatedTask(res);

  // clearInterval(EventState.updatingEventIntv);
  // EventState.updatingEventIntv = false;
  // EventState.eventId = uuidv4().split('-')[0];
  // EventState.updatingEventIntv = setInterval(async function () {
  //   EventState.percentageOf += 0.07;
  //   EventState.status = 'running';
  //   if (EventState.percentageOf >= 100) {
  //     EventState.percentageOf = 100;
  //     EventState.status = 'completed';
  //   }

  //   try {
  //     await testModel.findOneAndUpdate({ "tid": "tid001" }, {
  //       "status": EventState.status,
  //       "percentageOf": EventState.percentageOf,
  //       "time": EventState.updatedTime,
  //       "eid": EventState.eventId
  //     }, { new: true }).then(updatedTask => {
  //       res.json(updatedTask)
  //     })
  //     // .then(res => {
  //     //   console.log(`update NewTask: ${EventState.eventId} ${res}`);
  //     //   if (mongoose.connection.readyState === 1) {
  //     //     emitEvent(NewTaskRes, EventState.eventId, { time: res.time, status: `${res.status}`, percentageOf: `${res.percentageOf}` });
  //     //   } else {
  //     //     emitEvent(NewTaskRes, EventState.eventId, { time: EventState.updatedTime, status: `${EventState.status}`, percentageOf: `${EventState.percentageOf}` });
  //     //   }
  //     // });
  //   } catch (error) {
  //     // emitEvent(NewTaskRes, EventState.eventId, { time: EventState.updatedTime, status: `${EventState.status}`, percentageOf: `${EventState.percentageOf}` });
  //   }
  // }, 3000);
  // }
}

const updatedTask = (res?: any) => {
  clearInterval(EventState.updatingEventIntv);
  EventState.updatingEventIntv = false;
  EventState.eventId = res ? uuidv4().split('-')[0] : EventState.eventId;
  EventState.updatingEventIntv = setInterval(async function () {
    EventState.percentageOf += 0.07;
    EventState.status = 'running';
    if (EventState.percentageOf >= 100) {
      EventState.percentageOf = 100;
      EventState.status = 'completed';
    }

    if (res) {
      try {
        await testModel.findOneAndUpdate({ "tid": "tid001" }, {
          "status": EventState.status,
          "percentageOf": EventState.percentageOf,
          "time": EventState.updatedTime,
          "eid": EventState.eventId
        }, { new: true }).then(updatedTask => {
          res.json(updatedTask)
        })

      } catch (error) {
      }
    }

  }, 3000);
}

const EmitTaskStatus = async (req: any, res: any) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  EventState.updatedTime = (new Date()).toLocaleTimeString();

  const triggerCheckEventInt = () => {
    EventState.checkingEventIntv = setInterval(async () => {
      try {
        await testModel.findOneAndUpdate({ "tid": "tid001" }, {
          "status": EventState.status,
          "percentageOf": EventState.percentageOf,
          "time": EventState.updatedTime,
          "eid": EventState.eventId
        }, { new: true })
          .then((updatedRes) => {
            console.log(`check NewTask: ${EventState.eventId} ${updatedRes}`);
            if (mongoose.connection.readyState === 1) {
              emitEvent(res, EventState.eventId, { time: updatedRes.time, status: `${updatedRes.status}`, percentageOf: `${updatedRes.percentageOf}` });
              if (updatedRes.status === 'stopped') {
                clearInterval(EventState.checkingEventIntv);
                EventState.checkingEventIntv = false;
              }
            } else {
              emitEvent(res, EventState.eventId, { time: EventState.updatedTime, status: `${EventState.status}`, percentageOf: `${EventState.percentageOf}` });
              if (EventState.status === 'stopped') {
                clearInterval(EventState.checkingEventIntv);
                EventState.checkingEventIntv = false;
              }
            }
          });
      } catch (error) {
        clearInterval(EventState.checkingEventIntv);
        emitEvent(res, EventState.eventId, { time: EventState.updatedTime, status: `${EventState.status}`, percentageOf: `${EventState.percentageOf}` });
      }
    }, 3000);
  }

  if (EventState.updatingEventIntv && EventState.updatingEventIntv !== false) {
    triggerCheckEventInt();
  } else {
    const result = await testModel.findOne({ "tid": "tid001" });
    if (result.status === 'running') {
      EventState.status = result.status;
      EventState.percentageOf = result.percentageOf;
      EventState.updatedTime = result.time;
      EventState.eventId = result.eid;
      triggerCheckEventInt();
      updatedTask();
    }
  }


}

const terminateTask = async (req: any, res: any) => {
  EventState.percentageOf = 0;
  EventState.status = 'stopped';
  const updatedTime = (new Date()).toLocaleTimeString();

  clearInterval(EventState.updatingEventIntv);
  clearInterval(EventState.checkingEventIntv);
  EventState.updatingEventIntv = false;
  EventState.checkingEventIntv = false;

  await testModel.findOneAndUpdate({ "tid": "tid001" }, {
    "status": EventState.status,
    "percentageOf": EventState.percentageOf,
    "time": updatedTime
  }, { new: true }).then(updatedTask => {


    res.status = 200;
    res.json(updatedTask);

  });

}

const router = express.Router();

router.get('/v1', (req, res) => {
  res.set('Content-Type', 'application/json');
  res.json({ "name": "Fetching server apis works" });
});


router.get('/v1/newTask', NewTask);
router.get('/v1/checkTaskStatus', EmitTaskStatus);
router.get('/v1/terminateTask', terminateTask);

export = router;


