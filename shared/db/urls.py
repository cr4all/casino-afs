from urllib.parse import quote_plus


def build_postgres_sqlalchemy_url(
    *,
    user: str,
    password: str,
    host: str,
    port: int = 5432,
    database: str,
) -> str:
    return (
        f"postgresql+psycopg2://{quote_plus(user)}:{quote_plus(password)}"
        f"@{host}:{port}/{quote_plus(database)}"
    )


def build_redis_url(
    *,
    host: str,
    port: int = 6379,
    password: str = "",
    db: int = 0,
) -> str:
    if password:
        return f"redis://:{quote_plus(password)}@{host}:{port}/{db}"
    return f"redis://{host}:{port}/{db}"


def build_amqp_url(
    *,
    user: str,
    password: str,
    host: str,
    port: int = 5672,
    vhost: str = "/",
) -> str:
    vhost_path = quote_plus(vhost) if vhost and vhost != "/" else ""
    suffix = f"/{vhost_path}" if vhost_path else "/"
    return f"amqp://{quote_plus(user)}:{quote_plus(password)}@{host}:{port}{suffix}"
