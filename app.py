from flask import Flask, render_template

app = Flask(__name__)


@app.route("/login", methods=["GET", "POST"])
def login():
    return render_template("login.html")

@app.route('/dashboard',methods=['GET'])
def dashboard():
    return render_template('dashboard.html')

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
