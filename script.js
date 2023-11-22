const canvas = document.getElementById('paintCanvas');
const context = canvas.getContext('2d');

function downloadCanvasWithFilename(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function saveAsPNGWithFilename(canvas, filename) {
    const url = canvas.toDataURL('image/png');
    downloadCanvasWithFilename(url, filename);
}

function saveAsJPGWithFilename(canvas, filename) {
    const url = canvas.toDataURL('image/jpeg', 0.8);
    downloadCanvasWithFilename(url, filename);
}

document.addEventListener('DOMContentLoaded', function () {

    let painting = false;
    let usingEraser = false;
    let undoStack = [];
    let redoStack = [];
    let brushSize = 5;

    function startPosition(e) {
        painting = true;
        draw(e);
    }

    function endPosition() {
        painting = false;
        context.beginPath();
        saveState();
    }

    function draw(e) {
        if (!painting) return;

        context.lineWidth = brushSize;
        context.lineCap = 'round';

        if (usingEraser) {
            context.strokeStyle = 'white';
        } else {
            const color = document.getElementById('colorPicker').value;
            context.strokeStyle = color;
        }

        context.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
        context.stroke();
        context.beginPath();
        context.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
    }

    function clearCanvas() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        saveState();
    }

    function changeColor() {
        if (!usingEraser) {
            const color = document.getElementById('colorPicker').value;
            context.strokeStyle = color;
        }
    }

    function changeBrushSize(size) {
        brushSize = size;
    }

    function fillCanvas() {
        const color = document.getElementById('colorPicker').value;
        context.fillStyle = color;
        context.fillRect(0, 0, canvas.width, canvas.height);
        saveState();
    }

    function saveState() {
        undoStack.push(canvas.toDataURL());
        redoStack = [];
    }

    function undo() {
        if (undoStack.length > 1) {
            redoStack.push(undoStack.pop());
            const img = new Image();
            img.src = undoStack[undoStack.length - 1];
            img.onload = function () {
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.drawImage(img, 0, 0);
            };
        }
    }

    function redo() {
        if (redoStack.length > 0) {
            undoStack.push(redoStack.pop());
            const img = new Image();
            img.src = undoStack[undoStack.length - 1];
            img.onload = function () {
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.drawImage(img, 0, 0);
            };
        }
    }

    function toggleEraser() {
        usingEraser = !usingEraser;
        if (usingEraser) {
            document.getElementById('eraserBtn').innerHTML = '<i class="fa-solid fa-pencil"></i>';
        } else {
            document.getElementById('eraserBtn').innerHTML = '<i class="fa-solid fa-eraser"></i>';
        }
    }

    function updateBrushSize(value) {
        changeBrushSize(value);
        document.getElementById('brushSizeLabel').textContent = `Tamaño: ${value}`;
    }

    canvas.addEventListener('mousedown', startPosition);
    canvas.addEventListener('mouseup', endPosition);
    canvas.addEventListener('mousemove', draw);

    document.getElementById('clearBtn').addEventListener('click', clearCanvas);
    document.getElementById('colorPicker').addEventListener('input', changeColor);
    document.getElementById('undoBtn').addEventListener('click', undo);
    document.getElementById('redoBtn').addEventListener('click', redo);
    document.getElementById('eraserBtn').addEventListener('click', toggleEraser);
    document.getElementById('fillBtn').addEventListener('click', fillCanvas);

    document.getElementById('brushSizeSlider').addEventListener('input', function (e) {
        updateBrushSize(e.target.value);
    });

    saveState();
});


document.getElementById('saveBtn').addEventListener('click', function () {
    const filename = prompt('Ingrese un nombre para el archivo:');
    if (filename) {
        const saveFormat = prompt('Escribe "png" o "jpg" para guardar la imagen en el formato deseado:');
        
        if (saveFormat === 'png') {
            saveAsPNGWithFilename(canvas, filename + '.png');
        } else if (saveFormat === 'jpg') {
            saveAsJPGWithFilename(canvas, filename + '.jpg');
        } else {
            alert('Formato no válido. Por favor, introduce "png" o "jpg".');
        }
    }
});