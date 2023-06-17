import React, { useMemo, useState } from 'react';
import { MantineReactTable } from 'mantine-react-table';
import { MRT_Localization_IT } from 'mantine-react-table/locales/it';
import { YearPickerInput } from '@mantine/dates';
import { List, Drawer, Menu, Group, MantineProvider, ActionIcon, Divider, TextInput, Button, Box, Text, Loader } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import ModalImage from 'react-modal-image';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faPlus, faFilePdf, faBookOpen, faExchange, faSearch, faTrash, faMoneyBill, faClone, faStore, faImage } from '@fortawesome/free-solid-svg-icons';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { getDatabase, ref, child, get, set, onValue, update, push, off } from 'firebase/database';
import { cardValues, data, prods } from './data/cards';
import { convertToProd, getCurrency, getColor, writeFile } from './utils/functions';
import { auth } from './config/firebase';
import store from './config/store';
import hasher from 'hash-index';
import pdfWorker from './workers/pdf';
import { AVAILABLE, COLLECTION, COLORS, DESC, IMAGE, MARKETPLACE, MISSING, N, PENDING, PROD, SCAD, TIR, VAL } from './utils/constants';
import { AlertPDF, AlertRestart } from './components/Alert';
import { strings } from './data/locales';
import Trader from './components/Trader';
import CardDetails from './components/CardDetails';
import BuyForm from './components/BuyForm';
import ToggleColButton from './components/ToggleColButton';
import BackupModal from './components/BackupModal';
import TraderItem from './components/TraderItem';

const { ipcRenderer } = window.require("electron");

const db = getDatabase();

const login = () => {
	ipcRenderer.send("login");
}

const App = () => {
	let stored = store.get('cards');
	if(!stored)
		store.set('cards', []);

	let doubles = store.get('doubles');
	if(!doubles)
		store.set('doubles', []);
	
	const [checks, setChecks] = useState(stored);
	const [double, setDouble] = useState(doubles);
	const [colName, setColName] = useState(store.get('name') || "");
	const [collection, setCollection] = useState(false);
	const [opened, { open, close }] = useDisclosure(false);
	const [openedDrawer, { 
		open: openDrawer, 
		close: closeDrawer
	}] = useDisclosure(false);
	const [openedNotifications, { 
		open: openNotifications, 
		close: closeNotifications
	}] = useDisclosure(false);
	const [openedBuy, { 
		open: openBuy, 
		close: closeBuy
	}] = useDisclosure(false);
	const [market, setMarket] = useState({item: null, owned: false, seller: null});
	const [price, setPrice] = useState("");
	const [sellers, setSellers] = useState([]);
	const [qty, setQty] = useState(1);
	const [showAlert, setShowAlert] = useState(false);
	const [user, setUser] = useState(store.get('user') || null);
	const [loading, setLoading] = useState(false);
	const [filePDF, setPDF] = useState("");

	const logout = () => {
		auth.signOut();
		setUser(null);
		store.delete('user');
		store.delete("doubles");
		setDouble([]);
		window.location.reload();
	}

	ipcRenderer.on("login-success", async (event, token) => {
		close();
		const credential = GoogleAuthProvider.credential(token.id_token);
        const authUser = await signInWithCredential(auth, credential);
		store.set("user", authUser.user);
		store.set("name", authUser.user.displayName);
		get(ref(db, `cards/${authUser.user.uid}`)).then((snapshot) => {
			if (snapshot.exists()) {
				let array = snapshot.val().map(x => x.item);
				let filter = snapshot.val().filter(x => x.tradeable).map(x => x.item);
				setChecks(array);
				store.set('cards', array);
				setDouble(filter);
				store.set('doubles', filter)
			} else {
				console.log("Nessun dato su firebase");
			}
			setShowAlert(true);
		}).catch((error) => {
			console.error(error);
		});
	});

	const getActualPrice = (item) => {
		const num = data.filter(x => item === hasher(x.UID)).map(x => x.UID);
		return get(child(ref(db), `doubles/${num}/${user.uid}`)).then((snapshot) => {
			if (snapshot.exists()) {
				setPrice(snapshot.val().price);
				setQty(snapshot.val().qty);
			} else {
				setPrice("");
				setQty(1);
			}
		}).catch((error) => {
			console.error(error);
		});
	}


	const getUserTrading =  (item) => {
		const num = data.filter(x => item === hasher(x.UID)).map(x => x.UID);
		setSellers([]);
		const dbRef = ref(db, `doubles/${num}`);
		off(dbRef);
		onValue(dbRef, (snapshot) => {
			let items = [];
			snapshot.forEach(child => {
				const data = child.val();
				const key = child.key;
				items.push({uid: key, name: data.trader, avatar: data.traderAvatar, price: data.price, qty: data.qty});
			})
			setSellers(items);
		});
	}

	const buyFromUser = (valid, u, values) => {
		if(valid && u)
		{
			const num = data.filter(x => values.item === hasher(x.UID)).map(x => x.UID);
			const form = { name: values.fullname.toUpperCase(), address: `${values.address.toUpperCase()} - ${values.cap} ${values.city.toUpperCase()} (${values.prov.toUpperCase()})`, email: values.email};
			if(u.qty == 1)
				set(child(ref(db), `doubles/${num}/${u.uid}`), null);
			else
				update(child(ref(db), `doubles/${num}/${u.uid}`), {trader: u.name, traderAvatar: u.avatar, price: u.price, qty: u.qty - 1})
			push(child(ref(db), `trades/${u.uid}/${num}/${user.uid}`), { orderDate: moment().unix(), buyer: form, name: user.displayName, avatar: user.photoURL, price: u.price, state: PENDING})
			closeBuy();
		}
	}

	const loadFile = (file) => {
		const reader = new FileReader();
		reader.addEventListener('loadend', (e) => {
			const object = JSON.parse(e.target.result);
			const text = object.data.split(",").map(x => parseInt(x));
			setColName(object.name);
			store.set('name', object.name);
			store.set('cards', text);	
			setChecks(text);
			setShowAlert(true);
			close();
		});		
		reader.readAsText(file);
	}

	const recoverFromString = (string) => {
		setLoading(true);
		const text = string.split(",");
		const mappedText = data.filter(x => text.map(y => parseInt(y)).includes(x.N)).map(x => hasher(x.UID));
		store.set('cards', mappedText);
		store.set('name', '');
		setColName("");	
		setChecks(mappedText);
		setShowAlert(true);
		close();
		setLoading(false);
	}

	const generatePdf = async (type) => {
		try {
			setLoading(true);
			setPDF(null);
			pdfWorker.getPDFContent(type, colName, data, checks, double).then(out => {
				setPDF(out);
				setLoading(false);
			})
		}
		catch (error) {
			console.error(error);
			alert('Error generating PDF');
		}
	}

	const changeChecked = (id) => {
		let newArray = checks;
		let index = newArray.indexOf(id);
		if(index > -1)
			newArray.splice(index, 1);
		else
			newArray.push(id);
		store.set('cards', newArray);	
		setChecks([...newArray]);
		console.log(newArray);
		if(user)
		{
			set(ref(db, `cards/${user.uid}`), newArray.map(x => ({item: x, tradeable: false})))
			.then()
			.catch((error) => {
				console.log(error);
			});
		}
	}

	const changeDouble = async (id, price, qty, del) => {
		let newArray = double;
		if(del)
			newArray.splice(newArray.indexOf(id), 1);
		else
			newArray.push(id);
		setDouble(newArray);
		setPrice("");
		setQty(1);
		await set(ref(db, `doubles/${data.filter(x => hasher(x.UID) === id).map(x => x.UID)}/${user.uid}`), del ? null : {trader: user.displayName, traderAvatar: user.photoURL ? user.photoURL : null, price: parseFloat(price), qty: parseInt(qty)})
			.then(() => { store.set('doubles', newArray); })
			.catch((error) => {
				console.log(error);
		})
		await set(ref(db, `cards/${user.uid}/${data.filter(x => hasher(x.UID) === id).map(x => x.UID)}`), {item: id, tradeable: !del})
			.then()
			.catch((error) => {
				console.log(error);
		})
	}
	
	const columns = useMemo(
    () => [
	{
		accessorKey: N,
		header: strings.cod,
		size: 100,
		filterFn: (row, id, filterValue) => row.getValue(id) == "P".concat(filterValue) || row.getValue(id) == filterValue || row.getValue(id) == filterValue.concat("AA"),
		enableGlobalFilter: false,
		enableSorting: false,
		mantineFilterTextInputProps: { 
			placeholder: strings.cod,
			type: "number"
		},
		Cell: ({ cell }) => <b>{cell.getValue()}</b>
	},
	{
        accessorKey: VAL,
        header: strings.value,
		size: 120,
		enableGlobalFilter: false,
		filterFn: (row, id, filterValue) => getCurrency(row.getValue(id)) ===  filterValue,
        mantineFilterSelectProps: {
          	data: cardValues.map(x => getCurrency(parseInt(x))),
		  	styles: {
				item: {
					textAlign: 'center',
					fontFamily: 'Roboto Mono'
				}
			}
        },
        filterVariant: 'select',
        mantineFilterTextInputProps: { placeholder: strings.any },
        mantineTableHeadCellProps: {
	      align: 'right'
	    },
	    mantineTableBodyCellProps: {
	      align: 'right'
	    },
    	Cell: ({ cell }) =>
			<Group position='apart' align='center'>
				<span className={["dot", getColor(cell.getValue())].join(' ')}></span>
				<Text fw={700}>
				{getCurrency(cell.getValue())}
				</Text>
			</Group>
      },
      {
        accessorKey: SCAD,
        accessorFn: (row) => moment(row.SCAD.replace(/[:.,]/g, '/'), 'DD/MM/YYYY'),
        header: strings.expire,
		size: 20,
		enableGlobalFilter: false,
        filterVariant: 'date',
		filterFn: (row, id, filterValue) => row.getValue(id).year() === moment(filterValue).year(),
		sortingFn: (rowA, rowB, columnId) => rowA.getValue(columnId).value < rowB.getValue(columnId).value ? -1 : 1,
		Filter: ({ column }) => (
			<YearPickerInput
				placeholder={strings.any}
				dropdownType="modal"
				onChange={(newValue) => {
					column.setFilterValue(newValue)
				}}
				clearable
				minDate={new Date(1989,0)}
				maxDate={new Date(2003,11)}
				locale="it"
				modalProps={{ withinPortal: true }}
			/>
		),
		
        mantineTableHeadCellProps: {
	      align: 'center',
		},
	    mantineTableBodyCellProps: {
	      align: 'center',
	    },
        Cell: ({ cell }) => cell.getValue()?.format("DD/MM/YYYY")
      },
      {
        accessorKey: PROD,
        header: strings.prod,
		accessorFn: (row) => "["+row.AZ+"] "+convertToProd(row.AZ),
        mantineFilterSelectProps: {
          data: prods.map(x => "["+x+"] "+convertToProd(x)),
		  styles: {
			item: {
				fontSize: '.65rem',
				fontFamily: 'Roboto Mono',
			}
		},
        },
        enableGlobalFilter: false,
        filterVariant: 'select',
        mantineFilterTextInputProps: { placeholder: strings.any},
        size: 180,
        mantineTableHeadCellProps: {
	      align: 'center',
	    },
	    mantineTableBodyCellProps: {
	      align: 'center'
	    },
      },
      {
        accessorKey: DESC,
        header: strings.desc,
		filterFn: 'includesString',
        mantineFilterTextInputProps: { placeholder: '...'},
        size: 250,
      },
      {
        accessorKey: TIR,
        header: strings.tir,
        enableGlobalFilter: false,
        size: 200,
        filterVariant: 'range',
        filterFn: 'betweenInclusive',
		mantineFilterTextInputProps: {
			styles: {
				textAlign: 'center',
			},
			type: "number"
		},
        mantineTableHeadCellProps: {
	      align: 'center'
	    },
	    mantineTableBodyCellProps: {
	      align: 'center'
	    },
		Cell: ({ cell }) => cell.getValue().toLocaleString('it-IT')
	},
	{
		accessorFn: (row) => hasher(row.UID),
		id: COLLECTION,
        header: COLLECTION,
		Header: () => (
			<FontAwesomeIcon size="lg" icon={faBookOpen} />
		), 
		filterVariant: 'select',
        mantineFilterTextInputProps: { placeholder: strings.all },
        enableSorting: false,
        enableGlobalFilter: false,
        size: 50,
        enableColumnFilter: true,
		filterFn: (row, id, filterValue) => {
			if(filterValue === strings.marketplace)
				return doubles.includes(row.getValue(id)) === (filterValue === strings.marketplace)
			else
				return checks.includes(row.getValue(id)) === (filterValue === strings.available)
		},
		mantineFilterSelectProps: {
			data: [strings.available, strings.missing, strings.marketplace],
			styles: {
				item: {
					textAlign: 'center',
					fontFamily: 'Roboto Mono',
					paddingLeft: 0,
					paddingRight: 0
				}
			},
		},
        mantineTableHeadCellProps: {
      		align: 'center'
    	},
    	mantineTableBodyCellProps: {
	      align: 'center',
    	},
		Cell: ({ cell }) => (
			<Group position='center' noWrap>
				<ActionIcon size={36} variant="gradient" 
				title={checks.includes(parseInt(cell.getValue())) ? strings.remove : strings.add}
				gradient={checks.includes(parseInt(cell.getValue())) ? COLORS.add : COLORS.remove} 
				onClick={() => double.includes(parseInt(cell.getValue())) ? null : changeChecked(parseInt(cell.getValue()))}>
					<FontAwesomeIcon icon={checks.includes(parseInt(cell.getValue())) ? faCheck : faPlus} />
				</ActionIcon>
				{user &&
				<ActionIcon size={36} variant="gradient" 
					title={checks.includes(parseInt(cell.getValue())) ? doubles.includes(parseInt(cell.getValue())) ?  strings.remove_exchange : strings.exchange : strings.search}
					gradient={checks.includes(parseInt(cell.getValue())) ? (doubles.includes(parseInt(cell.getValue())) ? COLORS.onMarket : COLORS.disabled) : COLORS.primary} 
					onClick={() => {setMarket({item: parseInt(cell.getValue()), owned: checks.includes(parseInt(cell.getValue()))}); checks.includes(parseInt(cell.getValue())) ? getActualPrice(parseInt(cell.getValue())) : setSellers(getUserTrading(parseInt(cell.getValue()))); openDrawer()}}> 
					<FontAwesomeIcon icon={checks.includes(parseInt(cell.getValue())) ? faExchange : faSearch} />
				</ActionIcon>
				}
			</Group>
		)
      },
	  {
		id: MARKETPLACE,
		header: MARKETPLACE,
		Header: () => (
			<FontAwesomeIcon size="lg" icon={faExchange} />
		), 
		accessorFn: (row) => double.includes(hasher(parseInt(row.UID))),
		size: 20,
		enableGlobalFilter: false,
		enableColumnFilter: false,
		enableSorting: false,
		mantineTableHeadCellProps: {
			align: 'center',
		},
		mantineTableBodyCellProps: {
			align: 'center',
		},
		Cell: ({ cell }) => <FontAwesomeIcon color={cell.getValue() ? "#FAFAFA" : 'rgba(0,0,0,0.4)'} size='xl' icon={faExchange} />
	  },
	  {
        accessorKey: N,
		id: IMAGE,
        header: IMAGE,
		Header: () => (
			<FontAwesomeIcon size="lg" icon={faImage} />
		), 
        enableSorting: false,
        enableGlobalFilter: false,
        size: 64,
        enableColumnFilter: false,
        mantineTableHeadCellProps: {
      		align: 'center',
    	},
    	mantineTableBodyCellProps: {
	      align: 'center',
    	},
		Cell: ({ cell }) => (
			<ModalImage
				className="thumb"
				hideDownload
				hideZoom
				small={`./assets/img/${cell.getValue()}.jpg`}
				large={`./assets/img/${cell.getValue()}.jpg`}
				alt=""
			/>
		)
      }
    ],
    []
  );

  return (
	<MantineProvider
		withGlobalStyles
		withNormalizeCSS
		theme={{ colorScheme: 'dark' }}
	>
		<BackupModal loadFile={loadFile} login={login} opened={opened} close={close} backup={checks && checks.length > 0} disabled={checks.length === 0} data={checks.join()} recoverFromString={recoverFromString} logout={logout} />

		<BuyForm seller={market?.seller} item={market?.item} opened={openedBuy} onClose={closeBuy} confirmAction={buyFromUser} cancelAction={closeBuy} />

		<AlertRestart title="RIPRISTINO COMPLETATO" color="green" show={showAlert}>
			<Text style={{fontSize: '1rem', fontWeight: 'bold', padding: '20px 0'}}>{strings.alert.restore_complete}</Text>
			<Text style={{fontWeight: 'bold', padding: '20px 0'}}>{strings.alert.reboot}</Text> 
		</AlertRestart>

		<AlertPDF title="STO GENERANDO IL PDF" color="blue" show={loading && !filePDF} hide={() => setLoading(false)}>
			<Text style={{fontSize: '1rem', padding: '20px 0'}}>{strings.alert.pdf_start}</Text>
			<Text style={{fontWeight: 'bold', padding: '20px 0'}}>{strings.alert.pdf_notify}</Text> 
		</AlertPDF>

		<AlertPDF noBtn title="PDF PRONTO" color="green" show={filePDF} hide={() => setPDF("")}>
			<Text style={{fontSize: '1rem', fontWeight: 'bold', padding: '20px 0'}}>{strings.alert.pdf_ready}</Text>
			<Button style={{marginTop: 20, marginBottom: 10}} variant="gradient" gradient={COLORS.pdf} onClick={() => { writeFile(filePDF , "Schede "+colName.charAt(0).toUpperCase() + colName.slice(1)+".pdf", "application/pdf"); setPDF("")}}>{strings.save}</Button>
		</AlertPDF>

		<Drawer opened={openedDrawer} position="right" overlayProps={{ opacity: 0.5, blur: 4 }} onClose={closeDrawer} title={strings.marketplace}>
			{market?.owned &&
			<Box>
				{!doubles.includes(market.item) &&
					<>
					<CardDetails item={market.item} />
					<Box sx={{flex:1, marginBottom: 20, display:'flex', gap: '16px', flexDirection: 'row', justifyContent: 'space-between'}}>
						<TextInput className="marketInput" label="PREZZO" placeholder="1" value={price} onChange={(e) => setPrice(e.target.value)}/>
						<TextInput className="marketInput" label="QUANTITA'" placeholder="1" value={qty} onChange={(e) => setQty(e.target.value)}/>
					</Box>
					<Button leftIcon={<FontAwesomeIcon icon={faMoneyBill} />}disabled={price<=0 || qty < 1} fullWidth variant="gradient" gradient={COLORS.primary} onClick={() => {changeDouble(market.item, price, qty, false); closeDrawer();}}>METTI IN VENDITA</Button>
					<Divider style={{paddingTop: 10, paddingBottom: 10}} label={strings.or} labelPosition="center" my="sm" />
					<Button leftIcon={<FontAwesomeIcon icon={faExchange} />} disabled={qty < 1} fullWidth variant="gradient" gradient={COLORS.primary} onClick={() => {changeDouble(market.item, 0, qty, false); closeDrawer();}}>SCAMBIA</Button>
					</>
				||
					<>
						<Text align='center' fw={700}>STAI GIA' SCAMBIANDO QUESTA SCHEDA</Text>
						<CardDetails item={market.item} />
						<Box my="sm" sx={{flex:1, display:'flex', gap: '16px', flexDirection: 'row', justifyContent: 'space-between'}}>
							{ price > 0 ?
								<Button fullWidth className="marketLabel" disabled leftIcon={<FontAwesomeIcon icon={faMoneyBill} />}>
									{strings.price}: {price}
								</Button>
							:
								<Button fullWidth className="marketLabel" disabled leftIcon={<FontAwesomeIcon icon={faExchange} />}>
									{strings.exchange_val}
								</Button>
							}
							<Button variant="outline" className="marketLabel" disabled leftIcon={<FontAwesomeIcon icon={faClone} />}>
								{strings.quantity}: {qty}
							</Button>
						</Box>
						<Divider my="sm" />
						<Button fullWidth leftIcon={<FontAwesomeIcon icon={faTrash} />} variant="gradient" gradient={COLORS.remove} onClick={() => {changeDouble(market.item, price, qty, true); closeDrawer();}}>{strings.remove_market}</Button>
					</>
				}
			</Box>
			||
			<Box>
				<Text align='center' fw={700}>UTENTI CHE SCAMBIANO QUESTA SCHEDA</Text>
				<CardDetails item={market?.item} />
				<Divider my="sm" />
				{sellers &&
				<List listStyleType="none">
					{ sellers.length === 0 && <Text align='center'>Nessun utente scambia o vende questa scheda</Text> ||
					sellers.map(seller => (
						<TraderItem market={market} seller={seller} buy={setMarket} callback={() => {closeDrawer(); openBuy()}} />
					))}
				</List>
				|| 
					<Group position="center">
						<Loader color="white" variant="dots"/>
					</Group>
				}
			</Box>
			}
		</Drawer>

		<Drawer opened={openedNotifications} position="right" overlayProps={{ opacity: 0.5, blur: 4 }} onClose={closeNotifications} title="NOTIFICHE MERCATO">
			<Box>
				<Text>COMING SOON</Text>
			</Box>
		</Drawer>
		
  		<MantineReactTable
  			enableColumnFilterModes={false}
			enableColumnOrdering={false}
			enableColumnActions={false}
			enableEditing={false}
			enablePinning={false}
			enableHiding={false}
			globalFilterFn="contains"
			enableFilterMatchHighlighting={false}
			renderTopToolbarCustomActions={() => (
				<Group position="apart" style={{flex: 1}}>
					<ToggleColButton checked={collection} colLength={checks.length} fullLength={data.length} onClick={() => setCollection(!collection)} />
					<Group position='center'>
					{user &&
						<Trader name={colName} avatar={user.photoURL} action={logout} actionLabel={strings.logout} />
						||
						colName.length>0 && checks.length>0 && 
						<Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center'}}>
							<Text style={{padding: 0, fontSize: '.6rem', fontWeight: 'bold'}}>{`${strings.col} ${strings.of}`}</Text>
							<Text style={{padding: 0, fontSize: '.8rem', fontWeight: 'bold'}}>{colName}</Text>
						</Box>
					}
					</Group>
					<Group mx="sm" >
						{!user &&
						<ActionIcon title={`${strings.backup} / ${strings.restore} ${strings.col}`} size={36} variant="gradient" gradient={COLORS.primary} onClick={() => {setMarket(null); open()}}>
							<FontAwesomeIcon icon={faBookOpen} />
						</ActionIcon>
						}
						<Menu shadow="md">
							<Menu.Target>
								<Button loading={filePDF === null} leftIcon={<FontAwesomeIcon icon={faFilePdf} />} disabled={checks.length === 0} variant="gradient" gradient={COLORS.pdf}>{strings.pdf_export}</Button>
							</Menu.Target>

							<Menu.Dropdown>
								<Menu.Item 
									icon={<FontAwesomeIcon icon={faBookOpen} />} 
									onClick={() => generatePdf(AVAILABLE)}
								>
									{strings.full_collection}
								</Menu.Item>
								<Menu.Item 
									icon={<FontAwesomeIcon icon={faExchange} />}
									onClick={() => generatePdf(MARKETPLACE)}
								>
									{strings.market_collection}
								</Menu.Item>
								<Menu.Item 
									icon={<FontAwesomeIcon icon={faSearch} />}
									onClick={() => generatePdf(MISSING)}
								>
									{strings.missing_collection}
								</Menu.Item>
							</Menu.Dropdown>
						</Menu>
						{user &&
						<ActionIcon title={`${strings.marketplace}`} size={36} variant="gradient" gradient={COLORS.primary} onClick={() => {openNotifications()}}>
							<FontAwesomeIcon icon={faStore} />
						</ActionIcon>
						}
					</Group>
				</Group>
  			)}
			enableStickyHeader
			enableStickyFooter
			renderBottomToolbarCustomActions={() => <div><small><p>{`${process.env.VERSION}`}</p><p>{`${strings.author}: ${process.env.AUTHOR}`}</p></small></div>}
			enableDensityToggle={false}
			enableFullScreenToggle={false}
			mantineTableProps={{fontSize: '.8rem'}}
			mantinePaginationProps={{rowsPerPageOptions: ["50", "100", "250", "500"]}}
			defaultColumn={{ minSize: 10, maxSize: 9001, size: 260 }}
			initialState={{ 
				density: 'xs', 
				isFullScreen:true, 
				showGlobalFilter: true, 
				showColumnFilters: true, 
				pagination: { pageSize: 100 }, 
				columnVisibility: { COLLECTION: !collection, MARKETPLACE: user != null },
				sorting: [{ id: N, desc: false }],
				columnOrder: [
					N,
					VAL,
					SCAD,
					PROD,
					DESC,
					TIR,
					COLLECTION,
					MARKETPLACE,
					IMAGE
				],
			}}
			columns={collection ? columns.filter(x => x.header !== COLLECTION) : columns.filter(x => x.header !== MARKETPLACE)}
			localization={MRT_Localization_IT}
			data={collection ? data.filter(x => checks.includes(hasher(x.UID))) : data}
			mantineFilterTextInputProps={{ sx: { borderBottom: '2px solid #eee', flex: 1 } }} 
			mantineFilterSelectProps={{ sx: { borderBottom: '2px solid #eee', flex: 1 } }}
  		/>
   	</MantineProvider>
  );
};

export default App;
