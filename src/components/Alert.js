import React, { useEffect } from 'react';
import { Alert, Box }from "@mantine/core";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookOpen } from '@fortawesome/free-solid-svg-icons';

const AlertRestart = (props) => {
    useEffect(() => {
        if(props.show)
        {
            const timer = setTimeout(() => window.location.reload(), 2000);
            return () => clearTimeout(timer);
        }
    }, [props.show]);

    if(props.show)
    {
        return(
            <Box style={{backgroundColor: 'rgba(0,0,0,0.8)', width: '100%', height: '100%', position: 'absolute', zIndex: 9999}}>
                <Alert onClose={() => window.location.reload()} icon={<FontAwesomeIcon icon={faBookOpen} />} title={props.title} color={props.color} 
                    style={{textAlign: 'center', width: '50%', margin: '20% auto'}} variant="outline" withCloseButton>
                    {props.children}
                </Alert>
            </Box>
        )	
    }
    return null
}

const AlertPDF = (props) => {
    if(props.show)
    {
        return(
            <Box style={{backgroundColor: 'rgba(0,0,0,0.8)', width: '100%', height: '100%', position: 'absolute', zIndex: 9999}}>
                <Alert onClose={props.hide} icon={<FontAwesomeIcon icon={faBookOpen} />} title={props.title} color={props.color} 
                    style={{textAlign: 'center', width: '50%', margin: '20% auto'}} variant="outline" withCloseButton>
                    {props.children}
                </Alert>
            </Box>
        )	
    }
    return null
}

export { AlertPDF, AlertRestart };