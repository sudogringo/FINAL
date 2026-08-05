import sqlite3
from contextlib import contextmanager
from typing import Optional
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

DB_PATH = "/data/golden_harvest.db"

app = FastAPI(title="Golden Harvest API", description="Simulated data layer for n8n workflows")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


@contextmanager
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()


def rows_to_list(rows):
    return [dict(r) for r in rows]


@app.get("/products")
def list_products():
    with get_db() as db:
        return rows_to_list(db.execute("SELECT * FROM products").fetchall())


@app.get("/products/{sku}")
def get_product(sku: str):
    with get_db() as db:
        row = db.execute("SELECT * FROM products WHERE sku = ?", (sku,)).fetchone()
        return dict(row) if row else {}


@app.get("/customers")
def list_customers(tipo: Optional[str] = None):
    with get_db() as db:
        if tipo:
            rows = db.execute("SELECT * FROM customers WHERE tipo = ?", (tipo,)).fetchall()
        else:
            rows = db.execute("SELECT * FROM customers").fetchall()
        return rows_to_list(rows)


@app.get("/customers/{customer_id}")
def get_customer(customer_id: int):
    with get_db() as db:
        row = db.execute("SELECT * FROM customers WHERE id = ?", (customer_id,)).fetchone()
        return dict(row) if row else {}


@app.get("/orders")
def list_orders(month: Optional[str] = Query(None, description="Format: YYYY-MM"), estado: Optional[str] = None):
    with get_db() as db:
        sql = """
            SELECT o.id, o.fecha, o.estado,
                   c.nombre AS customer_nombre, c.email AS customer_email, c.localidad,
                   SUM(oi.cantidad * oi.precio_unitario) AS total
            FROM orders o
            JOIN customers c ON c.id = o.customer_id
            JOIN order_items oi ON oi.order_id = o.id
            WHERE 1=1
        """
        params = []
        if month:
            sql += " AND strftime('%Y-%m', o.fecha) = ?"
            params.append(month)
        if estado:
            sql += " AND o.estado = ?"
            params.append(estado)
        sql += " GROUP BY o.id ORDER BY o.fecha DESC"
        return rows_to_list(db.execute(sql, params).fetchall())


@app.get("/orders/{order_id}/items")
def get_order_items(order_id: int):
    with get_db() as db:
        rows = db.execute("""
            SELECT oi.cantidad, oi.precio_unitario,
                   p.sku, p.nombre, p.categoria
            FROM order_items oi
            JOIN products p ON p.id = oi.product_id
            WHERE oi.order_id = ?
        """, (order_id,)).fetchall()
        return rows_to_list(rows)


@app.get("/interactions")
def list_interactions(customer_id: Optional[int] = None, tipo: Optional[str] = None):
    with get_db() as db:
        sql = """
            SELECT wi.id, wi.fecha, wi.tipo,
                   c.nombre AS customer_nombre, c.email,
                   p.sku, p.nombre AS product_nombre
            FROM web_interactions wi
            JOIN customers c ON c.id = wi.customer_id
            JOIN products p ON p.id = wi.product_id
            WHERE 1=1
        """
        params = []
        if customer_id:
            sql += " AND wi.customer_id = ?"
            params.append(customer_id)
        if tipo:
            sql += " AND wi.tipo = ?"
            params.append(tipo)
        sql += " ORDER BY wi.fecha DESC LIMIT 100"
        return rows_to_list(db.execute(sql, params).fetchall())


@app.get("/stats/monthly")
def monthly_stats(month: Optional[str] = Query(None, description="Format: YYYY-MM")):
    """Summary stats for Monthly Activity Report workflow."""
    with get_db() as db:
        if not month:
            from datetime import datetime
            month = datetime.now().strftime("%Y-%m")

        orders = db.execute("""
            SELECT COUNT(DISTINCT o.id) AS total_orders,
                   SUM(oi.cantidad * oi.precio_unitario) AS revenue,
                   COUNT(DISTINCT o.customer_id) AS unique_customers
            FROM orders o
            JOIN order_items oi ON oi.order_id = o.id
            WHERE strftime('%Y-%m', o.fecha) = ?
        """, (month,)).fetchone()

        top_products = rows_to_list(db.execute("""
            SELECT p.nombre, p.sku, SUM(oi.cantidad) AS units_sold
            FROM order_items oi
            JOIN orders o ON o.id = oi.order_id
            JOIN products p ON p.id = oi.product_id
            WHERE strftime('%Y-%m', o.fecha) = ?
            GROUP BY p.id ORDER BY units_sold DESC LIMIT 3
        """, (month,)).fetchall())

        interactions = db.execute("""
            SELECT tipo, COUNT(*) AS count
            FROM web_interactions
            WHERE strftime('%Y-%m', fecha) = ?
            GROUP BY tipo
        """, (month,)).fetchall()

        return {
            "month": month,
            "orders": dict(orders),
            "top_products": top_products,
            "web_interactions": rows_to_list(interactions),
        }


@app.get("/stats/abandoned-carts")
def abandoned_carts():
    """Customers who added to cart but never purchased — for Lead Nurturing workflow."""
    with get_db() as db:
        rows = db.execute("""
            SELECT DISTINCT c.id, c.nombre, c.email, c.localidad,
                   p.sku, p.nombre AS product_nombre, p.precio_unitario
            FROM web_interactions wi_cart
            JOIN customers c ON c.id = wi_cart.customer_id
            JOIN products p ON p.id = wi_cart.product_id
            WHERE wi_cart.tipo = 'carrito'
              AND NOT EXISTS (
                  SELECT 1 FROM web_interactions wi_buy
                  WHERE wi_buy.customer_id = wi_cart.customer_id
                    AND wi_buy.product_id = wi_cart.product_id
                    AND wi_buy.tipo = 'compra'
              )
            ORDER BY c.nombre
        """).fetchall()
        return rows_to_list(rows)
