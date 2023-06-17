import React from 'react';
import { Box, Image, Text } from '@mantine/core';
import hasher from 'hash-index';
import { convertToProd, getCurrency, getTextColor } from '../utils/functions';
import { data } from '../data/cards';

const CardDetails = (props) => {
    const card = props.item;
	const n = data.filter(x => card === hasher(x.UID));
	return(
		<Box style={{paddingTop: 10, paddingBottom: 10}}>
			<Image
				radius="md"
				maw={256}
				mx="auto"
				style={{paddingBottom: 20}}
				withPlaceholder
				src={`./assets/img/${n.map(x => x.N)}.jpg`}
				alt={card}
			/>
			<Box sx={{display: 'flex', paddingBottom: 5, flexDirection: 'row', flex: 1, justifyContent: 'space-between'}}>
				<Text size="sm" style={{fontWeight: 'bold', padding: 0}}>{n.map(x => x.N)}</Text>
				<Text size="sm" style={{fontWeight: 'bold', padding: 0}}>{n.map(x => x.DESCRIZIONE)}</Text>
			</Box>
			<Box sx={{display: 'flex', paddingBottom: 5, flexDirection: 'row', flex: 1, justifyContent: 'space-between'}}>
				<Text size="sm" style={{padding: 0}}>{n.map(x => x.SCAD)}</Text>
				<Text size="sm" style={{padding: '0 .5rem', fontWeight: 'bold', borderRadius: 2, color: "rgba(0,0,0,0.8)", backgroundColor: getTextColor(parseInt(n.map(x => x.VAL)))}}>{n.map(x => getCurrency(x.VAL))}</Text>
			</Box>
			<Box sx={{display: 'flex', paddingBottom: 5, flexDirection: 'row', flex: 1, justifyContent: 'space-between'}}>
				<Text size="sm" style={{padding: 0}}>{n.map(x => convertToProd(x.AZ))}</Text>
				<Text size="sm" style={{padding: 0}}>{n.map(x => x.TIR).toLocaleString('it-IT')}</Text>
			</Box>
		</Box>
	)
  }

  export default CardDetails;