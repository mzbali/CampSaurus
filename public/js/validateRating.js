document.querySelector('#reviewbtn').addEventListener('click', (e) => {
    if (document.querySelector('#body').value.trim() && document.querySelector('#no-rate').checked) {
        return e.preventDefault();
    }
})