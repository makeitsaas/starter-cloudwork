import { Scheduler } from './scheduler/scheduler';
import { OrderParser } from './scheduler/lib/order-parser';
import { config } from 'dotenv';

config();

console.log(process.env);
const s = new Scheduler();

const o: OrderParser = s.parseOrder("my-order-id");

console.log('parsed order', o);
