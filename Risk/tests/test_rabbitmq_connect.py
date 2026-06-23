import asyncio

from aio_pika.connection import Connection, make_url

from shared.messaging.rabbitmq_connect import _mark_connection_closed, close_connection


def test_mark_connection_closed_prevents_del_cleanup():
    connection = Connection(make_url("amqp://guest:guest@127.0.0.1/"))
    assert not connection.is_closed

    _mark_connection_closed(connection)

    assert connection.is_closed
    assert connection.close_called


def test_close_connection_marks_never_connected_as_closed():
    connection = Connection(make_url("amqp://guest:guest@127.0.0.1/"))

    asyncio.run(close_connection(connection))

    assert connection.is_closed
    assert connection.close_called
