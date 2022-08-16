from datetime import datetime

import pytest

from consumer import get_datetime


def test_get_datetime():
    new_date = get_datetime('2020-02-27T13:57:00Z')
    assert type(new_date) is datetime


def test_get_datetime_invalid():
    with pytest.raises(ValueError):
        get_datetime('2020-02-00T13:57:00Z')
