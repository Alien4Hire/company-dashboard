import React from 'react'
import { Modal, Form, Button } from 'semantic-ui-react'
import { createList, updateList } from '../../graphql/mutations'
import { API, graphqlOperation} from 'aws-amplify'

const Modals = ({state, dispatch}) => {

    async function saveList() {
        const {title, description} = state
        const result = await API.graphql(graphqlOperation(createList, {input: {title, description}}))
        dispatch({type: 'CLOSE_MODAL'})
        console.log('Save data with result: ', result)
      }

    async function changeList() {
        const {id, title, description} = state
        const result = await API.graphql(graphqlOperation(updateList, {input: {id, title, description}}))
        dispatch({type: 'CLOSE_MODAL'})
        console.log('Edit data with result: ', result)
      }
    

    return (
        <Modal open={state.isModalOpen} dimmer='blurring'>
        <Modal.Header>
            {state.modalType === 'add' ? 'Create ' : 'Edit '}your list
        </Modal.Header>
        <Modal.Content>
          <Form>
            <Form.Input 
              label="List Title" 
              placeholder="My pretty list"
              value={state.title}
              onChange={(e) => dispatch({type: 'TITLE_CHANGED', value: e.target.value})}
              error={true ? false : {content: 'Please add a name to your list'}}
            />
            <Form.TextArea 
              label="Description" 
              value={state.description} 
              onChange={(e) => dispatch({type: 'DESCRIPTION_CHANGED', value: e.target.value})}
              placeholder="Things that my pretty list is about" />
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button negative onClick={() => dispatch({type: 'CLOSE_MODAL'})}>Cancel</Button>
          <Button positive onClick={() => state.modaltype === 'add' ? saveList(false) : changeList(false)}>{state.modalType === 'add' ? 'Save ' : 'Update '}</Button>
        </Modal.Actions>
      </Modal>
    )
}

export default Modals;