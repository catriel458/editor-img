import React, { useState, useRef, useEffect } from 'react';
import { fabric } from 'fabric';

const App = () => {
  const [canvas, setCanvas] = useState(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const fileInputRef = useRef(null);
  const textInputRef = useRef(null);
  const [drawingColor, setDrawingColor] = useState('#000000');
  const [drawingWidth, setDrawingWidth] = useState(5);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFont, setSelectedFont] = useState('Arial');
  const [textSize, setTextSize] = useState(24);
  const [textColor, setTextColor] = useState('#000000');
  const [currentBackground, setCurrentBackground] = useState(null);
  const [brushType, setBrushType] = useState('pencil'); // para controlar el tipo de pincel
  const [isEraserMode, setIsEraserMode] = useState(false);
  // Lista de emojis populares para elegir
  const popularEmojis = [
    '😀', '😂', '😍', '🥰', '😎', '🤩', '😊', '🤔', '👍', '👏',
    '❤️', '🔥', '✨', '🎉', '🌟', '🌈', '🍕', '🍦', '🏆', '🎵',
    '🚀', '🌺', '🐱', '🐶', '🦄', '🌍', '☀️', '🌙', '⭐', '☁️'
  ];

  const backgrounds = {
    playa: 'https://cdn.create.vista.com/downloads/a3d98ff7-f151-46d9-9746-50209540a16f_1024.jpeg',
    montaña: 'https://www.blogdelfotografo.com/wp-content/uploads/2018/11/michael-brandt-332242-unsplash.jpg',
    ciberpunk: 'https://steamuserimages-a.akamaihd.net/ugc/2058741574591783871/4D7980984EDE0CE15FA49CACAB95A1655F2E2B83/',
    space: 'https://images.pexels.com/photos/1146134/pexels-photo-1146134.jpeg'
  };

  useEffect(() => {
    // Limpieza al desmontar el componente
    return () => {
      if (canvas) {
        canvas.dispose();
      }
    };
  }, [canvas]);

  // Agregar este nuevo useEffect para el manejo de teclas


useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.key === 'Delete' && canvas) {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        // Si es la primera imagen (imagen principal), no la borramos
        if (activeObject.type === 'image' && canvas.getObjects().indexOf(activeObject) === 0) {
          return;
        }
        canvas.remove(activeObject);
        canvas.renderAll();
      }
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => {
    window.removeEventListener('keydown', handleKeyDown);
  };
}, [canvas]);

// Modificar la función del botón de eliminar
const deleteSelectedObject = () => {
  if (!canvas) return;
  const activeObject = canvas.getActiveObject();
  if (activeObject) {
    // Si es la primera imagen (imagen principal), no la borramos
    if (activeObject.type === 'image' && canvas.getObjects().indexOf(activeObject) === 0) {
      return;
    }
    canvas.remove(activeObject);
    canvas.renderAll();
  }
};

  const initCanvas = (imgSrc) => {
    const newCanvas = new fabric.Canvas('canvas', {
      width: 800, // Aumentar el tamaño del canvas
      height: 800,
      backgroundColor: 'white',
      isDrawingMode: false,
    });



   fabric.Image.fromURL(imgSrc, (img) => {
    const scale = Math.min(
      (newCanvas.width * 0.8) / img.width,
      (newCanvas.height * 0.8) / img.height
    );
    img.scale(scale);
    img.set({
      left: (newCanvas.width - img.width * scale) / 2,
      top: (newCanvas.height - img.height * scale) / 2,
    });
    newCanvas.add(img);
    newCanvas.renderAll();
  }, { crossOrigin: 'anonymous' });

  setCanvas(newCanvas);
};


  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      initCanvas(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Agregar esta función para la goma de borrar
const enableEraser = () => {
  if (!canvas) return;
  canvas.isDrawingMode = true;
  canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
  canvas.freeDrawingBrush.width = drawingWidth;
  canvas.freeDrawingBrush.color = '#ffffff'; // Color blanco para borrar
  setIsEraserMode(true);
  setIsDrawingMode(true);
};

  const applyFilter = (filterType) => {
    if (!canvas) return;
    const img = canvas.getObjects()[0];
    if (!img) return;

    // Store original dimensions and position
    const originalLeft = img.left;
    const originalTop = img.top;
    const originalScaleX = img.scaleX;
    const originalScaleY = img.scaleY;
    const originalAngle = img.angle || 0;

    switch (filterType) {
      case 'grayscale':
        img.filters.push(new fabric.Image.filters.Grayscale());
        break;
      case 'sepia':
        img.filters.push(new fabric.Image.filters.Sepia());
        break;
      case 'invert':
        img.filters.push(new fabric.Image.filters.Invert());
        break;
      case 'retro':
        img.filters.push(new fabric.Image.filters.Pixelate({ blocksize: 5 }));
        break;
      case 'blur':
        img.filters.push(new fabric.Image.filters.Blur({ value: 0.5 }));
        break;
      case 'brightness':
        img.filters.push(new fabric.Image.filters.Brightness({ brightness: 0.2 }));
        break;
      case 'contrast':
        img.filters.push(new fabric.Image.filters.Contrast({ contrast: 0.5 }));
        break;
      case 'blur':
        img.filters.push(new fabric.Image.filters.Blur({ blur: 0.25 })); // Corregido
        break;
      case 'vintage':
        img.filters.push(
          new fabric.Image.filters.Sepia(),
          new fabric.Image.filters.Noise({ noise: 25 }),
          new fabric.Image.filters.Brightness({ brightness: -0.1 })
        );
        break;
      case 'sharpen':
        img.filters.push(new fabric.Image.filters.Convolute({
          matrix: [0, -1, 0, -1, 5, -1, 0, -1, 0]
        }));
        break;
      case 'emboss':
        img.filters.push(new fabric.Image.filters.Convolute({
          matrix: [1, 1, 1, 1, 0.7, -1, -1, -1, -1]
          }));
          break;
      case 'posterize':
        img.filters.push(new fabric.Image.filters.Gamma({ gamma: [2, 2, 2] }));
        break;
      default:
        img.filters = [];
    }

    img.applyFilters();
    
    // Restore original dimensions and position
    img.set({
      left: originalLeft,
      top: originalTop,
      scaleX: originalScaleX,
      scaleY: originalScaleY,
      angle: originalAngle
    });
    
    img.setCoords();
    canvas.renderAll();
  };


  const resetFilters = () => {
    if (!canvas) return;
    const img = canvas.getObjects()[0];
    if (!img) return;
    
    // Store original dimensions and position
    const originalLeft = img.left;
    const originalTop = img.top;
    const originalScaleX = img.scaleX;
    const originalScaleY = img.scaleY;
    const originalAngle = img.angle || 0;
    
    img.filters = [];
    img.applyFilters();
    
    // Restore original dimensions and position
    img.set({
      left: originalLeft,
      top: originalTop,
      scaleX: originalScaleX,
      scaleY: originalScaleY,
      angle: originalAngle
    });
    
    img.setCoords();
    canvas.renderAll();
  };


const enableCircleBrush = () => {
  if (!canvas) return;
  canvas.isDrawingMode = true;
  canvas.freeDrawingBrush = new fabric.CircleBrush(canvas);
  canvas.freeDrawingBrush.width = drawingWidth;
  canvas.freeDrawingBrush.color = drawingColor;
  setBrushType('circle');
};

const enablePatternBrush = () => {
  if (!canvas) return;
  canvas.isDrawingMode = true;
  canvas.freeDrawingBrush = new fabric.PatternBrush(canvas);
  canvas.freeDrawingBrush.width = drawingWidth;
  canvas.freeDrawingBrush.color = drawingColor;
  canvas.freeDrawingBrush.source = createPatternSource();
  setBrushType('pattern');
};

// Agregar estas funciones de dibujo
const enablePencilBrush = () => {
  if (!canvas) return;
  canvas.isDrawingMode = true;
  canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
  canvas.freeDrawingBrush.width = drawingWidth;
  canvas.freeDrawingBrush.color = drawingColor;
  setBrushType('pencil');
};

// Función auxiliar para crear el patrón
const createPatternSource = () => {
  const patternCanvas = document.createElement('canvas');
  patternCanvas.width = 10;
  patternCanvas.height = 10;
  const ctx = patternCanvas.getContext('2d');
  ctx.strokeStyle = drawingColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 5);
  ctx.lineTo(10, 5);
  ctx.moveTo(5, 0);
  ctx.lineTo(5, 10);
  ctx.stroke();
  return patternCanvas;
};

// Agregar esta función para manejar la subida de imágenes adicionales
const handleAddImage = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    fabric.Image.fromURL(e.target.result, (img) => {
      // Redimensionar la imagen para que no sea demasiado grande
      const maxSize = 200;
      const scale = Math.min(maxSize / img.width, maxSize / img.height);
      
      img.scale(scale);
      
      // Colocar la imagen en el centro del canvas
      img.set({
        left: canvas.width / 2 - (img.width * scale) / 2,
        top: canvas.height / 2 - (img.height * scale) / 2
      });
      
      // Hacer la imagen seleccionable y movible
      img.set({
        selectable: true,
        hasControls: true,
        hasBorders: true
      });
      
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
    });
  };
  reader.readAsDataURL(file);
  
  // Limpiar el input para permitir subir la misma imagen múltiples veces
  event.target.value = '';
};

const addText = () => {
  if (!canvas || !textInputRef.current) return;
  
  const text = new fabric.Text(textInputRef.current.value, {
    left: canvas.width / 2,
    top: canvas.height / 2,
    fontSize: textSize,
    fontFamily: selectedFont,
    fill: textColor,
    selectable: true,
    originX: 'center',
    originY: 'center'
  });

  // Agregar el texto y traerlo al frente
  canvas.add(text);
  text.bringToFront();
  canvas.setActiveObject(text);
  canvas.renderAll();
  
  // Limpiar el input
  textInputRef.current.value = '';
};

  const setBackground = (color) => {
    if (!canvas) return;
    canvas.setBackgroundColor(color, canvas.renderAll.bind(canvas));
  };

  const downloadImage = () => {
    if (!canvas) return;
    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1,
    });
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'edited-image.png';
    link.click();
  };

  const rotateImage = () => {
    if (!canvas) return;
    const img = canvas.getObjects()[0];
    if (!img) return;
    
    img.rotate((img.angle || 0) + 90); // Rota la imagen 90 grados
    canvas.renderAll();
  };



  // Nueva función para habilitar/deshabilitar modo dibujo
  // Modificar la función toggleDrawingMode existente
const toggleDrawingMode = () => {
  if (!canvas) return;
  
  const newMode = !isDrawingMode;
  setIsDrawingMode(newMode);
  setIsEraserMode(false);
  canvas.isDrawingMode = newMode;
  
  if (newMode) {
    canvas.freeDrawingBrush.color = drawingColor;
    canvas.freeDrawingBrush.width = drawingWidth;
  }
};


  // Función para actualizar el color del pincel
// Modificar la función handleColorChange existente
const handleColorChange = (e) => {
  const newColor = e.target.value;
  setDrawingColor(newColor);
  setIsEraserMode(false);
  
  if (canvas && canvas.isDrawingMode) {
    canvas.freeDrawingBrush.color = newColor;
  }
};


  // Función para actualizar el ancho del pincel
  const handleWidthChange = (e) => {
    const newWidth = parseInt(e.target.value, 10);
    setDrawingWidth(newWidth);
    
    if (canvas && canvas.isDrawingMode) {
      canvas.freeDrawingBrush.width = newWidth;
    }
  };

  // Función para borrar el último trazo
  const undoLastStroke = () => {
    if (!canvas) return;
    
    const objects = canvas.getObjects();
    if (objects.length > 0) {
      canvas.remove(objects[objects.length - 1]);
    }
  };

  // Función para añadir emoji
  const addEmoji = (emoji) => {
    if (!canvas) return;
    
    const text = new fabric.Text(emoji, {
      left: 150,
      top: 150,
      fontSize: 40,
      selectable: true,
    });
    
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    
    // Ocultar el selector después de seleccionar
    setShowEmojiPicker(false);
  };

  // Función para limpiar todos los elementos excepto la imagen base
  const clearCanvas = () => {
    if (!canvas) return;
    
    const objects = canvas.getObjects();
    if (objects.length > 0) {
      // Mantener sólo la imagen base (asumiendo que es el primer objeto)
      const baseImage = objects[0];
      canvas.clear();
      
      if (baseImage && baseImage.type === 'image') {
        canvas.add(baseImage);
      }
      
      canvas.renderAll();
    }
  };

  // Agregar función para manejar fondos predefinidos
const setBackgroundImage = (type) => {
  if (!canvas) return;
  
  fabric.Image.fromURL(backgrounds[type], (img) => {
    const scale = Math.max(
      canvas.width / img.width,
      canvas.height / img.height
    );
    
    img.scale(scale);
    canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
      originX: 'left',
      originY: 'top',
      left: 0,
      top: 0
    });
  }, { crossOrigin: 'anonymous' });
};


// Modificar la función de spray
const enableSprayBrush = () => {
  if (!canvas) return;
  canvas.isDrawingMode = true;
  canvas.freeDrawingBrush = new fabric.SprayBrush(canvas);
  canvas.freeDrawingBrush.width = drawingWidth;
  canvas.freeDrawingBrush.color = drawingColor;
  canvas.freeDrawingBrush.density = 50;
};

const initFreeformCrop = () => {
  if (!canvas) return;
  
  let isDrawing = false;
  let path = null;
  
  // Desactivar selección de objetos mientras se recorta
  canvas.selection = false;
  canvas.forEachObject((obj) => {
    obj.selectable = false;
    obj.evented = false;
  });

  canvas.on('mouse:down', (options) => {
    isDrawing = true;
    const pointer = canvas.getPointer(options.e);
    path = new fabric.Path(`M ${pointer.x} ${pointer.y}`, {
      strokeWidth: 2,
      stroke: 'red',
      fill: 'rgba(255,0,0,0.2)',
      selectable: false
    });
    canvas.add(path);
  });

  canvas.on('mouse:move', (options) => {
    if (!isDrawing) return;
    const pointer = canvas.getPointer(options.e);
    path.path.push(['L', pointer.x, pointer.y]);
    canvas.renderAll();
  });

  canvas.on('mouse:up', () => {
    isDrawing = false;
    path.closePath();
    
    // Crear botones de acción
    const buttons = document.createElement('div');
    buttons.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 1000;
      background: white;
      padding: 10px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      display: flex;
      gap: 10px;
    `;
    
    const createButton = (text, onClick, color) => {
      const button = document.createElement('button');
      button.textContent = text;
      button.style.cssText = `
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        background-color: ${color};
        color: white;
        font-size: 14px;
      `;
      button.onclick = onClick;
      return button;
    };

    const applyCropButton = createButton('Recortar Área', () => {
      const img = canvas.getObjects().find(obj => obj.type === 'image');
      if (img) {
        img.clipPath = path;
        canvas.remove(path);
        canvas.renderAll();
        document.body.removeChild(buttons);
        resetCanvasEvents();
      }
    }, '#4CAF50');

    const deleteButton = createButton('Borrar Área', () => {
      const img = canvas.getObjects().find(obj => obj.type === 'image');
      if (img) {
        path.inverted = true;
        img.clipPath = path;
        canvas.remove(path);
        canvas.renderAll();
        document.body.removeChild(buttons);
        resetCanvasEvents();
      }
    }, '#f44336');

    const cancelButton = createButton('Cancelar', () => {
      canvas.remove(path);
      canvas.renderAll();
      document.body.removeChild(buttons);
      resetCanvasEvents();
    }, '#2196F3');

    buttons.appendChild(applyCropButton);
    buttons.appendChild(deleteButton);
    buttons.appendChild(cancelButton);
    document.body.appendChild(buttons);
  });

  const resetCanvasEvents = () => {
    canvas.off('mouse:down');
    canvas.off('mouse:move');
    canvas.off('mouse:up');
    canvas.selection = true;
    canvas.forEachObject((obj) => {
      obj.selectable = true;
      obj.evented = true;
    });
  };
};

// Agregar función para subir imagen de fondo
const handleBackgroundUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    fabric.Image.fromURL(e.target.result, (img) => {
      const scale = Math.max(
        canvas.width / img.width,
        canvas.height / img.height
      );
      
      img.scale(scale);
      canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
        originX: 'left',
        originY: 'top',
        left: 0,
        top: 0
      });
    });
  };
  reader.readAsDataURL(file);
};


  return (
    <div className="container">
      <h1>🎨 Editor de Imágenes</h1>
      <p className="description">
        ¡Sube tu imagen y aplica filtros! 🌈✨<br/>
        Filtra en blanco y negro, vintage, retro, o dibuja y agrega texto.🤓 <br/>
        Agrega fondos divertidos para tu imagenes. 🤗 <br/>
        Agrega otras imagenes para que le hagan compañia. ❤️ <br/>
        ¡Diviértete! 📷
      </p>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        ref={fileInputRef}
        className="file-input"
      />

       {/* Agregar aviso de recarga */}
    <div className="reload-notice">
      ⚠️ Recargue la página para cargar una nueva imagen
    </div>

      <div className="image-preview">
        <canvas id="canvas"></canvas>
      </div>

      {/* Filtros */}
      <div className="section">
        <h3>Filtros</h3>
        <div className="options">
          <button className="button" onClick={() => applyFilter('grayscale')}>Blanco y Negro</button>
          <button className="button" onClick={() => applyFilter('sepia')}>Vintage</button>
          <button className="button" onClick={() => applyFilter('invert')}>Invertir Colores</button>
          <button className="button" onClick={() => applyFilter('retro')}>Retro (8 Bits)</button>
          <button className="button" onClick={() => applyFilter('blur')}>Desenfoque</button>
          <button className="button" onClick={() => applyFilter('brightness')}>Brillo</button>
          <button className="button" onClick={() => applyFilter('contrast')}>Contraste</button>
          <button className="button" onClick={() => applyFilter('vintage')}>Vintage Pro</button>
          <button className="button" onClick={() => applyFilter('sharpen')}>Nitidez</button>
          <button className="button" onClick={() => applyFilter('emboss')}>Relieve</button>
          <button className="button" onClick={() => applyFilter('posterize')}>Posterizar</button>
          <button className="button" onClick={resetFilters}>Reiniciar Filtros</button>
        </div>
      </div>

      {/* Herramientas de dibujo - NUEVA SECCIÓN */}
      <div className="section">
      <h3>Herramientas de Dibujo</h3>
      <div className="drawing-tools">
        <button 
          className={`button ${isDrawingMode ? 'active' : ''}`} 
          onClick={toggleDrawingMode}
        >
          {isDrawingMode ? '✏️ Desactivar Dibujo' : '✏️ Activar Dibujo'}
        </button>

        <button 
        className={`button ${brushType === 'pencil' ? 'active' : ''}`} 
        onClick={enablePencilBrush}
      >
        ✏️ Lápiz
      </button>

        <button 
        className={`button ${brushType === 'circle' ? 'active' : ''}`} 
        onClick={enableCircleBrush}
      >
        🔵 Pincel Circular
      </button>
      <button 
        className={`button ${brushType === 'pattern' ? 'active' : ''}`} 
        onClick={enablePatternBrush}
      >
        🎨 Pincel Patrón
      </button>

      <button 
        className={`button ${isEraserMode ? 'active' : ''}`} 
        onClick={enableEraser}
      >
        🧹 Borrador
      </button>

        <button className="button" onClick={enableSprayBrush}>🎨 Spray</button>
          
          {isDrawingMode && (
            <div className="drawing-options">
              <div className="option-group">
                <label>Color: </label>
                <input 
                  type="color" 
                  value={drawingColor}
                  onChange={handleColorChange}
                  className="color-picker"
                />
              </div>
              
              <div className="option-group">
                <label>Grosor: </label>
                <input 
                  type="range" 
                  min="1" 
                  max="50" 
                  value={drawingWidth}
                  onChange={handleWidthChange}
                  className="width-slider"
                />
                <span>{drawingWidth}px</span>
              </div>
              
              <button className="button" onClick={undoLastStroke}>↩️ Deshacer</button>
            </div>
          )}
        </div>
      </div>

      {/* Sección de emojis - NUEVA SECCIÓN */}
      <div className="section">
        <h3>Emojis</h3>
        <button 
          className="button emoji-toggle" 
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          {showEmojiPicker ? 'Ocultar Emojis' : 'Mostrar Emojis 😊'}
        </button>
        
        {showEmojiPicker && (
          <div className="emoji-picker">
            {popularEmojis.map((emoji, index) => (
              <button 
                key={index} 
                className="emoji-button" 
                onClick={() => addEmoji(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>


      {/* Nueva sección para agregar imágenes */}
  <div className="section">
    <h3>Agregar Imágenes</h3>
    <div className="image-upload-section">
      <p className="description">
        Sube imágenes adicionales para agregarlas a tu diseño 🖼️<br />
        Puedes moverlas, rotarlas y redimensionarlas
      </p>
      <input
        type="file"
        accept="image/*"
        onChange={handleAddImage}
        className="file-input"
        style={{ marginBottom: '10px' }}
      />
      <div className="image-tips">
        <small>
          💡 Tips:
          <ul>
            <li>Click y arrastra para mover</li>
            <li>Usa las esquinas para redimensionar</li>
            <li>Doble click para traer al frente</li>
          </ul>
        </small>
      </div>
    </div>
  </div>

      {/* Texto */}
      <div className="section">
      <h3>Texto</h3>
      <div className="text-tools">
        <input
          type="text"
          ref={textInputRef}
          className="textbox"
          placeholder="Escribe tu texto aquí"
        />
        <select 
          value={selectedFont} 
          onChange={(e) => setSelectedFont(e.target.value)}
          className="font-select"
        >
          <option value="Arial">Arial</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
          <option value="Georgia">Georgia</option>
        </select>
        <input 
          type="number" 
          value={textSize} 
          onChange={(e) => setTextSize(e.target.value)}
          className="size-input"
          min="8"
          max="72"
        />
        <input 
          type="color" 
          value={textColor} 
          onChange={(e) => setTextColor(e.target.value)}
          className="color-picker"
        />
        <button className="button" onClick={addText}>Agregar Texto</button>
      </div>
    </div>

    <div className="section">
  <h3>Eliminar Elementos</h3>
  <div className="delete-section">
    <p className="description">
      Seleccione una imagen subida, emoji o texto y lo puede eliminar apretando en su teclado "Supr" o con este botón
    </p>
    <button className="button danger" onClick={deleteSelectedObject}>
      🗑️ Eliminar Elemento
    </button>
  </div>
</div>


      {/* Fondo */}
      <div className="section">
        <h3>Fondo Predefinido</h3>
        <div className="background-notice">
        ⚠️ Para poner un fondo detrás de la imagen tiene que ser PNG
      </div>
        <div className="background-options">
        <input
        type="file"
        accept="image/*"
        onChange={handleBackgroundUpload}
        className="file-input"
        style={{ marginBottom: '10px' }}
      />
          <button className="button" onClick={() => setBackground('lightblue')}>Azul Claro</button>
          <button className="button" onClick={() => setBackground('lightgreen')}>Verde Claro</button>
          <button className="button" onClick={() => setBackground('lightyellow')}>Amarillo Claro</button>
          <button className="button" onClick={() => setBackground('lightpink')}>Rosa Claro</button>
          <button className="button" onClick={() => setBackgroundImage('playa')}>Playa</button>
          <button className="button" onClick={() => setBackgroundImage('montaña')}>Montaña</button>
          <button className="button" onClick={() => setBackgroundImage('ciberpunk')}>Ciberpunk</button>
          <button className="button" onClick={() => setBackgroundImage('space')}>Espacio</button>
        </div>
      </div>

      {/* Opciones Adicionales */}
      <div className="section">
        <h3>Opciones Adicionales</h3>
        <div className="additional-options">
          <button className="button" onClick={rotateImage}>Rotar Imagen</button>
          <button className="button" onClick={initFreeformCrop}>Recortar Imagen</button>
          <button className="button danger" onClick={clearCanvas}>Limpiar Lienzo</button>
          <button className="button primary" onClick={downloadImage}>Descargar Imagen</button>
        </div>
      </div>

      <footer className="footer">
  <p>
    Realizado por Catriel Cabrera 👨‍💻 | Todos los derechos reservados ©️ 2024 | 
    Contacto: 📧 catrielcabrera97@gmail.com | 
    GitHub: 🚀 <a href="https://github.com/catriel458" target="_blank" rel="noopener noreferrer">@catriel458</a>
  </p>
</footer>

      {/* Estilos CSS en línea para las nuevas funcionalidades */}
      <style jsx>{`
        ..container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
  
  h1 {
    color: #2c3e50;
    text-align: center;
    font-size: 2rem;
    font-weight: 600;
  }

  .description {
    text-align: center;
    color: #6c757d;
    line-height: 1.4;
    font-size: 0.95rem;
  }
  
  .section {
    margin-bottom: 20px;
    border: 1px solid #ddd;
    padding: 15px;
    border-radius: 8px;
    background-color: #f9f9f9;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }

  .section h3 {
    color: #2c3e50;
    margin-bottom: 1rem;
    font-size: 1.2rem;
    font-weight: 500;
  }
  
  .options, .drawing-tools {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .button {
    padding: 8px 12px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.9rem;
    font-weight: 500;
  }
  
  .button:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
  
  .button.active {
    background-color: #2196F3;
  }
  
  .button.danger {
    background-color: #f44336;
  }
  
  .button.primary {
    background-color: #2196F3;
  }
  
  .drawing-options {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 15px;
    margin-top: 10px;
  }
  
  .option-group {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  
  .color-picker {
    width: 40px;
    height: 40px;
    padding: 0;
    border: none;
    cursor: pointer;
    border-radius: 4px;
  }
  
  .width-slider {
    width: 100px;
  }

  .file-input {
    width: 100%;
    padding: 10px;
    margin: 10px 0;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 0.9rem;
  }

  .image-preview {
    margin: 20px 0;
    display: flex;
    justify-content: center;
  }
  
  canvas {
    border: 1px solid #ddd;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }

  .reload-notice, .background-notice {
    background-color: #fff3cd;
    border: 1px solid #ffeeba;
    color: #856404;
    padding: 10px;
    border-radius: 4px;
    margin: 10px 0;
    font-size: 0.9rem;
  }

  .image-tips {
    color: #666;
    font-size: 0.85rem;
    margin-top: 10px;
  }

  .image-tips ul {
    margin: 5px 0;
    padding-left: 20px;
  }

  .image-tips li {
    margin: 3px 0;
  }

   .footer {
    text-align: center;
    padding: 20px;
    margin-top: 40px;
    border-top: 1px solid #ddd;
    color: #666;
    font-size: 0.9rem;
  }

  .footer a {
    color: #2196F3;
    text-decoration: none;
    transition: color 0.2s ease;
  }

  .footer a:hover {
    color: #0d47a1;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .container {
      padding: 15px;
    }

    h1 {
      font-size: 1.75rem;
    }

    .section {
      padding: 12px;
    }

    .options, .drawing-tools {
      flex-direction: column;
    }

    .button {
      width: 100%;
      text-align: center;
      padding: 10px;
    }

    .drawing-options {
      flex-direction: column;
      align-items: stretch;
    }

    .option-group {
      justify-content: space-between;
    }

    .width-slider {
      width: 100%;
    }
  }

  .footer {
      font-size: 0.8rem;
      padding: 15px;
    }

  @media (max-width: 480px) {
    .container {
      padding: 10px;
    }

    h1 {
      font-size: 1.5rem;
    }

    .section h3 {
      font-size: 1.1rem;
    }

    .button {
      font-size: 0.85rem;
    }
  }

  .footer p {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

      `}</style>
    </div>
  );
};

export default App;