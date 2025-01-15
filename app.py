from flask import Flask, render_template, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return render_template("anuvyx.html")  # Sirve el HTML desde la carpeta templates

@app.route("/contact", methods=["POST"])
def contact():
    data = request.json
    if not data:
        return jsonify({"message": "No data provided", "status": "error"}), 400
    
    name = data.get("name", "Anonymous")
    email = data.get("email", "No email provided")
    message = data.get("message", "No message provided")
    
    # Guardar en un archivo
    with open("messages.txt", "a") as file:
        file.write(f"Name: {name}\nEmail: {email}\nMessage: {message}\n---\n")
    
    return jsonify({"message": "Thank you for contacting us!", "status": "success"})

if __name__ == "__main__":
    app.run(debug=True)
