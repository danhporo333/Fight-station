// Entry cho Vercel (serverless): export app Express, không gọi listen().
// Import từ dist vì alias "@/" đã được tsc-alias đổi thành đường dẫn thật khi build.
import { createApp } from '../dist/app.js';

export default createApp();
