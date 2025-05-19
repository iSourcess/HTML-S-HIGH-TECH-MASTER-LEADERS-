from flask import Flask, request, jsonify, send_file, url_for
import os
from werkzeug.utils import secure_filename
import time
import pdfkit

app = Flask(__name__)

# Configuración
UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'static/pdfs'
ALLOWED_EXTENSIONS = {'html', 'htm', 'txt', 'md', 'docx'}

# Crear directorios si no existen
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['OUTPUT_FOLDER'] = OUTPUT_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return app.send_static_file('index.html')

# Configurar la ruta de salida para los PDFs convertidos
PDF_OUTPUT_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'converted_pdfs')

# Asegurarse de que el directorio existe
if not os.path.exists(PDF_OUTPUT_PATH):
    os.makedirs(PDF_OUTPUT_PATH)

@app.route('/convert', methods=['POST'])
def convert_to_pdf():
    try:
        # Obtener el archivo del request
        file = request.files['file']
        if file:
            # Generar nombre único para el archivo
            filename = secure_filename(file.filename)
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            pdf_filename = f"{timestamp}_{os.path.splitext(filename)[0]}.pdf"
            pdf_path = os.path.join(PDF_OUTPUT_PATH, pdf_filename)
            
            # Realizar la conversión y guardar en la nueva ubicación
            # Convertir a PDF usando pdfkit
            pdfkit.from_file(file_path, output_path)
            
            # Generar URL para descargar el PDF
            download_url = url_for('download_file', filename=output_filename, _external=True)
            
            return jsonify({
                'success': True, 
                'download_url': download_url
            })
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})
    finally:
         # Limpiar el archivo temporal
        if os.path.exists(file_path):
            os.remove(file_path)
    
    return jsonify({'success': False, 'error': 'Tipo de archivo no permitido'})

@app.route('/download/<filename>')
def download_file(filename):
    return send_file(os.path.join(app.config['OUTPUT_FOLDER'], filename), 
                     as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True)