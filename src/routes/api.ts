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
  res.set('Content-Type', 'application/json');
  updatedTask(res);
}

const updatedTask = (newTaskrResponse?: any) => {
  clearInterval(EventState.updatingEventIntv);
  EventState.updatingEventIntv = false;
  EventState.eventId = newTaskrResponse ? uuidv4().split('-')[0] : EventState.eventId;
  EventState.updatingEventIntv = setInterval(async function () {
    EventState.percentageOf += 1.5;
    EventState.status = 'running';
    if (EventState.percentageOf >= 100) {
      EventState.percentageOf = 100;
      EventState.status = 'completed';
    }

    if (newTaskrResponse) {
      try {
        await testModel.findOneAndUpdate({ "tid": "tid001" }, {
          "status": EventState.status,
          "percentageOf": EventState.percentageOf,
          "time": EventState.updatedTime,
          "eid": EventState.eventId
        }, { new: true }).then(updatedTask => {
          newTaskrResponse.json(updatedTask)
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
    EventState.updatedTime = (new Date()).toLocaleTimeString();

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
              if (updatedRes.status === 'terminated') {
                clearInterval(EventState.checkingEventIntv);
                EventState.checkingEventIntv = false;
              }
            } else {
              emitEvent(res, EventState.eventId, { time: EventState.updatedTime, status: `${EventState.status}`, percentageOf: `${EventState.percentageOf}` });
              if (EventState.status === 'terminated') {
                clearInterval(EventState.checkingEventIntv);
                EventState.checkingEventIntv = false;
              }
            }
          });
      } catch (error) {
        clearInterval(EventState.checkingEventIntv);
        EventState.checkingEventIntv = false;
        emitEvent(res, EventState.eventId, { time: EventState.updatedTime, status: `${EventState.status}`, percentageOf: `${EventState.percentageOf}` });
      } finally {
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
  EventState.status = 'terminated';
  const updatedTime = (new Date()).toLocaleTimeString();

  clearInterval(EventState.updatingEventIntv);
  clearInterval(EventState.checkingEventIntv);
  EventState.updatingEventIntv = false;
  EventState.checkingEventIntv = false;

  await testModel.findOneAndUpdate({ "tid": "tid001" }, {
    "status": EventState.status,
    "percentageOf": EventState.percentageOf,
    "time": updatedTime
  }, { new: true }).then(TaskLastStatus => {
    res.status = 200;
    res.json(TaskLastStatus);
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


