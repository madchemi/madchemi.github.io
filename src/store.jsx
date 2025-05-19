import { configureStore, createSlice } from "@reduxjs/toolkit";
import user from './store/userSlice.js'



let cart = createSlice({
  name : 'cart',
  initialState : [
    {id : 0, name : 'White and Black', count : 2},
    {id : 2, name : 'Grey Yordan', count : 1}
  ],
  reducers : {
    addCount(state, action){
      let 번호 = state.findIndex((a)=>{return a.id == action.payload})
      state[번호].count++
    },
    addItem(state, action){
      let num = state.findIndex((a)=>{return action.payload.id == a.id})
      if(num > -1) state[num].count++
      else state.push(action.payload)
    },
    removeItem(state, action){
      let 번호 = state.findIndex((a)=>{return a.id == action.payload})
      state.splice(번호, 1)
    }
  }
})
export let { addCount, addItem, removeItem } = cart.actions


export default configureStore({
    reducer: {
      user : user.reducer,
      cart : cart.reducer
    }
  }) 