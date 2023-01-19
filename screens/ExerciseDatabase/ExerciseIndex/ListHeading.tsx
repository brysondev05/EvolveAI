import { memo } from 'react';
import { Layout, Text } from '@ui-kitten/components'

const ListHeadingContent = ({heading, itemHeight}) => {
    return (
        <Layout level="2" style={{
            padding:15,
            height: itemHeight,
            alignContent: 'center',
            justifyContent: 'center'
        }}>
        <Text category="h6" style={{}}> {heading}</Text>
    </Layout>
    )
}

export default memo(ListHeadingContent)
