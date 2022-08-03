import * as express from 'express';
import { v4 as uuidv4 } from 'uuid';

class EventState {
  static percentageOf = 0;
  static status = 'running';
  static eventIntv: any;
}

const emitEvent = (res: any, id: any, data: any) => {
  res.write('id: ' + id + '\n');
  res.write("data: " + JSON.stringify(data) + '\n\n');
  // res.flush()
}

const CheckTask = (req: any, res: any) => {
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
    emitEvent(res, uuidv4().split('-')[0], { time: (new Date()).toLocaleTimeString(), status: `${EventState.status}`, percentageOf: `${EventState.percentageOf}` });
  }, 2500);
}

const terminateTask = (req: any, res: any) => {
  EventState.percentageOf = 0;
  EventState.status = 'stopped';
  clearInterval(EventState.eventIntv);
  res.sendStatus(200);
}

const router = express.Router();

router.get('/v1', (req, res) => {

  res.set('Content-Type','application/json' );

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

export = router;


