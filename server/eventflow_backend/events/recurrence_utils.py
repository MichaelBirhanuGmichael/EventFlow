from datetime import datetime, timedelta
from dateutil.rrule import rrule, rruleset, DAILY, WEEKLY, MONTHLY, YEARLY, MO, TU, WE, TH, FR, SA, SU
from dateutil.relativedelta import relativedelta
from dateutil.parser import parse

WEEKDAY_MAP = {
    'MO': MO,
    'TU': TU,
    'WE': WE,
    'TH': TH,
    'FR': FR,
    'SA': SA,
    'SU': SU,
}

FREQ_MAP = {
    'DAILY': DAILY,
    'WEEKLY': WEEKLY,
    'MONTHLY': MONTHLY,
    'YEARLY': YEARLY,
}

def expand_recurrence(start, end, rule, count=10):
    """
    Expand a recurrence rule into event instances.
    :param start: datetime, start of the first event
    :param end: datetime, end of the first event
    :param rule: dict with keys: frequency, interval, weekdays, relative_day, end_date
    :param count: int, max number of instances to return
    :return: list of (start, end) tuples
    """
    freq = FREQ_MAP.get(rule.get('frequency', 'DAILY'))
    interval = rule.get('interval', 1)
    until = rule.get('end_date')
    if until:
        until = parse(until)
    byweekday = None
    if rule.get('weekdays'):
        byweekday = [WEEKDAY_MAP[wd.strip()] for wd in rule['weekdays'].split(',') if wd.strip() in WEEKDAY_MAP]
    bysetpos = None
    if rule.get('relative_day'):
        # e.g. '2FR' for second Friday, '-1MO' for last Monday
        import re
        m = re.match(r'(-?\d+)([A-Z]{2})', rule['relative_day'])
        if m:
            bysetpos = int(m.group(1))
            byweekday = [WEEKDAY_MAP[m.group(2)]]
    r = rrule(
        freq=freq,
        dtstart=start,
        interval=interval,
        until=until,
        byweekday=byweekday,
        bysetpos=bysetpos,
        count=count
    )
    instances = []
    duration = end - start
    for dt in r:
        instances.append((dt, dt + duration))
    return instances
