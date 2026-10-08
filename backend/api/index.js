// Entry cho Vercel (serverless): export app Express, không gọi listen().
// Dùng JS thuần và import từ dist (đã build + tsc-alias) để Vercel không tự biên dịch src/ (alias "@/" sẽ hỏng).
import { createApp } from '../dist/app.js';

export default createApp();
