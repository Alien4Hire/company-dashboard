import React from 'react'
import { Item } from 'semantic-ui-react'
import List from './List'

function Lists({list, dispatch}) {

    React.useEffect(() => {
        console.log(list)
    }, [list])

    return (
        <Item.Group>
            {list.map((item, index) => (
                <List key={item.id + index} {...item} dispatch={dispatch}>{item.title}</List>
            ))}
        </Item.Group>
    )
}

export default Lists
