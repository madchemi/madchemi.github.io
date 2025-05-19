import { createSlice } from "@reduxjs/toolkit"

let user = createSlice({
  name : 'user',
  initialState : { name : 'kim', age : 20},
  reducers : {
    changeNmae(state){
      state.name = 'park'
    },
    increase(state, a){
      state.age += a.payload
    }
  }
})

export let { changeNmae, increase } = user.actions

export default user