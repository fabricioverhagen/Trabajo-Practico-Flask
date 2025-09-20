from flask import Flask, render_template,request,redirect,url_for,session,flash,jsonify
from datetime import datetime
import sqlite3
import os
from functools import wraps


app = Flask(__name__)
app.secret_key = "admin"

def get_db_connection():
    # Esto busca en la carpeta del proyecto
    db_path = os.path.join(os.path.dirname(__file__), 'basededatosflask.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

#----------------------------------------------------- Funciones dashboard ------------------------------------------------------
def get_dashboard_data():
    """Obtiene datos reales para el dashboard"""
    conn = get_db_connection()
    
    stats = {
        'ventas_hoy': 0,
        'total_dia': 0,
        'productos_stock': 0,
        'stock_bajo': 0,
        'total_clientes': 0
    }
    
    try:
        # Contar clientes totales
        stats['total_clientes'] = conn.execute('SELECT COUNT(*) as count FROM clientes').fetchone()['count']
        
        # Productos con stock
        try:
            stats['productos_stock'] = conn.execute('SELECT COUNT(*) as count FROM productos WHERE stock > 0').fetchone()['count']
            stats['stock_bajo'] = conn.execute('SELECT COUNT(*) as count FROM productos WHERE stock <= 5 AND stock > 0').fetchone()['count']
        except:
            stats['productos_stock'] = 0
            stats['stock_bajo'] = 0
        
        # Ventas del día
        hoy = datetime.now().strftime("%Y-%m-%d")
        stats['ventas_hoy'] = conn.execute('SELECT COUNT(*) as count FROM facturas WHERE DATE(fecha) = ?', (hoy,)).fetchone()['count']
        stats['total_dia'] = conn.execute('SELECT SUM(total) as total FROM facturas WHERE DATE(fecha) = ?', (hoy,)).fetchone()['total']
        if stats['total_dia'] is None:
            stats['total_dia'] = 0
        else:
            stats['total_dia'] = round(stats['total_dia'], 2)
            
    except Exception as e:
        print(f"Error obteniendo estadísticas: {e}")
    finally:
        conn.close()
    
    return stats

def get_productos_stock_bajo():
    """Obtiene productos con stock bajo"""
    conn = get_db_connection()
    productos = []
    
    try:
        query = '''
        SELECT descripcion, stock, 5 as stock_minimo,
               CASE 
                   WHEN stock <= 2 THEN 'Crítico'
                   WHEN stock <= 5 THEN 'Bajo'
                   ELSE 'Normal'
               END as estado
        FROM productos 
        WHERE stock <= 5
        ORDER BY stock ASC
        LIMIT 10
        '''
        productos = conn.execute(query).fetchall()
    except Exception as e:
        print(f"Error obteniendo productos con stock bajo: {e}")
        productos = []
    finally:
        conn.close()
    
    return productos

def get_top_productos():
    """Obtiene los productos más vendidos"""
    conn = get_db_connection()
    productos = []
    
    try:
        query = '''
        SELECT 
            p.descripcion,
            p.precio,
            SUM(d.cantidad) as total_vendido,
            SUM(d.subtotal) as total_ingresos
        FROM detalle_factura d
        JOIN productos p ON d.id_producto = p.id_producto
        JOIN facturas f ON d.id_factura = f.id_factura
        WHERE DATE(f.fecha) >= DATE('now', '-30 days')
        GROUP BY p.id_producto, p.descripcion, p.precio
        ORDER BY total_vendido DESC
        LIMIT 5
        '''
        productos = conn.execute(query).fetchall()
    except Exception as e:
        print(f"Error obteniendo productos más vendidos: {e}")
        productos = []
    finally:
        conn.close()
    
    return productos

def get_ultimas_ventas():
    """Obtiene las últimas ventas registradas"""
    conn = get_db_connection()
    ventas = []
    
    try:
        query = '''
        SELECT 
            f.id_factura,
            f.fecha,
            f.total,
            COALESCE(c.nombre, 'Cliente Anónimo') as cliente_nombre,
            COUNT(d.id_detalle) as cantidad_items
        FROM facturas f
        LEFT JOIN clientes c ON f.id_cliente = c.id_cliente
        LEFT JOIN detalle_factura d ON f.id_factura = d.id_factura
        GROUP BY f.id_factura, f.fecha, f.total, c.nombre
        ORDER BY f.fecha DESC
        LIMIT 5
        '''
        ventas = conn.execute(query).fetchall()
    except Exception as e:
        print(f"Error obteniendo últimas ventas: {e}")
        ventas = []
    finally:
        conn.close()
    
    return ventas


# Decorador para controlar roles
def requires_roles(*roles):
    def decorator(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            if "user" not in session:
                flash("Debes iniciar sesión.", "warning")
                return redirect(url_for("login"))
            role = session.get("role", "")
            if role not in roles:
                flash("No tienes permisos para acceder a esta página.", "danger")
                return redirect(url_for("dashboard"))
            return f(*args, **kwargs)
        return wrapped
    return decorator



#----------------------------------------------------- Autenticacion ------------------------------------------------------

@app.route("/")
def home():
    # Al iniciar la app, enviamos al login por defecto
    return redirect(url_for("login"))

@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        nombre = request.form["nombre"]
        email = request.form["email"]
        password = request.form["password"]
        rol = request.form.get("rol", "usuario")
        if rol not in ("usuario", "admin"):
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
            # Guardar rol si existe en la fila devuelta
            try:
                session["role"] = user["rol"]
            except Exception:
                # En sqlite3.Row, se accede igual que a dict; si falla, dejamos role vacío
                session["role"] = ""
            return redirect(url_for("dashboard"))
        else:
            flash("Email o contraseña incorrectos.", "danger")

    return render_template("login.html")

#----------------------------------------------------------------------------------------------------------------------
#----------------------------------------------------- Dashboard ------------------------------------------------------

@app.route('/dashboard',methods=['GET'])
def dashboard():
    if "user" in session:
        stats = get_dashboard_data()
        productos_stock_bajo = get_productos_stock_bajo()
        top_productos = get_top_productos()
        ultimas_ventas = get_ultimas_ventas()
        
        return render_template("dashboard.html",
                               nombre=session["user"],
                               stats=stats,
                               productos_stock_bajo=productos_stock_bajo,
                               top_productos=top_productos,
                               ultimas_ventas=ultimas_ventas)
    else:
        flash("Debes iniciar sesión para acceder al dashboard.", "warning")
        return redirect(url_for("login"))
#----------------------------------------------------- Clientes ------------------------------------------------------

@app.route('/dashboard/clientes', methods=['GET'])
@requires_roles('admin')
def gestion_clientes():
    conn = get_db_connection()
    clientes = conn.execute('SELECT * FROM clientes').fetchall()
    conn.close()
    return render_template('gestion_clientes.html', clientes=clientes)

@app.route('/dashboard/clientes/agregar_clientes', methods=['GET', 'POST'])
@requires_roles('admin')
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
@requires_roles('admin')
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
@requires_roles('admin')
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
#--------------------------------------------------Ventas--------------------------------------------------------------------

@app.route('/dashboard/ventas', methods=['GET', 'POST'])
@requires_roles('admin', 'usuario')
def ventas():
    if request.method == 'POST':
        id_cliente = request.form.get('id_cliente')  # Puede ser None o vacío
        productos = request.form.getlist('producto[]')
        cantidades = request.form.getlist('cantidad[]')

        conn = get_db_connection()
        cursor = conn.cursor()

        try:
            # Crear factura (si no hay cliente, guardamos NULL)
            fecha = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            if id_cliente == "" or id_cliente is None:
                cursor.execute("INSERT INTO facturas (id_cliente, fecha, total) VALUES (NULL, ?, ?)", (fecha, 0))
            else:
                cursor.execute("INSERT INTO facturas (id_cliente, fecha, total) VALUES (?, ?, ?)", (id_cliente, fecha, 0))
            id_factura = cursor.lastrowid

            total_factura = 0

            # Procesar productos
            for i in range(len(productos)):
                id_producto = int(productos[i])
                cantidad = int(cantidades[i])

                producto = cursor.execute("SELECT precio, stock FROM productos WHERE id_producto = ?", (id_producto,)).fetchone()

                if not producto:
                    conn.rollback()
                    flash("Producto no encontrado.", "danger")
                    return redirect(url_for('ventas'))

                if producto['stock'] < cantidad:
                    conn.rollback()
                    flash(f"Stock insuficiente para el producto ID {id_producto}.", "danger")
                    return redirect(url_for('ventas'))

                precio_unitario = producto['precio']
                subtotal = precio_unitario * cantidad
                total_factura += subtotal

                # Insertar en detalle
                cursor.execute("""INSERT INTO detalle_factura 
                                  (id_factura, id_producto, cantidad, precio_unitario, subtotal)
                                  VALUES (?, ?, ?, ?, ?)""",
                               (id_factura, id_producto, cantidad, precio_unitario, subtotal))

                # Descontar stock
                cursor.execute("UPDATE productos SET stock = stock - ? WHERE id_producto = ?", (cantidad, id_producto))

            # Actualizar total de factura
            cursor.execute("UPDATE facturas SET total = ? WHERE id_factura = ?", (total_factura, id_factura))

            conn.commit()
            flash("Venta registrada correctamente.", "success")
        except Exception as e:
            conn.rollback()
            flash(f"Error al registrar la venta: {e}", "danger")
        finally:
            conn.close()

        return redirect(url_for('listado_facturas'))

    # Si es GET, cargamos clientes y productos para mostrar en el formulario
    conn = get_db_connection()
    clientes = conn.execute("SELECT * FROM clientes").fetchall()
    productos = conn.execute("SELECT * FROM productos WHERE stock > 0").fetchall()
    conn.close()
    return render_template('ventas.html', clientes=clientes, productos=productos)


@app.route('/dashboard/listado_facturas', methods=['GET'])
@requires_roles('admin', 'usuario')
def listado_facturas():
    q = request.args.get('q', '').strip()
    fecha = request.args.get('fecha', '').strip()

    conn = get_db_connection()
    params = []
    where_clauses = []

    if fecha:
        where_clauses.append("DATE(f.fecha) = ?")
        params.append(fecha)

    if q:
        where_clauses.append("c.nombre LIKE ?")
        params.append(f"%{q}%")

    base_query = """
        SELECT f.id_factura, f.fecha, f.total, c.nombre as cliente
        FROM facturas f
        LEFT JOIN clientes c ON f.id_cliente = c.id_cliente
    """

    if where_clauses:
        base_query += " WHERE " + " AND ".join(where_clauses)

    base_query += " ORDER BY f.fecha DESC"

    facturas = conn.execute(base_query, params).fetchall()
    conn.close()
    return render_template('listado_facturas.html', facturas=facturas)


@app.route('/dashboard/factura/<int:id>')
@requires_roles('admin', 'usuario')
def detalle_factura(id):
    conn = get_db_connection()
    factura = conn.execute("""SELECT f.id_factura, f.fecha, f.total, c.nombre
                              FROM facturas f
                              LEFT JOIN clientes c ON f.id_cliente = c.id_cliente
                              WHERE f.id_factura = ?""", (id,)).fetchone()
    detalles = conn.execute("""SELECT d.cantidad, d.precio_unitario, d.subtotal, p.descripcion
                               FROM detalle_factura d
                               JOIN productos p ON d.id_producto = p.id_producto
                               WHERE d.id_factura = ?""", (id,)).fetchall()
    conn.close()
    return render_template('detalle_factura.html', factura=factura, detalles=detalles)


#------------------------------------------Productos---------------------------------------------------------------------------- 


@app.route('/dashboard/gestion_productos', methods=['GET'])
@requires_roles('admin')
def gestion_productos():
    if "user" not in session:
        flash("Debes iniciar sesión para acceder.", "warning")
        return redirect(url_for("login"))
    
    conn = get_db_connection()
    productos = conn.execute('SELECT * FROM productos ORDER BY descripcion').fetchall()
    conn.close()
    return render_template('gestion_productos.html', productos=productos)

@app.route('/productos/agregar', methods=['POST'])
@requires_roles('admin')
def agregar_producto():
    if "user" not in session:
        flash("Debes iniciar sesión para acceder.", "warning")
        return redirect(url_for("login"))
    
    descripcion = request.form['descripcion']
    precio = float(request.form['precio'])
    stock = int(request.form['stock'])

    conn = get_db_connection()
    try:
        conn.execute('INSERT INTO productos (descripcion, precio, stock) VALUES (?, ?, ?)',
                     (descripcion, precio, stock))
        conn.commit()
        flash('Producto agregado exitosamente', 'success')
    except Exception as e:
        flash(f'Error al agregar producto: {str(e)}', 'danger')
    finally:
        conn.close()
    
    return redirect(url_for('gestion_productos'))

@app.route('/productos/editar/<int:id>', methods=['POST'])
@requires_roles('admin')
def editar_producto(id):
    if "user" not in session:
        flash("Debes iniciar sesión para acceder.", "warning")
        return redirect(url_for("login"))
    
    descripcion = request.form['descripcion']
    precio = float(request.form['precio'])
    stock = int(request.form['stock'])

    conn = get_db_connection()
    try:
        conn.execute('UPDATE productos SET descripcion = ?, precio = ?, stock = ? WHERE id_producto = ?',
                     (descripcion, precio, stock, id))
        conn.commit()
        flash('Producto actualizado exitosamente', 'success')
    except Exception as e:
        flash(f'Error al actualizar producto: {str(e)}', 'danger')
    finally:
        conn.close()
    
    return redirect(url_for('gestion_productos'))

@app.route('/productos/eliminar/<int:id>', methods=['POST'])
@requires_roles('admin')
def eliminar_producto(id):
    if "user" not in session:
        flash("Debes iniciar sesión para acceder.", "warning")
        return redirect(url_for("login"))
    
    conn = get_db_connection()
    try:
        conn.execute("DELETE FROM productos WHERE id_producto = ?", (id,))
        conn.commit()
        flash("Producto eliminado correctamente", "success")
    except Exception as e:
        flash(f"Error al eliminar producto: {str(e)}", "danger")
    finally:
        conn.close()
    
    return redirect(url_for('gestion_productos'))

#----------------------------------------------------- Configuracion ------------------------------------------------------
@app.route("/dashboard/configuracion", methods=["GET"])
def ver_configuracion():
    return render_template("configuracion.html")
#---------------------------------------------------------------------------------------------------------------------- 

#----------------------------------------------------- chart ------------------------------------------------------

@app.route('/api/ventas-chart-data')
def ventas_chart_data():
    """API para obtener datos de ventas para el gráfico"""
    if "user" not in session:
        return jsonify({'error': 'No autorizado'}), 401
    
    conn = get_db_connection()
    
    try:
        # Obtener ventas de los últimos 7 días
        query = '''
        SELECT 
            DATE(fecha) as fecha,
            COALESCE(SUM(total), 0) as total_ventas
        FROM facturas 
        WHERE DATE(fecha) >= DATE('now', '-6 days')
        GROUP BY DATE(fecha)
        ORDER BY DATE(fecha)
        '''
        
        ventas = conn.execute(query).fetchall()
        
        # Crear lista de los últimos 7 días
        from datetime import datetime, timedelta
        fechas = []
        total_ventas = []
        
        # Generar los últimos 7 días
        for i in range(6, -1, -1):
            fecha = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
            dia_semana = (datetime.now() - timedelta(days=i)).strftime('%a')
            fechas.append(dia_semana)
            
            # Buscar si hay ventas para esta fecha
            venta_del_dia = next((v for v in ventas if v['fecha'] == fecha), None)
            
            if venta_del_dia:
                total_ventas.append(float(venta_del_dia['total_ventas']))
            else:
                total_ventas.append(0.0)
        
        return jsonify({
            'labels': fechas,
            'data': total_ventas
        })
        
    except Exception as e:
        print(f"Error obteniendo datos de ventas: {e}")
        # Devolver datos vacíos en caso de error
        return jsonify({
            'labels': ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
            'data': [0, 0, 0, 0, 0, 0, 0]
        })
    finally:
        conn.close()

#-----------------------------------------------------------------------------------------------------------





@app.route("/about")
def about():
    return render_template("about.html")



if __name__ == "__main__":
    app.run(debug=True)