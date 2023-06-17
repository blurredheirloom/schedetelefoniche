import registerPromiseWorker from 'promise-worker/register';
import { AVAILABLE, MARKETPLACE, MISSING } from '../../utils/constants';
import hasher from 'hash-index';
import { pdf } from '@react-pdf/renderer';
import PDFDocument from '../../components/Pdf';
import { strings } from '../../data/locales';

registerPromiseWorker((message) => {
  if(message.type === 'getPDFContent') {
    let out;
    switch(message.amount)
    {
        case AVAILABLE:
            out = message.data.filter(x => message.checks.includes(hasher(x.UID)));
        break;
        case MISSING:
            out = message.data.filter(x => !message.checks.includes(hasher(x.UID)));
        break;
        case MARKETPLACE:
            out = message.data.filter(x => message.double.includes(hasher(x.UID)));
        break;
        default:
           out = [];
        break;
    }
    const document = PDFDocument({title: strings.pdf.my_cards, tradeable: message.amount === MARKETPLACE, missing: message.amount === MISSING, name: message.collection, content: out});
    const blobPdf = pdf(document);
	  blobPdf.updateContainer(document);
    const blob = blobPdf.toBlob();
    return blob;
  }
});