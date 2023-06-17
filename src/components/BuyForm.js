import React from 'react';
import { Box, Button, Divider, Group, Modal, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { strings } from '../data/locales';
import CardDetails from './CardDetails';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExchange, faMoneyBill } from '@fortawesome/free-solid-svg-icons';
import Trader from './Trader';

const BuyForm = (props) => {
    const { opened, onClose, confirmAction, cancelAction, seller, item } = props;
    const form = useForm({
        initialValues: { fullname: '', email: '', address: '', cap: '', city: '', prov: '' },
        validateInputOnBlur: true,
        validateInputOnChange: true,
        clearInputErrorOnChange: false,
        validate: {
          fullname: (value) => (value.length < 2 ? strings.market.form.text_hint : null),
          email: (value) => (/^\S+@\S+$/.test(value) ? null : strings.market.form.email_hint),
          address: (value) => (value.length < 2 ? strings.market.form.text_hint : null),
          city: (value) => (value.length < 2 ? strings.market.form.text_hint : null),
          cap: (value) => (/^[0-9]{5}$/.test(value) ? null : strings.market.form.cap_hint ),
          prov: (value) => (/^[A-Z]{2}$/.test(value.toUpperCase())  ? null : strings.market.form.prov_hint),
        },
    });

    return (
        <Modal overlayProps={{opacity: 0.5, blur: 4}} opened={opened} size="xl" centered onClose={onClose} title={strings.market.form.title}>
            <Group grow>
                <Group position="apart" align='stretch'>
                    <CardDetails item={item} />
                    <Divider my="sm" />
                    {seller && seller.price > 0 ?
                        <Button mt="lg" fullWidth className="marketLabel" disabled leftIcon={<FontAwesomeIcon icon={faMoneyBill} />}>
                            {strings.price}: {seller.price}
                        </Button>
                    :
                        <Button mt="lg" fullWidth className="marketLabel" disabled leftIcon={<FontAwesomeIcon icon={faExchange} />}>
                            {strings.exchange_val}
                        </Button>
                    }
                </Group>
                <Group position="apart">
                    <form onSubmit={form.onSubmit(console.log)}>
                        <TextInput withAsterisk label={strings.market.form.name} placeholder={strings.market.form.name_placeholder} {...form.getInputProps('fullname')} />
                        <TextInput withAsterisk mt="sm" label="Email" placeholder="your@email.com" {...form.getInputProps('email')} />
                        <TextInput withAsterisk mt="sm" label={strings.market.form.address} placeholder={strings.market.form.address_placeholder} {...form.getInputProps('address')} />
                        <TextInput withAsterisk mt="sm" label={strings.market.form.city} placeholder={strings.market.form.city} {...form.getInputProps('city')} />
                        <Group position="center" grow>
                            <TextInput withAsterisk mt="sm" label="CAP" placeholder="00000" {...form.getInputProps('cap')} />
                            <TextInput withAsterisk mt="sm" label="PROV" placeholder="PROV" {...form.getInputProps('prov')} />
                        </Group>
                    </form>
                </Group>
            </Group>
            <Divider label={strings.from} labelPosition="center" my="sm" />
            <Trader name={seller?.name} avatar={seller?.avatar} />
            <Group position="center" grow mt="md">
                <Button disabled={!form.isValid()} type="submit" variant="gradient" gradient={{ from: 'green', to: 'lime' }} onClick={() => confirmAction(form.isValid(), seller, form.values)}>
                    {strings.confirm}
                </Button>
                <Button variant="gradient" gradient={{ from: 'red', to: 'pink' }} onClick={cancelAction}>
                    {strings.cancel}
                </Button>
            </Group>
        </Modal>
    );
}

export default BuyForm;