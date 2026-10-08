import sqlite3
import random
from datetime import datetime, timedelta

DB_PATH = "/data/golden_harvest.db"

PRODUCTS = [
    ("ACE-001", "Aceitunas Negras en Conserva 380g", "aceitunas", 850.00, 240),
    ("ACE-002", "Aceitunas Verdes Rellenas con Morrón 370g", "aceitunas", 920.00, 180),
    ("CHI-001", "Chutney de Tomate y Albahaca 250g", "salsas", 640.00, 150),
    ("CHI-002", "Chutney de Ciruela y Jengibre 250g", "salsas", 680.00, 120),
    ("PES-001", "Pesto Casero en Aceite de Oliva 190g", "salsas", 1100.00, 90),
    ("MER-001", "Mermelada Artesanal de Higo 300g", "dulces", 750.00, 200),
]

CUSTOMERS = [
    ("Supermercados Norte S.A.", "logistica@norte.com.ar", "CABA", "supermercado"),
    ("Bodega Los Álamos", "compras@losalamos.com.ar", "Mendoza", "distribuidor"),
    ("Distribuidora Del Sur", "pedidos@delsur.com.ar", "San Rafael", "distribuidor"),
    ("Gourmet Shop Buenos Aires", "stock@gourmetshop.com.ar", "CABA", "minorista"),
    ("El Almacén de Campo", "almacen@elcampo.com.ar", "Córdoba", "minorista"),
    ("Restaurante La Cosecha", "compras@lacosecha.com.ar", "Rosario", "gastronomia"),
    ("Hotel Terrazas del Valle", "provision@terrazas.com.ar", "Mendoza", "gastronomia"),
    ("Delicatessen Palermo", "info@delicatessen.com.ar", "CABA", "minorista"),
]

INTERACTION_TYPES = ["vista", "carrito", "compra"]

ORDER_STATES = ["confirmado", "enviado", "pendiente"]


def random_date(start_days_ago=180, end_days_ago=0):
    days = random.randint(end_days_ago, start_days_ago)
    return (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d %H:%M:%S")


def seed():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.executescript("""
        DROP TABLE IF EXISTS order_items;
        DROP TABLE IF EXISTS web_interactions;
        DROP TABLE IF EXISTS orders;
        DROP TABLE IF EXISTS customers;
        DROP TABLE IF EXISTS products;

        CREATE TABLE products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sku TEXT UNIQUE NOT NULL,
            nombre TEXT NOT NULL,
            categoria TEXT NOT NULL,
            precio_unitario REAL NOT NULL,
            stock INTEGER NOT NULL
        );

        CREATE TABLE customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            localidad TEXT NOT NULL,
            tipo TEXT NOT NULL
        );

        CREATE TABLE orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id INTEGER NOT NULL REFERENCES customers(id),
            fecha TEXT NOT NULL,
            estado TEXT NOT NULL
        );

        CREATE TABLE order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL REFERENCES orders(id),
            product_id INTEGER NOT NULL REFERENCES products(id),
            cantidad INTEGER NOT NULL,
            precio_unitario REAL NOT NULL
        );

        CREATE TABLE web_interactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id INTEGER NOT NULL REFERENCES customers(id),
            product_id INTEGER NOT NULL REFERENCES products(id),
            fecha TEXT NOT NULL,
            tipo TEXT NOT NULL
        );
    """)

    cur.executemany(
        "INSERT INTO products (sku, nombre, categoria, precio_unitario, stock) VALUES (?,?,?,?,?)",
        PRODUCTS,
    )

    cur.executemany(
        "INSERT INTO customers (nombre, email, localidad, tipo) VALUES (?,?,?,?)",
        CUSTOMERS,
    )

    product_ids = [r[0] for r in cur.execute("SELECT id FROM products").fetchall()]
    customer_ids = [r[0] for r in cur.execute("SELECT id FROM customers").fetchall()]

    # ~60 orders across 6 months
    for _ in range(60):
        cid = random.choice(customer_ids)
        fecha = random_date(180, 1)
        estado = random.choices(ORDER_STATES, weights=[0.6, 0.3, 0.1])[0]
        cur.execute("INSERT INTO orders (customer_id, fecha, estado) VALUES (?,?,?)", (cid, fecha, estado))
        oid = cur.lastrowid
        for pid in random.sample(product_ids, k=random.randint(1, 3)):
            qty = random.choice([12, 24, 48, 96, 120])
            price = cur.execute("SELECT precio_unitario FROM products WHERE id=?", (pid,)).fetchone()[0]
            cur.execute(
                "INSERT INTO order_items (order_id, product_id, cantidad, precio_unitario) VALUES (?,?,?,?)",
                (oid, pid, qty, price),
            )

    # ~200 web interactions
    for _ in range(200):
        cid = random.choice(customer_ids)
        pid = random.choice(product_ids)
        fecha = random_date(90, 0)
        tipo = random.choices(INTERACTION_TYPES, weights=[0.6, 0.25, 0.15])[0]
        cur.execute(
            "INSERT INTO web_interactions (customer_id, product_id, fecha, tipo) VALUES (?,?,?,?)",
            (cid, pid, fecha, tipo),
        )

    conn.commit()
    conn.close()
    print("DB seeded successfully at", DB_PATH)


if __name__ == "__main__":
    seed()
