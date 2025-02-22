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

  // Lista de emojis populares para elegir
  const popularEmojis = [
    '😀', '😂', '😍', '🥰', '😎', '🤩', '😊', '🤔', '👍', '👏',
    '❤️', '🔥', '✨', '🎉', '🌟', '🌈', '🍕', '🍦', '🏆', '🎵',
    '🚀', '🌺', '🐱', '🐶', '🦄', '🌍', '☀️', '🌙', '⭐', '☁️'
  ];

  useEffect(() => {
    // Limpieza al desmontar el componente
    return () => {
      if (canvas) {
        canvas.dispose();
      }
    };
  }, [canvas]);

  const initCanvas = (imgSrc) => {
    const newCanvas = new fabric.Canvas('canvas', {
      width: 400,
      height: 400,
      backgroundColor: 'white',
      isDrawingMode: false,
    });

    fabric.Image.fromURL(imgSrc, (img) => {
      const scale = Math.min(newCanvas.width / img.width, newCanvas.height / img.height);
      img.scale(scale); // Escala la imagen para que quepa en el lienzo
      img.set({
        left: (newCanvas.width - img.width * scale) / 2, // Centra horizontalmente
        top: (newCanvas.height - img.height * scale) / 2, // Centra verticalmente
      });
      newCanvas.add(img);
      newCanvas.renderAll();
    });

    // Configurar el pincel para dibujo libre
    newCanvas.freeDrawingBrush.color = drawingColor;
    newCanvas.freeDrawingBrush.width = drawingWidth;

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

  const addText = () => {
    if (!canvas || !textInputRef.current.value) return;
    const text = new fabric.Text(textInputRef.current.value, {
      left: 50,
      top: 50,
      fontSize: 24,
      fill: '#000',
      selectable: true,
    });
    canvas.add(text);
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

  const cropImage = () => {
    if (!canvas) return;
    const img = canvas.getObjects()[0];
    if (!img) return;
    
    // Create a proper cropped version preserving all properties
    const cropped = new fabric.Image(img._element, {
      left: img.left,
      top: img.top,
      angle: img.angle || 0,
      scaleX: img.scaleX,
      scaleY: img.scaleY,
      filters: img.filters.slice() // Clone filters array
    });
    
    canvas.remove(img);
    canvas.add(cropped);
    
    // Apply filters if any
    if (cropped.filters && cropped.filters.length > 0) {
      cropped.applyFilters();
    }
    
    canvas.renderAll();
  };

  // Nueva función para habilitar/deshabilitar modo dibujo
  const toggleDrawingMode = () => {
    if (!canvas) return;
    
    const newMode = !isDrawingMode;
    setIsDrawingMode(newMode);
    canvas.isDrawingMode = newMode;
    
    // Actualizar configuración del pincel
    if (newMode) {
      canvas.freeDrawingBrush.color = drawingColor;
      canvas.freeDrawingBrush.width = drawingWidth;
    }
  };

  // Función para actualizar el color del pincel
  const handleColorChange = (e) => {
    const newColor = e.target.value;
    setDrawingColor(newColor);
    
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

  return (
    <div className="container">
      <h1>🎨 Editor de Imágenes</h1>
      <p className="description">
        ¡Sube tu imagen y aplica filtros! 🌈✨<br />
        Filtra en blanco y negro, vintage, retro, o dibuja y agrega texto. ¡Diviértete! 📷
      </p>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        ref={fileInputRef}
        className="file-input"
      />
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
          <button className="button" onClick={addText}>Agregar Texto</button>
        </div>
      </div>

      {/* Fondo */}
      <div className="section">
        <h3>Fondo Predefinido</h3>
        <div className="background-options">
          <button className="button" onClick={() => setBackground('lightblue')}>Azul Claro</button>
          <button className="button" onClick={() => setBackground('lightgreen')}>Verde Claro</button>
          <button className="button" onClick={() => setBackground('lightyellow')}>Amarillo Claro</button>
          <button className="button" onClick={() => setBackground('lightpink')}>Rosa Claro</button>
        </div>
      </div>

      {/* Opciones Adicionales */}
      <div className="section">
        <h3>Opciones Adicionales</h3>
        <div className="additional-options">
          <button className="button" onClick={rotateImage}>Rotar Imagen</button>
          <button className="button" onClick={cropImage}>Recortar Imagen</button>
          <button className="button danger" onClick={clearCanvas}>Limpiar Lienzo</button>
          <button className="button primary" onClick={downloadImage}>Descargar Imagen</button>
        </div>
      </div>

      {/* Estilos CSS en línea para las nuevas funcionalidades */}
      <style jsx>{`
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        
        .section {
          margin-bottom: 20px;
          border: 1px solid #ddd;
          padding: 15px;
          border-radius: 8px;
          background-color: #f9f9f9;
        }
        
        .options {
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
          transition: background-color 0.3s;
        }
        
        .button:hover {
          background-color: #45a049;
        }
        
        .button.active {
          background-color: #2196F3;
        }
        
        .button.primary {
          background-color: #2196F3;
        }
        
        .button.danger {
          background-color: #f44336;
        }
        
        .drawing-tools, .drawing-options {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 15px;
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
        }
        
        .width-slider {
          width: 100px;
        }
        
        .emoji-picker {
          display: grid;
          grid-template-columns: repeat(10, 1fr);
          gap: 5px;
          margin-top: 10px;
        }
        
        .emoji-button {
          font-size: 24px;
          background: none;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 5px;
          cursor: pointer;
          transition: transform 0.1s;
        }
        
        .emoji-button:hover {
          transform: scale(1.2);
          background-color: #f0f0f0;
        }
        
        .image-preview {
          margin: 20px 0;
          display: flex;
          justify-content: center;
        }
        
        canvas {
          border: 1px solid #ddd;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        
        .textbox {
          padding: 8px;
          width: 250px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        
        .file-input {
          display: block;
          margin: 10px 0;
        }
      `}</style>
    </div>
  );
};

export default App;