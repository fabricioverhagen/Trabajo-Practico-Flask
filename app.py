from flask import Flask, render_template,request,redirect,url_for,session,flash
import sqlite3
import os


app = Flask(__name__)
app.secret_key = "admin"

def get_db_connection():
<<<<<<< HEAD
    # Esto busca en la carpeta del proyect
=======
    # Esto busca en la carpeta del proyecto
>>>>>>> 2c2a13a14f46f46fce3692e1ee0ec2fccade3837
    db_path = os.path.join(os.path.dirname(__file__), 'basededatosflask.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

<<<<<<< HEAD
#----------------------------------------------------- Autenticacion ------------------------------------------------------

=======
>>>>>>> 2c2a13a14f46f46fce3692e1ee0ec2fccade3837
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

#----------------------------------------------------------------------------------------------------------------------
#----------------------------------------------------- Dashboard ------------------------------------------------------

@app.route('/dashboard',methods=['GET'])
def dashboard():
    if "user" in session:
        return render_template("dashboard.html", nombre=session["user"])
    else:
        flash("Debes iniciar sesión para acceder al dashboard.", "warning")
        return redirect(url_for("login"))

#----------------------------------------------------- Clientes ------------------------------------------------------

@app.route('/dashboard/clientes', methods=['GET'])
def gestion_clientes():
    conn = get_db_connection()
    clientes = conn.execute('SELECT * FROM clientes').fetchall()
    conn.close()
    return render_template('gestion_clientes.html', clientes=clientes)

@app.route('/dashboard/clientes/agregar_clientes', methods=['GET', 'POST'])
def agregar_clientes():
    if request.method == 'POST':
        nombre = request.form['nombre']
        email = request.form['email']
        telefono = request.form['telefono']
        direccion = request.form['direccion']

        conn = get_db_connection()
        conn.execute('INSERT INTO clientes (nombre, email, telefono, direccion) VALUES (?, ?, ?, ?)',
                     (nombre, email, telefono, direccion))
        conn.commit()
        conn.close()
        flash('Cliente agregado exitosamente', 'success')
        return redirect(url_for('gestion_clientes'))
    return render_template('clientes_form.html')

@app.route('/dashboard/clientes/editar/<int:id>', methods=['GET', 'POST'])
def editar_cliente(id):
    conn = get_db_connection()
    cliente = conn.execute('SELECT * FROM clientes WHERE id_cliente = ?', (id,)).fetchone()

    if request.method == 'POST':
        nombre = request.form['nombre']
        email = request.form['email']
        telefono = request.form['telefono']
        direccion = request.form['direccion']

        # Usa 'id_cliente' en la consulta UPDATE
        conn.execute('UPDATE clientes SET nombre = ?, email = ?, telefono = ?, direccion = ? WHERE id_cliente = ?',
                     (nombre, email, telefono, direccion, id))
        conn.commit()
        conn.close()
        flash('Cliente actualizado exitosamente', 'success')
        return redirect(url_for('gestion_clientes'))

    conn.close()
    return render_template('clientes_form.html', cliente=cliente)

# La ruta para eliminar cliente
@app.route('/clientes/eliminar/<int:id>', methods=['POST'])
def eliminar_cliente(id):
    conn = get_db_connection()
    # Usa 'id_cliente' en la consulta SQL
    conn.execute("DELETE FROM clientes WHERE id_cliente = ?", (id,))
    conn.commit()
    conn.close()
    flash("Cliente eliminado correctamente", "danger")
    # Redirige a 'gestion_clientes'
    return redirect(url_for('gestion_clientes'))

#---------------------------------------------------------------------------------------------------------------------- 

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