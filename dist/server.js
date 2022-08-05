"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("./util/logger"));
const app_1 = __importDefault(require("./app"));
const settings_1 = __importDefault(require("./util/config/settings"));
const lodash_1 = __importDefault(require("lodash"));
if (settings_1.default.node_env === 'development') {
    app_1.default.use((error, req, res, _next) => {
        let errorJson = null;
        let httpStatus = 500;
        if (error instanceof Error) {
            errorJson = { status: httpStatus, stack: error.stack, message: error.message };
            logger_1.default.info(error);
        }
        else {
            errorJson = error;
            logger_1.default.warn(error);
        }
        if (isJSON(req)) {
            return res.status(httpStatus).json({ error: errorJson });
        }
        return res.status(httpStatus).render('error', { error: errorJson });
    });
}
app_1.default.use((error, req, res, _next) => {
    let errorJson = null;
    let httpStatus = 500;
    if (error instanceof Error) {
        errorJson = { status: httpStatus, message: error.message };
        logger_1.default.info(error);
    }
    else {
        errorJson = error;
        logger_1.default.warn(JSON.stringify(error));
    }
    if (req.is('json') !== false) {
        return res.status(httpStatus).json({ error: errorJson });
    }
    return res.status(httpStatus).render('error', { error: errorJson });
});
function isJSON(req) {
    if (req.is('json')) {
        return true;
    }
    const accept = req.header('accept');
    if (lodash_1.default.isString(accept) && accept.indexOf('json') >= 0) {
        return true;
    }
    return false;
}
const server = app_1.default.listen(app_1.default.get('port'), () => {
    console.log('  App is running at http://localhost:%d in %s mode', app_1.default.get('port'), app_1.default.get('env'));
    console.log('  Press CTRL-C to stop\n');
});
exports.default = server;
//# sourceMappingURL=server.js.map