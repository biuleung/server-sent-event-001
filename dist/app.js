"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
global.base_dir = __dirname;
global.root_dir = path_1.default.join(__dirname, './..');
const express_1 = __importDefault(require("express"));
const settings_1 = __importDefault(require("./util/config/settings"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const frontend_1 = __importDefault(require("./routes/frontend"));
const api_1 = __importDefault(require("./routes/api"));
const mongoose_1 = __importDefault(require("mongoose"));
const url = `mongodb+srv://biuleong-test-01:bWe%40P5kH%40VXi4M2@cluster0.jikxd.mongodb.net/test001?retryWrites=true&w=majority`;
mongoose_1.default.connect(url)
    .then(() => {
    console.log('Connected to database ');
})
    .catch((err) => {
    console.error(`Error connecting to the database. \n${err}`);
});
const app = (0, express_1.default)();
app.set('port', settings_1.default.port);
app.set('views', path_1.default.join(global.root_dir, 'views'));
app.set('view engine', 'pug');
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use((0, helmet_1.default)({}));
app.use(express_1.default.static(path_1.default.join(global.root_dir, 'public'), { maxAge: 31557600000 }));
app.use('/', frontend_1.default);
app.use('/api', api_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map