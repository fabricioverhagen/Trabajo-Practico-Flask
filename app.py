from flask import Flask, render_template,request,redirect,url_for,session,flash
import sqlite3
import os


app = Flask(__name__)
app.secret_key = "admin"

def get_db_connection():
    # Esto busca en la carpeta del proyecto
    db_path = os.path.join(os.path.dirname(__file__), 'basededatosflask.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

@app.route("/")
def home():
    return redirect(url_for("login"))

@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        nombre = request.form["nombre"]
        email = request.form["email"]
        password = request.form["password"]
        rol = "usuario"

        conn = get_db_connection()
        try:
            conn.execute(
                "INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)",
                (nombre, email, password, rol)
            )
            conn.commit()
            flash("Registro exitoso. Ahora puedes iniciar sesión.", "success")
            return redirect(url_for("login"))
        except sqlite3.IntegrityError:
            flash("El correo electrónico ya está registrado.", "danger")
        finally:
            conn.close()
    return render_template("register.html")

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form["email"]
        password = request.form["password"]

        conn = get_db_connection()
        user = conn.execute(
            "SELECT * FROM usuarios WHERE email = ? AND password = ?",
            (email, password)
        ).fetchone()
        conn.close()

        if user:
            session["user"] = user["nombre"]
            return redirect(url_for("dashboard"))
        else:
            flash("Email o contraseña incorrectos.", "danger")

    return render_template("login.html")



@app.route('/dashboard',methods=['GET'])
def dashboard():
    if "user" in session:
        return render_template("dashboard.html", nombre=session["user"])
    else:
        flash("Debes iniciar sesión para acceder al dashboard.", "warning")
        return redirect(url_for("login"))

@app.route('/dashboard/gestion_clientes', methods=['GET'])
def gestion_clientes():
    return render_template('gestion_clientes.html')

@app.route('/dashboard/gestion_productos', methods=['GET'])
def gestion_productos():
    return render_template('gestion_productos.html')

@app.route('/dashboard/emitir_factura', methods=['GET'])
def emitir_factura():
    return render_template('emitir_factura.html')

@app.route('/dashboard/listado_facturas', methods=['GET'])
def listado_facturas():
    return render_template('listado_facturas.html')

@app.route("/about")
def about():
    return render_template("about.html")

if __name__ == "__main__":
    app.run(debug=True)