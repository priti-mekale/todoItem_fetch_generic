const cl = console.log;
const todoForm = document.getElementById('todoForm');
const todo = document.getElementById('todo');
const todocontainer = document.getElementById('todocontainer');
const loader = document.getElementById('loader');
const addTaskbtn = document.getElementById('addTaskbtn');
const updateTaskbtn = document.getElementById('updateTaskbtn');

let BASE_URL = "https://crud-27f49-default-rtdb.firebaseio.com";
let POST_URL = `${BASE_URL}/totos.json`;

const snackBar = (msg, icon) => {
    Swal.fire({
        title: msg,
        icon: icon,
        timer: 2000
    });
};

let objtoarr = (obj) => {
    let formArr = [];
    for (const key in obj) {
        obj[key].id = key;
        formArr.unshift(obj[key]);
    }
    return formArr;
};

let templating = (arr) => {
    let result = ``;
    arr.forEach(to => {
        result += `<div class="card mb-3">
            <div class="card-body d-flex justify-content-between align-items-start" id="${to.id}">
                <h5 class="card-title mb-0">${to.todo}</h5>
                <div class="icon-group">
                    <button onClick="onEdit(this)" class="btn btn-sm btn-outline-info">Edit</button>
                    <button onClick="onRemove(this)" class="btn btn-sm btn-outline-danger">Remove</button>
                </div>
            </div>
        </div>`;
    });
    todocontainer.innerHTML = result;
};

const makeApiCall = async (method, url, body) => {
    loader.classList.remove('d-none');
    try {
        const res = await fetch(url, {
            method: method,
            body: body ? JSON.stringify(body) : null,
            headers: {
                "Content-Type": "application/json"
            }
        });
        return await res.json();
    } catch (err) {
        cl(err);
    } finally {
        loader.classList.add('d-none');
    }
};

//  Simple and clean initial fetch function
const fetchInitialTodos = async () => {
    const res = await makeApiCall('GET', POST_URL);
    res && templating(objtoarr(res));
};
fetchInitialTodos();

//  Add Task
const onSubmitPosts = async (e) => {
    e.preventDefault();

    const obj = {
        todo: todo.value
    };

    const res = await makeApiCall('POST', POST_URL, obj);
    
        todoForm.reset();
        obj.id = res.name;

        const card = document.createElement('div');
        card.className = 'card mb-3';
        card.innerHTML = `
            <div class="card-body d-flex justify-content-between align-items-start" id="${obj.id}">
                <h5 class="card-title mb-0">${obj.todo}</h5>
                <div class="icon-group">
                    <button onClick="onEdit(this)" class="btn btn-sm btn-outline-info">Edit</button>
                    <button onClick="onRemove(this)" class="btn btn-sm btn-outline-danger">Remove</button>
                </div>
            </div>`;
        todocontainer.prepend(card);
        snackBar(`"${obj.todo}" added successfully!`, 'success');
    
};

// Edit Task
const onEdit = async (ele) => {
    const id = ele.closest('.card-body').id;
    localStorage.setItem('Edit_Id', id);
    const url = `${BASE_URL}/totos/${id}.json`;

    const res = await makeApiCall('GET', url);
  
        todo.value = res.todo;
        addTaskbtn.classList.add('d-none');
        updateTaskbtn.classList.remove('d-none');
    
};

//  Update Task
const onUpdatePost = async () => {
    const id = localStorage.getItem('Edit_Id');
    const url = `${BASE_URL}/totos/${id}.json`;

    const updated = {
        todo: todo.value,
        id: id
    };

    const res = await makeApiCall('PATCH', url, updated);
   
        todoForm.reset();

        const card = document.getElementById(id);
        const h5 = card.querySelector('h5');
        h5.innerText = res.todo;

        addTaskbtn.classList.remove('d-none');
        updateTaskbtn.classList.add('d-none');
        snackBar(`"${res.todo}" updated successfully!`, 'success');
    
};

//  Delete Task
const onRemove = async (ele) => {
    const confirm = await Swal.fire({
        title: "Are you sure?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!"
    });

    if (confirm.isConfirmed) {
        const id = ele.closest('.card-body').id;
        const url = `${BASE_URL}/totos/${id}.json`;

        await makeApiCall('DELETE', url);
        const card = document.getElementById(id).parentElement;
        card.remove();
        snackBar(`Task deleted!`, 'success');
    }
};

//  Event Listeners
todoForm.addEventListener('submit', onSubmitPosts);
updateTaskbtn.addEventListener('click', onUpdatePost);
