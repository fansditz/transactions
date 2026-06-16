from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from datetime import datetime
import json
from pathlib import Path
import sqlite3
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parent
DB_PATH = ROOT / "transactions_i.db"
HOST = "127.0.0.1"
PORT = 8000

INCOME = "收入"
EXPENSE = "支出"

DEFAULT_CATEGORIES = {
    INCOME: ["薪資", "獎金", "彩券", "更新餘額"],
    EXPENSE: ["飲食", "交通", "購物", "更新餘額"],
}
DEFAULT_TAGS = ["生活", "工作", "家庭", "其他"]

ACCOUNT_TYPE_TO_DB = {
    "cash": "現金",
    "debit": "銀行帳戶",
    "credit": "信用卡",
}
ACCOUNT_TYPE_FROM_DB = {value: key for key, value in ACCOUNT_TYPE_TO_DB.items()}


def connect():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def ensure_schema(conn):
    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS accounts (
            account_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            type TEXT NOT NULL CHECK (type IN ('現金', '銀行帳戶', '信用卡')),
            balance INTEGER,
            credit_limit INTEGER CHECK (credit_limit > 0),
            statement INTEGER CHECK (statement BETWEEN 1 AND 31),
            payment INTEGER CHECK (payment BETWEEN 1 AND 31),
            CHECK (
                (type IN ('現金', '銀行帳戶') AND balance IS NOT NULL AND credit_limit IS NULL AND statement IS NULL AND payment IS NULL)
                OR
                (type = '信用卡' AND balance IS NULL AND credit_limit IS NOT NULL AND statement IS NOT NULL AND payment IS NOT NULL)
            )
        );

        CREATE TABLE IF NOT EXISTS categories (
            category_id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL CHECK (type IN ('收入', '支出')),
            name TEXT NOT NULL,
            UNIQUE (type, name)
        );

        CREATE TABLE IF NOT EXISTS jobs (
            job_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            hourly_wage INTEGER NOT NULL CHECK (hourly_wage > 0),
            start_day INTEGER NOT NULL CHECK (start_day BETWEEN 1 AND 31),
            end_day INTEGER NOT NULL CHECK (end_day BETWEEN 1 AND 31),
            payday INTEGER NOT NULL CHECK (payday BETWEEN 1 AND 31)
        );

        CREATE TABLE IF NOT EXISTS salaries (
            salary_id INTEGER PRIMARY KEY AUTOINCREMENT,
            job_id INTEGER NOT NULL REFERENCES jobs (job_id),
            start_date TEXT NOT NULL,
            end_date TEXT NOT NULL,
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL,
            break_hours REAL NOT NULL CHECK (break_hours >= 0),
            hours REAL NOT NULL CHECK (hours > 0),
            note TEXT
        );

        CREATE TABLE IF NOT EXISTS tags (
            tag_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL
        );

        CREATE TABLE IF NOT EXISTS transactions (
            transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            type TEXT NOT NULL,
            category_id INTEGER NOT NULL REFERENCES categories (category_id),
            amount INTEGER NOT NULL CHECK (amount > 0),
            account_id INTEGER NOT NULL REFERENCES accounts (account_id),
            note TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
        );

        CREATE TABLE IF NOT EXISTS transaction_tags (
            transaction_id INTEGER NOT NULL REFERENCES transactions (transaction_id),
            tag_id INTEGER NOT NULL REFERENCES tags (tag_id),
            PRIMARY KEY (transaction_id, tag_id)
        );
        """
    )
    conn.commit()


def normalize_date(value):
    text = str(value or "").strip()
    if len(text) == 4 and text.isdigit():
        return f"{datetime.now().year}-{text[:2]}-{text[2:]}"
    if len(text) == 8 and text.isdigit():
        return f"{text[:4]}-{text[4:6]}-{text[6:]}"
    return text


def normalize_time(value):
    text = str(value or "").strip()
    if len(text) == 4 and text.isdigit():
        return f"{text[:2]}:{text[2:]}"
    return text


def numeric_id(value):
    text = str(value or "").strip()
    return int(text) if text.isdigit() else None


def as_int(value, default=0):
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def as_float(value, default=0.0):
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def table_columns(conn, table):
    return {row["name"] for row in conn.execute(f"PRAGMA table_info({table})")}


def fetch_categories(conn):
    categories = {key: list(value) for key, value in DEFAULT_CATEGORIES.items()}
    category_names_by_id = {}

    rows = conn.execute("SELECT category_id, type, name FROM categories ORDER BY category_id").fetchall()
    for row in rows:
        flow_type = row["type"]
        name = row["name"]
        category_names_by_id[str(row["category_id"])] = name
        bucket = categories.setdefault(flow_type, [])
        if name not in bucket:
            bucket.append(name)

    return categories, category_names_by_id


def fetch_tags(conn):
    rows = conn.execute("SELECT tag_id, name FROM tags ORDER BY tag_id").fetchall()
    tags = [row["name"] for row in rows] or list(DEFAULT_TAGS)
    tags_by_id = {str(row["tag_id"]): row["name"] for row in rows}
    tags_by_transaction = {}

    for row in conn.execute("SELECT transaction_id, tag_id FROM transaction_tags"):
        tag = tags_by_id.get(str(row["tag_id"]))
        if tag:
            tags_by_transaction.setdefault(str(row["transaction_id"]), []).append(tag)

    return tags, tags_by_transaction


def fetch_accounts(conn):
    accounts = []
    for row in conn.execute("SELECT * FROM accounts ORDER BY account_id"):
        account_type = ACCOUNT_TYPE_FROM_DB.get(row["type"], "cash")
        accounts.append(
            {
                "id": str(row["account_id"]),
                "name": row["name"],
                "type": account_type,
                "statementDay": row["statement"] or "",
                "paymentDay": row["payment"] or "",
                "limit": as_int(row["credit_limit"]),
                "balance": 0 if account_type == "credit" else as_int(row["balance"]),
            }
        )
    return accounts


def load_state():
    with connect() as conn:
        ensure_schema(conn)
        categories, category_names_by_id = fetch_categories(conn)
        tags, tags_by_transaction = fetch_tags(conn)
        accounts = fetch_accounts(conn)

        transactions = []
        rows = conn.execute(
            """
            SELECT transaction_id, date, type, category_id, amount, account_id, note
            FROM transactions
            ORDER BY date, transaction_id
            """
        ).fetchall()
        for row in rows:
            transaction_id = str(row["transaction_id"])
            category = category_names_by_id.get(str(row["category_id"]), str(row["category_id"]))
            transactions.append(
                {
                    "id": transaction_id,
                    "date": normalize_date(row["date"]),
                    "type": row["type"],
                    "category": category,
                    "amount": as_int(row["amount"]),
                    "accountId": str(row["account_id"]),
                    "tags": tags_by_transaction.get(transaction_id, []),
                    "note": row["note"] or "",
                }
            )
            bucket = categories.setdefault(row["type"], [])
            if category not in bucket:
                bucket.append(category)

        salary_jobs = [
            {
                "id": str(row["job_id"]),
                "name": row["name"],
                "rate": as_int(row["hourly_wage"]),
                "startDay": as_int(row["start_day"], 1),
                "endDay": as_int(row["end_day"], 1),
                "payDay": as_int(row["payday"], 1),
            }
            for row in conn.execute("SELECT * FROM jobs ORDER BY job_id")
        ]
        salary_jobs_by_id = {job["id"]: job for job in salary_jobs}

        salaries = []
        salary_job_column = "job_id" if "job_id" in table_columns(conn, "salaries") else "job"
        for row in conn.execute("SELECT * FROM salaries ORDER BY salary_id"):
            job_id = str(row[salary_job_column])
            job = salary_jobs_by_id.get(job_id)
            hours = as_float(row["hours"])
            rate = as_int(job["rate"]) if job else 0
            start_date = normalize_date(row["start_date"])
            end_date = normalize_date(row["end_date"])
            salaries.append(
                {
                    "id": str(row["salary_id"]),
                    "jobId": job_id,
                    "date": start_date,
                    "startDate": start_date,
                    "endDate": end_date,
                    "start": normalize_time(row["start_time"]),
                    "end": normalize_time(row["end_time"]),
                    "breakHours": as_float(row["break_hours"]),
                    "hours": hours,
                    "rate": rate,
                    "amount": round(hours * rate),
                    "note": row["note"] or "",
                }
            )

        return {
            "transactions": transactions,
            "categories": categories,
            "accounts": accounts,
            "tags": tags,
            "salaries": salaries,
            "salaryJobs": salary_jobs,
        }


def reset_tables(conn):
    for table in ("transaction_tags", "transactions", "salaries", "categories", "tags", "accounts", "jobs"):
        conn.execute(f"DELETE FROM {table}")


def insert_category(conn, flow_type, name):
    conn.execute("INSERT OR IGNORE INTO categories (type, name) VALUES (?, ?)", (flow_type, name))
    row = conn.execute(
        "SELECT category_id FROM categories WHERE type = ? AND name = ?",
        (flow_type, name),
    ).fetchone()
    return str(row["category_id"]) if row else None


def save_state(state):
    with connect() as conn:
        ensure_schema(conn)
        reset_tables(conn)

        saved_state = {
            **(state or {}),
            "transactions": [dict(item) for item in (state or {}).get("transactions", [])],
            "accounts": [dict(item) for item in (state or {}).get("accounts", [])],
            "salaries": [dict(item) for item in (state or {}).get("salaries", [])],
            "salaryJobs": [dict(item) for item in (state or {}).get("salaryJobs", [])],
        }

        category_ids = {}
        incoming_categories = saved_state.get("categories") or {}
        for flow_type, names in incoming_categories.items():
            if flow_type not in (INCOME, EXPENSE):
                continue
            for name in names or []:
                name = str(name or "").strip()
                if name:
                    category_ids[(flow_type, name)] = insert_category(conn, flow_type, name)

        tag_ids = {}
        for tag in saved_state.get("tags") or []:
            tag = str(tag or "").strip()
            if not tag:
                continue
            conn.execute("INSERT OR IGNORE INTO tags (name) VALUES (?)", (tag,))
            row = conn.execute("SELECT tag_id FROM tags WHERE name = ?", (tag,)).fetchone()
            if row:
                tag_ids[tag] = int(row["tag_id"])

        account_id_map = {}
        for account in saved_state.get("accounts") or []:
            original_id = str(account.get("id") or "")
            requested_id = numeric_id(original_id)
            account_type = account.get("type") if account.get("type") in ACCOUNT_TYPE_TO_DB else "cash"
            db_type = ACCOUNT_TYPE_TO_DB[account_type]
            name = str(account.get("name") or "未命名帳戶").strip() or "未命名帳戶"

            if account_type == "credit":
                values = (
                    name,
                    db_type,
                    None,
                    max(1, as_int(account.get("limit"), 1)),
                    min(31, max(1, as_int(account.get("statementDay"), 1))),
                    min(31, max(1, as_int(account.get("paymentDay"), 1))),
                )
            else:
                values = (
                    name,
                    db_type,
                    as_int(account.get("balance")),
                    None,
                    None,
                    None,
                )

            if requested_id:
                conn.execute(
                    """
                    INSERT INTO accounts (account_id, name, type, balance, credit_limit, statement, payment)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                    (requested_id, *values),
                )
                saved_id = requested_id
            else:
                conn.execute(
                    """
                    INSERT INTO accounts (name, type, balance, credit_limit, statement, payment)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    values,
                )
                saved_id = int(conn.execute("SELECT last_insert_rowid()").fetchone()[0])

            account["id"] = str(saved_id)
            if original_id:
                account_id_map[original_id] = str(saved_id)

        job_id_map = {}
        for job in saved_state.get("salaryJobs") or []:
            original_id = str(job.get("id") or "")
            requested_id = numeric_id(original_id)
            values = (
                str(job.get("name") or "未命名工作").strip() or "未命名工作",
                max(1, as_int(job.get("rate"), 1)),
                min(31, max(1, as_int(job.get("startDay"), 1))),
                min(31, max(1, as_int(job.get("endDay"), 1))),
                min(31, max(1, as_int(job.get("payDay"), 1))),
            )

            if requested_id:
                conn.execute(
                    """
                    INSERT INTO jobs (job_id, name, hourly_wage, start_day, end_day, payday)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (requested_id, *values),
                )
                saved_id = requested_id
            else:
                conn.execute(
                    """
                    INSERT INTO jobs (name, hourly_wage, start_day, end_day, payday)
                    VALUES (?, ?, ?, ?, ?)
                    """,
                    values,
                )
                saved_id = int(conn.execute("SELECT last_insert_rowid()").fetchone()[0])

            job["id"] = str(saved_id)
            if original_id:
                job_id_map[original_id] = str(saved_id)

        salary_id_map = {}
        salary_job_column = "job_id" if "job_id" in table_columns(conn, "salaries") else "job"
        for salary in saved_state.get("salaries") or []:
            original_id = str(salary.get("id") or "")
            requested_id = numeric_id(original_id)
            saved_job_id = job_id_map.get(str(salary.get("jobId")), str(salary.get("jobId") or ""))
            if not numeric_id(saved_job_id):
                continue

            values = (
                int(saved_job_id),
                str(salary.get("startDate") or salary.get("date") or ""),
                str(salary.get("endDate") or salary.get("date") or ""),
                str(salary.get("start") or ""),
                str(salary.get("end") or ""),
                max(0.0, as_float(salary.get("breakHours"))),
                max(0.01, as_float(salary.get("hours"), 0.01)),
                salary.get("note") or "",
            )

            if requested_id:
                conn.execute(
                    f"""
                    INSERT INTO salaries (salary_id, {salary_job_column}, start_date, end_date, start_time, end_time, break_hours, hours, note)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (requested_id, *values),
                )
                saved_id = requested_id
            else:
                conn.execute(
                    f"""
                    INSERT INTO salaries ({salary_job_column}, start_date, end_date, start_time, end_time, break_hours, hours, note)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    values,
                )
                saved_id = int(conn.execute("SELECT last_insert_rowid()").fetchone()[0])

            salary["id"] = str(saved_id)
            salary["jobId"] = str(saved_job_id)
            if original_id:
                salary_id_map[original_id] = str(saved_id)

        for transaction in saved_state.get("transactions") or []:
            amount = as_int(transaction.get("amount"))
            flow_type = transaction.get("type")
            account_id = account_id_map.get(str(transaction.get("accountId")), str(transaction.get("accountId") or ""))
            if amount <= 0 or flow_type not in (INCOME, EXPENSE) or not numeric_id(account_id):
                continue

            category_name = str(transaction.get("category") or "").strip() or "未分類"
            category_id = category_ids.get((flow_type, category_name))
            if not category_id:
                category_id = insert_category(conn, flow_type, category_name)
                category_ids[(flow_type, category_name)] = category_id

            values = (
                str(transaction.get("date") or ""),
                flow_type,
                int(category_id),
                amount,
                int(account_id),
                transaction.get("note") or "",
            )
            requested_id = numeric_id(transaction.get("id"))
            if requested_id:
                conn.execute(
                    """
                    INSERT INTO transactions (transaction_id, date, type, category_id, amount, account_id, note)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                    (requested_id, *values),
                )
                saved_id = requested_id
            else:
                conn.execute(
                    """
                    INSERT INTO transactions (date, type, category_id, amount, account_id, note)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    values,
                )
                saved_id = int(conn.execute("SELECT last_insert_rowid()").fetchone()[0])

            transaction["id"] = str(saved_id)
            transaction["accountId"] = str(account_id)
            if transaction.get("salaryId"):
                transaction["salaryId"] = salary_id_map.get(str(transaction.get("salaryId")), str(transaction.get("salaryId")))

            for tag in transaction.get("tags") or []:
                tag_id = tag_ids.get(tag)
                if tag_id:
                    conn.execute(
                        "INSERT OR IGNORE INTO transaction_tags (transaction_id, tag_id) VALUES (?, ?)",
                        (saved_id, tag_id),
                    )

        conn.commit()
        return load_state()


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_GET(self):
        if urlparse(self.path).path == "/api/state":
            self.send_json(load_state())
            return
        super().do_GET()

    def do_POST(self):
        if urlparse(self.path).path != "/api/state":
            self.send_error(404)
            return

        try:
            length = int(self.headers.get("Content-Length", "0"))
            payload = self.rfile.read(length)
            state = json.loads(payload.decode("utf-8"))
            saved_state = save_state(state)
        except Exception as error:
            print("POST /api/state error:", repr(error))
            self.send_json({"ok": False, "error": str(error)}, status=500)
            return

        self.send_json({"ok": True, "state": saved_state})

    def send_json(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


if __name__ == "__main__":
    print(f"Server running at http://{HOST}:{PORT}")
    ThreadingHTTPServer((HOST, PORT), Handler).serve_forever()
