import {Table} from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux';
import { changeNmae, increase } from '../store/userSlice';
import { addCount, removeItem } from '../store';
import { memo, useMemo, useState } from 'react';

// let Child = memo( function(){
//     console.log('재렌더링됨')
//     return <div>자식임</div>
// })

// function 함수(){
//     return 
// }

function Cart() {

    // let result = useMemo(()=>{return 함수()}, [state])

    let state = useSelector((state)=>{ return state })
    let dispatch = useDispatch()
    let [count, setCount] = useState(0)

    return (
        <div>
            <h6>{state.user.name} {state.user.age}의 장바구니</h6>
            <button onClick={()=>{ dispatch(increase(1)) }}>버튼</button>
            <Table>
                <thead>
                    <tr>
                    <th>#</th>
                    <th>상품명</th>
                    <th>수량</th>
                    <th>변경하기</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        state.cart.map((a,i)=>{
                            return (
                                <tr key={i}>
                                <td>{a.id}</td>
                                <td>{a.name}</td>
                                <td>{a.count}</td>
                                <td>
                                    <button onClick={()=>{
                                        dispatch(addCount(a.id))
                                    }}>+</button>
                                </td>
                                <td>
                                    <button onClick={()=>{
                                        dispatch(removeItem(a.id))
                                    }}>삭제</button>
                                </td>
                                </tr>
                            )
                        })
                    }                    
                </tbody>
            </Table> 
        </div>
    )
}
export default Cart;