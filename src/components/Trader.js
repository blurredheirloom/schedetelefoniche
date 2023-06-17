import React from 'react';
import { Avatar, Box, Button, Group, Text } from '@mantine/core';

const Trader = (props) => {
    const { avatar, name, action, actionLabel } = props;
    return (
        <Group position='center'>
            <Avatar src={avatar ? avatar : null} alt="profile-picture" />
            <Box>
                <Text style={{fontSize: '.8rem', fontWeight: 'bold'}}>{name}</Text>
                {action &&
                <Button fullWidth variant="outline" color="red" className='link' compact onClick={action}>{actionLabel}</Button>
                }
            </Box>
        </Group>
    )
}

export default Trader;