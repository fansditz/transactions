from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import sqlite3
from urllib.parse import urlparse
from datetime import datetime


ROOT = Path(__file__).resolve().parent
DB_PATH = ROOT / "transactions_i.db"
HOST = "127.0.0.1"
PORT = 8000


def connect():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def ensure_schema(conn):
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS accounts (
            account_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            balance INTEGER,
            credit_limit INTEGER,
            statement INTEGER,
            payment INTEGER
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS categories (
            category_id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            name TEXT NOT NULL
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS tags (
            tag_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS transactions (
            transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            type TEXT NOT NULL CHECK (type IN ('收入', '支出')),
            category_id TEXT NOT NULL,
            amount INTEGER NOT NULL CHECK (amount > 0),
            account_id TEXT NOT NULL,
            note TEXT,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS transaction_tags (
            transaction_id INTEGER NOT NULL,
            tag_id INTEGER NOT NULL
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS jobs (
            job_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            hourly_wage INTEGER NOT NULL,
            start_day INTEGER NOT NULL,
            end_day INTEGER NOT NULL,
            payday INTEGER NOT NULL
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS salaries (
            salary_id INTEGER PRIMARY KEY AUTOINCREMENT,
            job TEXT NOT NULL,
            start_date TEXT NOT NULL,
            end_date TEXT NOT NULL,
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL,
            break_hours REAL NOT NULL,
            hours REAL NOT NULL,
            note TEXT
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS app_state (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            data TEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    conn.commit()


def normalize_date(value):
    text = str(value or "")
    if len(text) == 4 and text.isdigit():
        return f"{datetime.now().year}-{text[:2]}-{text[2:]}"
    if len(text) == 8 and text.isdigit():
        return f"{text[:4]}-{text[4:6]}-{text[6:]}"
    return text


def denormalize_date(value):
    text = str(value or "")
    if len(text) == 10 and text[4] == "-" and text[7] == "-":
        return text[5:7] + text[8:10]
    return text.replace("-", "")


def normalize_account_type(value):
    if value == "信用卡":
        return "credit"
    if value == "銀行帳戶":
        return "debit"
    return value if value in {"cash", "debit", "credit"} else "cash"


def denormalize_account_type(value):
    if value == "credit":
        return "信用卡"
    if value == "debit":
        return "銀行帳戶"
    return "現金"


def fetch_categories(conn):
    rows = conn.execute("SELECT category_id, type, name FROM categories ORDER BY category_id").fetchall()
    categories = {"收入": ["薪資", "獎金", "彩券", "更新餘額"], "支出": ["飲食", "交通", "購物", "更新餘額"]}
    category_names_by_id = {}

    for row in rows:
        category_names_by_id[str(row["category_id"])] = row["name"]
        bucket = categories.setdefault(row["type"], [])
        if row["name"] not in bucket:
            bucket.append(row["name"])

    return categories, category_names_by_id


def fetch_tags(conn):
    rows = conn.execute("SELECT tag_id, name FROM tags ORDER BY tag_id").fetchall()
    tags = [row["name"] for row in rows] or ["生活", "工作", "家庭", "其他"]
    tags_by_id = {str(row["tag_id"]): row["name"] for row in rows}
    tag_ids_by_transaction = {}

    for row in conn.execute("SELECT transaction_id, tag_id FROM transaction_tags"):
        tag = tags_by_id.get(str(row["tag_id"]))
        if tag:
            tag_ids_by_transaction.setdefault(str(row["transaction_id"]), []).append(tag)

    return tags, tag_ids_by_transaction


def fetch_accounts(conn):
    accounts = []
    for row in conn.execute("SELECT * FROM accounts ORDER BY account_id"):
        account_type = normalize_account_type(row["type"])
        accounts.append(
            {
                "id": str(row["account_id"]),
                "name": row["name"],
                "type": account_type,
                "statementDay": row["statement"] or "",
                "paymentDay": row["payment"] or "",
                "limit": int(row["credit_limit"] or 0),
                "balance": int(row["balance"] or 0),
            }
        )
    return accounts


def state_from_transactions(conn):
    categories, category_names_by_id = fetch_categories(conn)
    tags, tag_ids_by_transaction = fetch_tags(conn)
    accounts = fetch_accounts(conn)

    rows = conn.execute(
        "SELECT transaction_id, date, type, category_id, amount, account_id, note FROM transactions ORDER BY date, transaction_id"
    ).fetchall()
    transactions = []

    for row in rows:
        transaction_id = str(row["transaction_id"])
        category = category_names_by_id.get(str(row["category_id"]), str(row["category_id"]))
        transactions.append(
            {
                "id": transaction_id,
                "date": normalize_date(row["date"]),
                "type": row["type"],
                "category": category,
                "amount": int(row["amount"]),
                "accountId": str(row["account_id"]),
                "tags": tag_ids_by_transaction.get(transaction_id, []),
                "note": row["note"] or "",
            }
        )

    for transaction in transactions:
        bucket = categories.setdefault(transaction["type"], [])
        if transaction["category"] not in bucket:
            bucket.append(transaction["category"])

    salary_jobs = [
        {
            "id": str(row["job_id"]),
            "name": row["name"],
            "rate": int(row["hourly_wage"]),
            "startDay": int(row["start_day"]),
            "endDay": int(row["end_day"]),
            "payDay": int(row["payday"]),
        }
        for row in conn.execute("SELECT * FROM jobs ORDER BY job_id")
    ]
    salary_jobs_by_id = {job["id"]: job for job in salary_jobs}

    salaries = []
    for row in conn.execute("SELECT * FROM salaries ORDER BY salary_id"):
        job_id = str(row["job"])
        job = salary_jobs_by_id.get(job_id)
        hours = float(row["hours"])
        rate = int(job["rate"]) if job else 0
        salaries.append(
            {
                "id": str(row["salary_id"]),
                "jobId": job_id,
                "date": normalize_date(row["start_date"]),
                "startDate": normalize_date(row["start_date"]),
                "endDate": normalize_date(row["end_date"]),
                "start": str(row["start_time"]),
                "end": str(row["end_time"]),
                "breakHours": float(row["break_hours"]),
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


def reset_table(conn, table):
    conn.execute(f"DELETE FROM {table}")


def numeric_id(value):
    text = str(value or "")
    return int(text) if text.isdigit() else None


def load_state():
    with connect() as conn:
        ensure_schema(conn)
        row = conn.execute("SELECT data FROM app_state WHERE id = 1").fetchone()
        if row:
            return json.loads(row["data"])
        state = state_from_transactions(conn)
        save_state(state)
        return state


def save_state(state):
    with connect() as conn:
        ensure_schema(conn)

        for table in (
            "transaction_tags",
            "transactions",
            "categories",
            "tags",
            "accounts",
            "salaries",
            "jobs",
        ):
            reset_table(conn, table)

        saved_state = {
            **state,
            "transactions": [dict(transaction) for transaction in state.get("transactions", [])],
            "accounts": [dict(account) for account in state.get("accounts", [])],
            "salaries": [dict(salary) for salary in state.get("salaries", [])],
            "salaryJobs": [dict(job) for job in state.get("salaryJobs", [])],
        }

        category_ids = {}
        for flow_type, names in (saved_state.get("categories") or {}).items():
            for name in names:
                if not name:
                    continue
                conn.execute("INSERT OR IGNORE INTO categories (type, name) VALUES (?, ?)", (flow_type, name))
                row = conn.execute(
                    "SELECT category_id FROM categories WHERE type = ? AND name = ?",
                    (flow_type, name),
                ).fetchone()
                if row:
                    category_ids[(flow_type, name)] = str(row["category_id"])

        tag_ids = {}
        for tag in saved_state.get("tags", []):
            if not tag:
                continue
            conn.execute("INSERT OR IGNORE INTO tags (name) VALUES (?)", (tag,))
            row = conn.execute("SELECT tag_id FROM tags WHERE name = ?", (tag,)).fetchone()
            if row:
                tag_ids[tag] = int(row["tag_id"])

        account_id_map = {}
        for account in saved_state.get("accounts", []):
            original_id = str(account.get("id") or "")
            account_id = numeric_id(account.get("id"))
            values = (
                account.get("name") or "未命名帳戶",
                denormalize_account_type(account.get("type")),
                int(account.get("balance") or 0),
                int(account.get("limit") or 0) or None,
                int(account.get("statementDay") or 0) or None,
                int(account.get("paymentDay") or 0) or None,
            )
            if account_id:
                conn.execute(
                    """
                    INSERT INTO accounts (account_id, name, type, balance, credit_limit, statement, payment)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                    (account_id, *values),
                )
                saved_account_id = account_id
            else:
                conn.execute(
                    """
                    INSERT INTO accounts (name, type, balance, credit_limit, statement, payment)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    values,
                )
                saved_account_id = int(conn.execute("SELECT last_insert_rowid()").fetchone()[0])

            account["id"] = str(saved_account_id)
            if original_id:
                account_id_map[original_id] = str(saved_account_id)

        job_id_map = {}
        for job in saved_state.get("salaryJobs", []):
            original_id = str(job.get("id") or "")
            job_id = numeric_id(job.get("id"))
            values = (
                job.get("name") or "未命名工作",
                int(job.get("rate") or 0),
                int(job.get("startDay") or 1),
                int(job.get("endDay") or 1),
                int(job.get("payDay") or 1),
            )
            if job_id:
                conn.execute(
                    """
                    INSERT INTO jobs (job_id, name, hourly_wage, start_day, end_day, payday)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (job_id, *values),
                )
                saved_job_id = job_id
            else:
                conn.execute(
                    """
                    INSERT INTO jobs (name, hourly_wage, start_day, end_day, payday)
                    VALUES (?, ?, ?, ?, ?)
                    """,
                    values,
                )
                saved_job_id = int(conn.execute("SELECT last_insert_rowid()").fetchone()[0])

            job["id"] = str(saved_job_id)
            if original_id:
                job_id_map[original_id] = str(saved_job_id)

        salary_id_map = {}
        for salary in saved_state.get("salaries", []):
            original_id = str(salary.get("id") or "")
            salary_id = numeric_id(salary.get("id"))
            saved_job_id = job_id_map.get(str(salary.get("jobId")), str(salary.get("jobId") or ""))
            values = (
                saved_job_id,
                denormalize_date(salary.get("startDate") or salary.get("date")),
                denormalize_date(salary.get("endDate") or salary.get("date")),
                str(salary.get("start") or "").replace(":", ""),
                str(salary.get("end") or "").replace(":", ""),
                float(salary.get("breakHours") or 0),
                float(salary.get("hours") or 0),
                salary.get("note") or "",
            )
            if salary_id:
                conn.execute(
                    """
                    INSERT INTO salaries (salary_id, job, start_date, end_date, start_time, end_time, break_hours, hours, note)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (salary_id, *values),
                )
                saved_salary_id = salary_id
            else:
                conn.execute(
                    """
                    INSERT INTO salaries (job, start_date, end_date, start_time, end_time, break_hours, hours, note)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    values,
                )
                saved_salary_id = int(conn.execute("SELECT last_insert_rowid()").fetchone()[0])

            salary["id"] = str(saved_salary_id)
            salary["jobId"] = saved_job_id
            if original_id:
                salary_id_map[original_id] = str(saved_salary_id)

        for transaction in saved_state.get("transactions", []):
            amount = int(transaction.get("amount") or 0)
            if amount <= 0:
                continue

            category_key = (transaction.get("type"), transaction.get("category"))
            category_id = category_ids.get(category_key, transaction.get("category") or "")
            values = (
                denormalize_date(transaction.get("date")),
                transaction.get("type"),
                category_id,
                amount,
                account_id_map.get(str(transaction.get("accountId")), str(transaction.get("accountId") or "")),
                transaction.get("note") or "",
            )
            transaction_id = str(transaction.get("id") or "")
            if transaction_id.isdigit():
                conn.execute(
                    """
                    INSERT INTO transactions (transaction_id, date, type, category_id, amount, account_id, note, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                    """,
                    (int(transaction_id), *values),
                )
                saved_transaction_id = int(transaction_id)
            else:
                conn.execute(
                    """
                    INSERT INTO transactions (date, type, category_id, amount, account_id, note, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                    """,
                    values,
                )
                saved_transaction_id = int(conn.execute("SELECT last_insert_rowid()").fetchone()[0])

            transaction["id"] = str(saved_transaction_id)
            transaction["accountId"] = values[4]
            if transaction.get("salaryId"):
                transaction["salaryId"] = salary_id_map.get(str(transaction.get("salaryId")), str(transaction.get("salaryId")))

            for tag in transaction.get("tags", []):
                tag_id = tag_ids.get(tag)
                if tag_id:
                    conn.execute(
                        "INSERT INTO transaction_tags (transaction_id, tag_id) VALUES (?, ?)",
                        (saved_transaction_id, tag_id),
                    )

        conn.execute(
            """
            INSERT INTO app_state (id, data, updated_at)
            VALUES (1, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP
            """,
            (json.dumps(saved_state, ensure_ascii=False),),
        )
        conn.commit()
        return saved_state


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
        path = urlparse(self.path).path
        if path == "/api/state":
            self.send_json(load_state())
            return
        super().do_GET()

    def do_POST(self):
        path = urlparse(self.path).path
        if path != "/api/state":
            self.send_error(404)
            return

        try:
            length = int(self.headers.get("Content-Length", "0"))
            payload = self.rfile.read(length)
            state = json.loads(payload.decode("utf-8"))
            saved_state = save_state(state)
        except (ValueError, json.JSONDecodeError, sqlite3.Error) as error:
            self.send_json({"ok": False, "error": str(error)}, status=400)
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
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"錢途無量資料服務已啟動：http://{HOST}:{PORT}")
    server.serve_forever()
