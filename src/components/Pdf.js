import { strings } from '../data/locales';
import { convertToProd, getTextColor, getCurrency } from '../utils/functions';
const { Page, Image, Text, View, Document, StyleSheet, Font } = require('@react-pdf/renderer');
const React = require('react');

Font.register({ family: 'Lato', src: './assets/font/Lato-Regular.ttf'});
Font.register({ family: 'Merriweather', src: './assets/font/Merriweather-Bold.ttf'});
Font.register({ family: 'Roboto Mono', src: './assets/font/RobotoMono-Medium.ttf'});

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 35,
    paddingVertical: 30,
    backgroundColor: '#1A1B1E',
    color: '#FAFAFA'
  },
  section: {
    flex: 1,
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    paddingVertical: 15,
    fontFamily: 'Merriweather',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottom: '1px solid #1F2023',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontFamily: 'Lato'
  },
  image: {
    borderRadius: 3,
    maxWidth: 48,
    flex: 0.1,
    marginRight: 10
  },
  cod: {
    fontFamily: 'Lato',
    flexDirection: 'row',
    fontSize: 6,
    fontFamily: 'Roboto Mono',
    alignItems: 'center'
  },
  codVal: {
    marginLeft: 5,
    fontWeight: 'bold',
  },
  desc: {
    fontFamily: 'Merriweather',
    fontSize: 7,
    paddingVertical: 2,
    fontWeight: 'bold'
  },
  tir: {
    fontFamily: 'Lato',
    fontSize: 5,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  val: {
    fontFamily: 'Roboto Mono',
    fontSize: 7,
    marginRight: 50,
    marginTop: 5,
    borderRadius: 1,
    paddingVertical: 2,
    paddingHorizontal: 4,
    color: "rgba(0,0,0,0.6)"
  },
  scad: {
    fontSize: 6,
    fontWeight: 'bold',
    textAlign: 'right'
  },
  scadVal: {
    fontSize: 7,
  }
});

const PDFDocument = (props) => (
  <Document>
    <Page size="A5" style={styles.page}>
        <Text style={styles.title} fixed>{props.title}</Text>
        { props.name.length > 0 &&
          props.missing && 
          <Text style={[styles.title,  {fontSize: 10, fontFamily: 'Lato', paddingVertical: 2, textTransform: 'uppercase'}]} fixed>{`${strings.missing_collection} ${strings.of} ${props.name}`}</Text>
          ||
          <Text style={[styles.title,  {fontSize: 10, fontFamily: 'Lato', paddingVertical: 2, textTransform: 'uppercase'}]} fixed>{`${props.tradeable ? strings.pdf.tradeable : strings.col} ${strings.of} ${props.name}`}</Text>
        }
        <Text style={[styles.title, {fontSize: 6, fontFamily: 'Lato', paddingBottom: 15}]} fixed>{`${strings.pdf.total}: ${props.content.length}`}</Text>
        <View style={styles.section}>
          {props.content.map(x => (
            <View style={styles.row} key={x.UID} wrap={false}>
              <View style={{flex: 0.7}}>
                <View style={styles.cod}><Text>{`${strings.cod}: `}</Text><Text style={styles.codVal}>{x.N}</Text></View>
                <Text style={styles.desc}>{x.DESCRIZIONE}</Text>
                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                  <View style={styles.scad}><Text>{strings.value}</Text><Text style={[styles.val, {backgroundColor: getTextColor(x.VAL)}]}>{getCurrency(x.VAL)}</Text></View>
                  <View style={styles.scad}><Text>{strings.expire}</Text><Text style={styles.scadVal}>{x.SCAD.replace(/[:.,]/g, '/')}</Text></View>
                </View>
                <View style={styles.tir}><Text>{"["+x.AZ+"]   "+convertToProd(x.AZ)}</Text><Text>{`${strings.tir}: `}{x.TIR?.toLocaleString('it-IT')|| strings.unknown}</Text></View>  
              </View>
                <Image style={styles.image} src={"./assets/img/"+x.N+".jpg"} />
            </View>
          ))}
          <Text fixed style={{fontSize: 5, textAlign:'center', bottom: 0, position: 'absolute', width: '100%'}}render={({ pageNumber, totalPages }) => (
          `${strings.pdf.page} ${pageNumber} ${strings.of} ${totalPages}`
          )} />    
        </View>
    </Page>
  </Document>
);

export default PDFDocument;