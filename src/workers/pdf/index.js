import PromiseWorker from 'promise-worker';
import Worker from 'worker-loader!./worker';
const worker = new Worker();
const promiseWorker = new PromiseWorker(worker);

const getPDFContent = (amount, collection, data, checks, double) => promiseWorker.postMessage({
  type: 'getPDFContent', amount: amount, collection: collection, data: data, checks: checks, double: double
});

export default { getPDFContent }