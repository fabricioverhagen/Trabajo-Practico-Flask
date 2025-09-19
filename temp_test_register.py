from app import app, get_db_connection

with app.test_client() as c:
    resp = c.post('/register', data={'nombre':'Test Admin 3','email':'testadmin3@example.com','password':'pass','rol':'admin'}, follow_redirects=False)
    print('POST /register status', resp.status_code)
    conn = get_db_connection()
    row = conn.execute('SELECT nombre, email, rol FROM usuarios WHERE email = ?', ('testadmin3@example.com',)).fetchone()
    conn.close()
    print('DB row:', dict(row) if row else None)
