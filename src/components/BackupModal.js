import React, { useState } from 'react';
import { Button, Divider, FileButton,  Modal,  TextInput, Tabs,  Text, Textarea } from '@mantine/core';
import { strings } from '../data/locales';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileArrowDown, faFileArrowUp } from '@fortawesome/free-solid-svg-icons';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { writeFile } from '../utils/functions';
import { COLORS } from '../utils/constants';


const BackupModal = (props) => {
    const { opened, close, backup, disabled, loadFile, recoverFromString, data, login } = props;
    const [name, setName] = useState("");
    const [textValues, setTextValues] = useState("");
    
    return (
        <Modal overlayProps={{opacity: 0.5, blur: 4}} opened={opened} size="md" centered onClose={close} title={`${strings.backup} / ${strings.restore} ${strings.col}`}>
			<Tabs defaultValue={backup ? "backup" : "recover"}>
				<Tabs.List>
					<Tabs.Tab value="backup" disabled={disabled} icon={<FontAwesomeIcon icon={faFileArrowDown} />}>{strings.backup}</Tabs.Tab>
					<Tabs.Tab value="recover" icon={<FontAwesomeIcon icon={faFileArrowUp} />}>{strings.restore}</Tabs.Tab>
				</Tabs.List>
				<Tabs.Panel value="backup">
					<Text my="md" align='center' size="xs">{strings.backup_hint}</Text>
					<TextInput placeholder={strings.col_name} value={name} onChange={(e) => setName(e.target.value)}/>
					<Button mt="sm" fullWidth variant="gradient" gradient={COLORS.primary} onClick={() => { writeFile(JSON.stringify({name: name, data: data}), "schede.collection", "text/plain;charset=utf-8"); close(); }}>{strings.save}</Button>
				</Tabs.Panel>
				<Tabs.Panel value="recover">
					<Text align='center' my="md" size="xs">{strings.restore_hint}</Text>
					<FileButton onChange={loadFile} accept=".collection">
						{(props) => <Button fullWidth variant="gradient" gradient={COLORS.primary} {...props}>{strings.choose_file}</Button>}
					</FileButton>
					<Divider label={strings.or} labelPosition="center" my="sm" />
					<Text align='center' mx="md" size="xs" my="md">{strings.restore_manually}</Text>
					<Textarea
						value={textValues}
						minRows={4}
						onChange={(e) => setTextValues(e.target.value)}
						placeholder="1, 141, 250..."
					/>
					<Button mt="sm" fullWidth variant="gradient" gradient={COLORS.primary} disabled={textValues.length===0} onClick={() => recoverFromString(textValues)} style={{marginTop: 10, marginBottom: 10}}>{strings.restore}</Button>
					<Text variant="gradient" gradient={COLORS.google} my="md" align='center' size="xs">{strings.warning_overwrite}</Text>
				</Tabs.Panel>
			</Tabs>
			<Divider label={strings.or} labelPosition="center" my="sm" />
			<Button
				fullWidth
				leftIcon={<FontAwesomeIcon icon={faGoogle} />}
				variant="gradient" gradient={COLORS.google}
				onClick={login}
			>
				{strings.login}
			</Button>
		</Modal>
    );
}

export default BackupModal;