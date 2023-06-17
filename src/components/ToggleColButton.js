import React from 'react';
import { Group, Button, Switch } from '@mantine/core';
import { strings } from '../data/locales';
import { COLORS } from '../utils/constants';

const ToggleColButton = (props) => {
    const { onClick, checked, colLength, fullLength } = props;
    const disabled = colLength === 0;
    return (
        <Group style={disabled ? {pointerEvents: 'none'} : {pointerEvents: 'auto'}} onClick={disabled ? null : onClick}>
            <Button variant="gradient" gradient={COLORS.add} >
                <Switch
                    checked={checked}
                    disabled
                    className={disabled ? 'empty' : 'full'}
                    color="teal"
                    radius="sm"
                    size="lg"
                    labelPosition='left'
                    label={
                        <span style={{paddingRight: '16px', textTransform: 'uppercase', fontSize: '.9rem', color: 'rgba(26, 27, 30, 0.75)'}}>{checked ? `${strings.personal} ${strings.col}` : strings.full_catalog}</span>
                    }
                    onLabel={
                        <span style={{fontSize: '.9rem', borderRadius: ".2rem", color: '#FAFAFA'}}>{(disabled ? strings.empty :  `${colLength} / ${fullLength}`)}</span>
                    }
                    offLabel={
                        <span style={{fontSize: '.9rem', borderRadius: ".2rem", color: '#FAFAFA'}}>{fullLength}</span>
                    }
                />
            </Button>
        </Group>
    );
}

export default ToggleColButton;