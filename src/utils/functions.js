import { saveAs } from 'file-saver';

const writeFile =(buffer, filename, type) => {
	var blob = new Blob([buffer], {type: type});
	saveAs(blob, filename);
}

const getCurrency = (value) => {
    if(value>=1000)
      return value.toLocaleString('it-IT', { style: 'currency', currency: 'GBP', minimumFractionDigits: 0, maximumFractionDigits: 0 });
    else
      return value.toLocaleString('it-IT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

const convertToProd = (prod) => {
    switch (prod) {
      case 'PK':
        return "PIKAPPA";
      case 'PB':
        return "PUBLICENTER";
      case 'MN':
        return "MANTEGAZZA";
      case 'TH':
        return "TECHNICARD SYSTEM";
      case 'TP':
        return "TECHNICARD/POLAROID";
      case 'CS':
        return "CELLOGRAF SIMP";
      case 'LR':
        return "DE LA RUE";
      case 'OB':
        return "OBERTHUR";
      default:
        return "SCONOSCIUTO"
    }
}

const getColor = (value) => {
	switch(value)
	{
		case 1000:
			return 'one';
		case 2000:
			return 'two';
		case 5000:
			return 'five';
		case 10000:
			return 'ten';
		case 15000:
			return 'fifteen';
		case 25000:
			return 'twentyfive';
		default:
			return '';
	}
}

const getTextColor = (value) => {
	switch(value)
	{
		case 1000:
			return '#7B3F00';
		case 2000:
			return 'orange';
		case 5000:
			return "#00AD37";
		case 10000:
			return 'royalblue';
		case 15000:
			return '#9C002B';
		case 25000:
			return '#711EAA';
		default:
			return '#FFF';
	}
}

export { getCurrency, convertToProd, getColor, getTextColor, writeFile }