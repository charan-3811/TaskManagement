import React, {useEffect, useRef, useState} from 'react';
import axios from 'axios';
import './Tasks.css';
import Popup from "reactjs-popup";


const Tasks = () => {
    const [tasks, setTasks] = useState([]);
    const [newItem, setNewItem] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [updateValue,setUpdateValue]=useState()
    const dragItem=useRef(0)
    const dragOverItem=useRef(0)


    const AddingBack = async () => {
        await axios.post('http://localhost:3050/add', { name: newItem })
            .catch((error) => console.log(error));
        setNewItem('');
    };


    function handleAdd(x) {
        setNewItem(x);
    }
    function handleUpdateTask(x) {
        setUpdateValue(x)
    }


    async function handleDelete(x) {
        await axios.post('http://localhost:3050/delete', { id: x })
            .catch((error) => console.log(error));
    }


    async function handleUpdate(x, completed) {
        await axios.post('http://localhost:3050/updateStatus', { id: x, completed })
            .catch((error) => console.log(error));
    }
    async function addUpdate(x) {
        await axios.post("http://localhost:3050/updateTask",{id:x,name:updateValue})

    }


    const filteredTasks = tasks.filter( async (item) => {

        if (statusFilter === 'Completed') {
            return item.completed;
        } else if (statusFilter === 'Not Completed') {
            return !item.completed;
        } else {
            return true;
        }
    });

    useEffect(() => {
        axios
            .get(`http://localhost:3050/view?status=${statusFilter}`)
            .then((response) => {
                setTasks(response.data)
            })
            .catch((error) => console.log(error));
    }, [AddingBack]);


    function handleSort() {
        const tasksClone=[...tasks]
        const temp=tasksClone[dragItem.current]
        tasksClone[dragItem.current]=tasksClone[dragOverItem.current]
        tasksClone[dragOverItem]=temp
        setTasks(tasksClone.slice(1,tasksClone.length))
        console.log(tasks)
    }

    return (
        <div className="lists">

            <div><h1 className="heading">Task Manager</h1></div>
            <ul className={"list_items"}>
                <li className={"input_item"} >
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Add text"
                        value={newItem}
                        onChange={(e) => handleAdd(e.target.value)}
                    />
                    <button onClick={AddingBack}>Add</button>
                    <select onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="ALL">ALL</option>
                        <option value="Completed">Completed</option>
                        <option value="Not Completed">Not Completed</option>
                    </select>
                </li>

                {filteredTasks.map((item ,index) => (

                    <li key={index} className={"list_item"}
                        draggable
                        onDragStart={()=>(dragItem.current=index)}
                        onDragEnter={()=>(dragOverItem.current=index)}
                        onDragEnd={handleSort}
                        onDragOver={(e)=>e.preventDefault()}
                    >
                        <input
                            type={"checkbox"}
                            checked={item.completed}
                            onChange={() => handleUpdate(item._id, !item.completed)}
                        />
                        <div className={"items"}>
                            <div className={"item"}>{item.name}</div>
                            <div className={"item"}>{item.date}</div>
                            <Popup trigger={<button>Update</button>} position={"right center"}>
                                <div>
                                    <input type={"text"}  onChange={(e)=>handleUpdateTask(e.target.value)}/>
                                    <button onClick={()=>addUpdate(item._id)}>SUBMIT</button>
                                </div>
                            </Popup>
                            <button onClick={() => handleDelete(item._id)}>Delete</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};
export default Tasks;