import React from 'react';
import { List, Group, Divider, Button } from '@mantine/core';
import Trader from './Trader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClone, faCommentDollar, faExchange, faMoneyBill } from '@fortawesome/free-solid-svg-icons';
import { COLORS } from '../utils/constants';
import { strings } from '../data/locales';

const TraderItem = (props) => {
    const { market, seller, buy, callback } = props;

    return (
        <List.Item key={seller.uid}>
            <Trader name={seller.name} avatar={seller.avatar} />
            <Group my="sm" position="apart" grow>
                { seller.price > 0 ?
                    <Button fullWidth className="marketLabel" disabled leftIcon={<FontAwesomeIcon icon={faMoneyBill} />}>
                        {strings.price}: {seller.price}
                    </Button>
                :
                    <Button fullWidth className="marketLabel" disabled leftIcon={<FontAwesomeIcon icon={faExchange} />}>
                        {strings.exchange_val}
                    </Button>
                }
                <Button variant="outline" className="marketLabel" disabled leftIcon={<FontAwesomeIcon icon={faClone} />}>
                    {strings.quantity}: {seller.qty}
                </Button>
            </Group>
            <Button my="sm" fullWidth leftIcon={<FontAwesomeIcon icon={faCommentDollar} />} variant="gradient" gradient={COLORS.primary} onClick={() => { buy({...market, seller: seller}); callback(); }}>{strings.buy_market}</Button>
            <Divider my="sm" />
        </List.Item>
    )
}

export default TraderItem