import { useEffect, useState } from "react"
import axios from "axios"

export function useUsername() {
    let [username, setUsername] = useState('')
    useEffect(()=>{
        axios.get("/username.json").then((a) => { return setUsername(a.data)})
    })
    
    return username
}
