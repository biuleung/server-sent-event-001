import * as express from 'express';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Stage, StaiStateMessage, Status, CustomMessage } from '@systalk/state-message/dist';
import _ from 'lodash';


const Schema = mongoose.Schema;

const StageSchema = new Schema({
  current: Number,
  total: Number
}, { _id: false });

const InfoSchema = new Schema({
  name: String,
  httpStatus: String
})

const CustomMessage = new Schema({
  code: String,
  message: String,
  info: InfoSchema
})

const StateMesssageSchema = new Schema({
  tid: String,
  eid: String,
  status: String,
  info: String,
  stage: StageSchema,
  errors: [CustomMessage],
  warnings: [CustomMessage],
  time: { type: String, default: (new Date()).toLocaleTimeString() }
});

const testModel = mongoose.model('taskStatus', StateMesssageSchema);
class EventState {
  static eventId: string;
  static updatedTime: string;
  static updatingEventIntv: any;
  static checkingEventIntv: any;
}

let info = 'some info';

let stage: Stage = {
  current: 1,
  total: 100
}

const errors: CustomMessage[] = [
  {
    code: 'input_param_error',
    message: 'error',
    info: {
      name: 'name01',
      httpStatus: '403'
    }
  },
  {
    code: 'duplicate_value',
    message: 'error',
    info: {
      name: 'name01',
      httpStatus: '400'
    }
  }
];

const warnings: CustomMessage[] = [
  {
    code: 'input_param_error',
    message: 'error',
    info: {
      name: 'name01',
      httpStatus: '403'
    }
  },
  {
    code: 'duplicate_value',
    message: 'error',
    info: {
      name: 'name01',
      httpStatus: '400'
    }
  }
]

const msg = new StaiStateMessage('analyzing', Status.PENDING, info, stage, errors, warnings);

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
    msg.stage.current += 0.73;
    msg.status = Status.RUNNING;
    if (msg.stage.current >= msg.stage.total) {
      msg.stage.current = 100;
      msg.status = Status.SUCCESS;
    }

    if (newTaskrResponse) {
      try {
        await testModel.findOneAndUpdate({ "tid": "tid001" }, {
          "status": msg.status,
          "stage": msg.stage,
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
          "status": msg.status,
          "stage": msg.stage,
          "time": EventState.updatedTime,
          "eid": EventState.eventId
        }, { new: true })
          .then((updatedRes) => {
            if (mongoose.connection.readyState === 1) {
              emitEvent(res, EventState.eventId, { time: updatedRes.time, stateMessage: `${JSON.stringify(msg)}` });
              if (updatedRes.status === Status.ABORTING) {
                clearInterval(EventState.checkingEventIntv);
                EventState.checkingEventIntv = false;
              }
            } else {
              emitEvent(res, EventState.eventId, { time: EventState.updatedTime, stateMessage: `${JSON.stringify(msg)}` });
              if (msg.status === Status.ABORTING) {
                clearInterval(EventState.checkingEventIntv);
                EventState.checkingEventIntv = false;
              }
            }
          });
      } catch (error) {
        clearInterval(EventState.checkingEventIntv);
        EventState.checkingEventIntv = false;
        emitEvent(res, EventState.eventId, { time: EventState.updatedTime, stateMessage: `${JSON.stringify(msg)}` });
      } finally {
      }
    }, 3000);
  }

  if (EventState.updatingEventIntv && EventState.updatingEventIntv !== false) {
    triggerCheckEventInt();
  } else {
    const result = await testModel.findOne({ "tid": "tid001" });
    if (result.status === Status.RUNNING) {
      msg.status = result.status;
      if (result.stage && !_.isNil(result.stage.current) && !_.isNil(result.stage.total)) {
        msg.stage.current = result.stage.current;
        msg.stage.total = result.stage.total;
      }
      EventState.updatedTime = result.time;
      EventState.eventId = result.eid;
      triggerCheckEventInt();
      updatedTask();
    }
  }
}

const terminateTask = async (req: any, res: any) => {
  msg.stage.current = 0;
  msg.status = Status.ABORTING;
  const updatedTime = (new Date()).toLocaleTimeString();

  clearInterval(EventState.updatingEventIntv);
  clearInterval(EventState.checkingEventIntv);
  EventState.updatingEventIntv = false;
  EventState.checkingEventIntv = false;

  await testModel.findOneAndUpdate({ "tid": "tid001" }, {
    "status": msg.status,
    "stage": msg.stage,
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
