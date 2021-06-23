import './App.css';
import { useEffect, useReducer } from 'react';
import Amplify, { API, graphqlOperation} from 'aws-amplify';
import awsConfig from './aws-exports';
import {AmplifyAuthenticator, AmplifySignOut} from '@aws-amplify/ui-react';
import { listLists } from './graphql/queries';
import { deleteList } from './graphql/mutations';
import { onCreateList, onDeleteList, onUpdateList } from './graphql/subscriptions';
import MainHeader from './components/headers/MainHeader';
import Lists from './components/List/Lists';
import ListModal from './components/modals/listModal'
import { Container, Button, Icon } from 'semantic-ui-react'

import 'semantic-ui-css/semantic.min.css';

Amplify.configure(awsConfig);

const initialState = {
  id: '',
  title: '',
  description: '',
  lists: [],
  isModalOpen: false,
  modalType: ''
}

function listReducer(state = initialState, action) {
  let newList;
  switch (action.type) {
    case 'DESCRIPTION_CHANGED':
      return { ...state, description: action.value };
    case 'TITLE_CHANGED':
      return { ...state, title: action.value };
    case 'UPDATE_LISTS':
      return { ...state, lists: [...action.value, ...state.lists] };
    case 'OPEN_MODAL':
      return { ...state, isModalOpen: true, modalType: 'add' };
    case 'CLOSE_MODAL':
      return {
        ...state,
        isModalOpen: false,
        title: '',
        description: '',
        id: '',
      };
    case 'DELETE_LIST':
      console.log(action.value);
      deleteListById(action.value);
      return { ...state };
    case 'DELETE_LIST_RESULT':
      newList = state.lists.filter((item) => item.id !== action.value);
      return { ...state, lists: newList };
    case 'UPDATE_LIST_RESULT':
      const index = state.lists.findIndex(
        (item) => item.id === action.value.id
      );
      newList = [...state.lists];
      delete action.value.listItems;
      newList[index] = action.value;
      return { ...state, lists: newList };
    case 'EDIT_LIST': {
      const newValue = { ...action.value };
      delete newValue.children;
      delete newValue.listItems;
      delete newValue.dispatch;
      console.log(newValue);
      return {
        ...state,
        isModalOpen: true,
        modalType: 'edit',
        id: newValue.id,
        title: newValue.title,
        description: newValue.description,
      };
    }
    default:
      console.log('Default action for: ', action);
      return state;
  }
}

async function deleteListById(id) {
  // eslint-disable-next-line no-unused-vars
  const result = await API.graphql(graphqlOperation(deleteList, {input: {id}}))
}

function App() {
  const [state, dispatch] = useReducer(listReducer, initialState)

  async function fetchList() {
    const { data } = await API.graphql(graphqlOperation(listLists));
    dispatch({ type: 'UPDATE_LISTS', value: data.listLists.items });
  }




  // useEffect(() => {
  //   if(newList !== '') {
  //     setList([newList, ...list])
  //   }
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [newList])

  useEffect(() => {
    fetchList()
  }, [])

  useEffect(() => {
    const createListSub = API.graphql(graphqlOperation(onCreateList)).subscribe(
      {
        next: ({ _, value }) => {
          console.log('onCreateList called');
          dispatch({ type: 'UPDATE_LISTS', value: [value.data.onCreateList] });
        },
      }
    );
    const updateListSub = API.graphql(graphqlOperation(onUpdateList)).subscribe(
      {
        next: ({ _, value }) => {
          console.log('onUpdateList called', value);
          dispatch({
            type: 'UPDATE_LIST_RESULT',
            value: value.data.onUpdateList,
          });
        },
      }
    );
    const deleteListSub = API.graphql(graphqlOperation(onDeleteList)).subscribe(
      {
        next: ({ _, value }) => {
          console.log('onDeleteList called');
          dispatch({
            type: 'DELETE_LIST_RESULT',
            value: value.data.onDeleteList.id,
          });
        },
      }
    );
    return () => {
      createListSub.unsubscribe();
      deleteListSub.unsubscribe();
      updateListSub.unsubscribe();
    };
  }, []);

  return (
    <AmplifyAuthenticator>
      <AmplifySignOut />
      <Button className="floating-button" onClick={() => dispatch({type: 'OPEN_MODAL'})}>
        <Icon name="plus" className="floating-btn-icon"/>
      </Button>
      <Container style={{height: '100vh'}}>
      <div className="App">
          <MainHeader />
          <Lists list={state.lists} dispatch={dispatch}/>
      </div>
      </Container>
      <ListModal state={state} dispatch={dispatch}/>
    </AmplifyAuthenticator>

  );
}

export default App;
