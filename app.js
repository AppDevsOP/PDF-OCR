const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const pdf2img = require('pdf2img');
const Tesseract = require('tesseract.js');

app.use(bodyParser.json({ limit: '50mb' })); // Aumenta el límite según tus necesidades
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' })); // Aumenta el límite según tus necesidades
app.use(express.static(path.join(__dirname, 'public')));



app.post('/process-ocr', async (req, res) => {
  const imageSrc = req.body.image;

  // Cambia el nombre del archivo si es necesario
  const pdfFilePath = path.join(__dirname, 'input.pdf');

  // Convertir PDF en imágenes
  const options = {
    outputdir: path.join(__dirname, 'pdf_images'),
    format: 'png',
    prefix: 'image_'
  };
  
  await pdf2img.setOptions(options);
  const images = await pdf2img.convert(pdfFilePath);

  // Realizar OCR en cada imagen
  const ocrResults = [];
  for (const image of images) {
    const { data: { text } } = await Tesseract.recognize(image.path, 'eng');
    ocrResults.push(text);
  }

  res.json({ ocrResults });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(3000, () => {
  console.log('Servidor escuchando en el puerto 3000');
});
