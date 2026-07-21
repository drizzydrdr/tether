import { useMemo, useState } from 'react';
import { getEntries, deleteEntry } from '../lib/storage';
import { defaultStorylines } from '../data/storylines';
import { needs as needDefs, triggerContexts } from '../data/needs';
import { precedingStates } from '../data/precedingState';
import { urgeLevels } from '../data/urge';
import { durations } from '../data/duration';
import './History.css';

function labelFor(list, id) {
  return list.find((x) => x.id === id)?.label || id;
}

function tally(entries, key) {
  const counts = {};
  entries.forEach((e) => {
    if (!e[key]) return;
    counts[e[key]] = (counts[e[key]] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

function dayKey(iso) {
  return new Date(iso).toISOString().slice(0, 10);
}

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
function weekdayOf(iso) {
  return WEEKDAY_NAMES[new Date(iso).getDay()];
}

const DAY_PARTS = ['Morning', 'Afternoon', 'Evening', 'Night'];
function dayPartOf(iso) {
  const h = new Date(iso).getHours();
  if (h >= 5 && h < 12) return 'Morning';
  if (h >= 12 && h < 17) return 'Afternoon';
  if (h >= 17 && h < 22) return 'Evening';
  return 'Night';
}

const TOOL_LABELS = { breathing: 'Breathing', action: 'Micro-action', wonder: 'Wonder prompt' };
const URGE_SCORE = { mild: 1, strong: 2, overwhelming: 3 };

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Rolling 7-day windows rather than calendar weeks, so the comparison is
// meaningful no matter what day you happen to check.
function windowStats(entries, minutesById) {
  const count = entries.length;

  const withUrge = entries.filter((e) => e.urge);
  const avgUrge = withUrge.length
    ? withUrge.reduce((s, e) => s + (URGE_SCORE[e.urge] || 0), 0) / withUrge.length
    : null;

  const withDuration = entries.filter((e) => e.duration);
  const avgMinutes = withDuration.length
    ? withDuration.reduce((s, e) => s + (minutesById[e.duration] || 0), 0) / withDuration.length
    : null;

  const withOutcome = entries.filter((e) => e.ladderChoice && e.ladderChoice !== 'log' && e.outcome);
  const successPct = withOutcome.length
    ? Math.round((withOutcome.filter((e) => e.outcome === 'worked').length / withOutcome.length) * 100)
    : null;

  return { count, avgUrge, avgMinutes, successPct };
}

function buildWeeks(entries, weeksBack = 10) {
  const days = {};
  entries.forEach((e) => {
    if (e.state !== 'reality' && e.state !== 'fantasy') return;
    const key = dayKey(e.timestamp);
    if (!days[key]) days[key] = { reality: 0, fantasy: 0 };
    days[key][e.state] += 1;
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - (weeksBack * 7 - 1));
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const weeks = [];
  const cursor = new Date(startDate);
  while (cursor <= today) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      const key = cursor.toISOString().slice(0, 10);
      const data = days[key];
      const total = data ? data.reality + data.fantasy : 0;
      const ratio = total ? data.reality / total : null;
      week.push({ key, total, ratio, isFuture: cursor > today });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

const TABS = ['Summary', 'Calendar', 'Log'];

export default function History() {
  const [tab, setTab] = useState('Summary');
  const [, forceRefresh] = useState(0);
  const entries = useMemo(() => getEntries(), [forceRefresh]);
  const fantasyEntries = entries.filter((e) => e.state === 'fantasy');

  if (entries.length === 0) {
    return (
      <div className="screen history">
        <p className="eyebrow">History</p>
        <h1>Nothing logged yet</h1>
        <p className="history__empty">
          Once you've got a few check-ins, the shape of this will start to show itself here.
        </p>
      </div>
    );
  }

  return (
    <div className="screen history">
      <p className="eyebrow">History</p>
      <h1>What the data shows</h1>

      <div className="history__tabs">
        {TABS.map((t) => (
          <button
            key={t}
            className={`history__tab${tab === t ? ' history__tab--active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Summary' && <Summary entries={entries} fantasyEntries={fantasyEntries} />}
      {tab === 'Calendar' && <CalendarView entries={entries} />}
      {tab === 'Log' && (
        <LogView entries={entries} onDelete={(id) => { deleteEntry(id); forceRefresh((n) => n + 1); }} />
      )}
    </div>
  );
}

function Summary({ entries, fantasyEntries }) {
  const storylineCounts = tally(fantasyEntries, 'storyline');
  const feelingCounts = tally(fantasyEntries, 'feeling');
  const needCounts = tally(fantasyEntries, 'need');
  const triggerCounts = tally(fantasyEntries, 'trigger');
  const urgeCounts = tally(fantasyEntries, 'urge');

  const sheCount = fantasyEntries.filter((e) => e.shePresent).length;
  const shePct = fantasyEntries.length ? Math.round((sheCount / fantasyEntries.length) * 100) : 0;

  const lowEnergyCount = fantasyEntries.filter((e) => e.energy === 'low').length;
  const lowEnergyPct = fantasyEntries.length ? Math.round((lowEnergyCount / fantasyEntries.length) * 100) : 0;

  const minutesById = Object.fromEntries(durations.map((d) => [d.id, d.minutes]));

  const thisWeekStart = daysAgo(7);
  const lastWeekStart = daysAgo(14);
  const thisWeekEntries = fantasyEntries.filter((e) => new Date(e.timestamp) >= thisWeekStart);
  const lastWeekEntries = fantasyEntries.filter((e) => {
    const t = new Date(e.timestamp);
    return t >= lastWeekStart && t < thisWeekStart;
  });
  const hasPriorWindow = lastWeekEntries.length > 0;
  const thisWeek = windowStats(thisWeekEntries, minutesById);
  const lastWeek = windowStats(lastWeekEntries, minutesById);

  const timedEntries = fantasyEntries.filter((e) => e.duration);
  const totalMinutes = timedEntries.reduce((sum, e) => sum + (minutesById[e.duration] || 0), 0);
  const activeDays = new Set(timedEntries.map((e) => dayKey(e.timestamp))).size;
  const avgPerDay = activeDays ? Math.round(totalMinutes / activeDays) : 0;
  const totalHours = (totalMinutes / 60).toFixed(1);

  const toolStats = {};
  fantasyEntries.forEach((e) => {
    if (!e.ladderChoice || e.ladderChoice === 'log' || !e.outcome) return;
    if (!toolStats[e.ladderChoice]) toolStats[e.ladderChoice] = { worked: 0, total: 0 };
    toolStats[e.ladderChoice].total += 1;
    if (e.outcome === 'worked') toolStats[e.ladderChoice].worked += 1;
  });
  const toolEntries = Object.entries(toolStats).sort(
    (a, b) => b[1].worked / b[1].total - a[1].worked / a[1].total
  );

  const weekdayCountsObj = Object.fromEntries(WEEKDAY_NAMES.map((d) => [d, 0]));
  fantasyEntries.forEach((e) => { weekdayCountsObj[weekdayOf(e.timestamp)] += 1; });
  const weekdayMax = Math.max(...Object.values(weekdayCountsObj), 1);

  const dayPartCountsObj = Object.fromEntries(DAY_PARTS.map((p) => [p, 0]));
  fantasyEntries.forEach((e) => { dayPartCountsObj[dayPartOf(e.timestamp)] += 1; });
  const dayPartMax = Math.max(...Object.values(dayPartCountsObj), 1);

  return (
    <>
      <p className="history__count">{entries.length} check-ins logged · {fantasyEntries.length} elsewhere</p>

      {thisWeekEntries.length > 0 && (
        <Section title="This week vs last">
          {!hasPriorWindow && (
            <p className="trend-note">Not enough history yet to compare — check back after a full week.</p>
          )}
          <div className="trend-list">
            <TrendRow label="Episodes" current={thisWeek.count} previous={hasPriorWindow ? lastWeek.count : null} lowerIsBetter />
            <TrendRow
              label="Avg pull intensity"
              current={thisWeek.avgUrge}
              previous={hasPriorWindow ? lastWeek.avgUrge : null}
              format={(v) => v.toFixed(1)}
              suffix="/3"
              lowerIsBetter
            />
            <TrendRow
              label="Avg time per episode"
              current={thisWeek.avgMinutes}
              previous={hasPriorWindow ? lastWeek.avgMinutes : null}
              format={(v) => Math.round(v)}
              suffix="m"
              lowerIsBetter
            />
            <TrendRow
              label="Tool success rate"
              current={thisWeek.successPct}
              previous={hasPriorWindow ? lastWeek.successPct : null}
              suffix="%"
              lowerIsBetter={false}
            />
          </div>
        </Section>
      )}

      {storylineCounts.length > 0 && (
        <Section title="Worlds you return to">
          {storylineCounts.map(([id, count]) => (
            <Bar key={id} label={labelFor(defaultStorylines, id)} count={count} max={storylineCounts[0][1]} />
          ))}
        </Section>
      )}

      {feelingCounts.length > 0 && (
        <Section title="What preceded it">
          {feelingCounts.map(([id, count]) => (
            <Bar key={id} label={labelFor(precedingStates, id)} count={count} max={feelingCounts[0][1]} />
          ))}
        </Section>
      )}

      {needCounts.length > 0 && (
        <Section title="What it's giving you">
          {needCounts.map(([id, count]) => (
            <Bar key={id} label={labelFor(needDefs, id)} count={count} max={needCounts[0][1]} />
          ))}
        </Section>
      )}

      {triggerCounts.length > 0 && (
        <Section title="Right before it happens">
          {triggerCounts.map(([id, count]) => (
            <Bar key={id} label={labelFor(triggerContexts, id)} count={count} max={triggerCounts[0][1]} />
          ))}
        </Section>
      )}

      {urgeCounts.length > 0 && (
        <Section title="How strong it pulls">
          {urgeCounts.map(([id, count]) => (
            <Bar key={id} label={labelFor(urgeLevels, id)} count={count} max={urgeCounts[0][1]} />
          ))}
        </Section>
      )}

      {timedEntries.length > 0 && (
        <Section title="Time">
          <div className="history__stat-grid history__stat-grid--two">
            <Stat value={`${avgPerDay}m`} label="avg per active day" />
            <Stat value={`${totalHours}h`} label="total logged" />
          </div>
        </Section>
      )}

      {toolEntries.length > 0 && (
        <Section title="What actually worked">
          {toolEntries.map(([id, stat]) => (
            <Bar
              key={id}
              label={`${TOOL_LABELS[id] || id} — ${stat.worked}/${stat.total}`}
              count={stat.worked}
              max={stat.total}
            />
          ))}
        </Section>
      )}

      {fantasyEntries.length > 0 && (
        <Section title="When it happens">
          {WEEKDAY_NAMES.map((d) => (
            <Bar key={d} label={d} count={weekdayCountsObj[d]} max={weekdayMax} />
          ))}
        </Section>
      )}

      {fantasyEntries.length > 0 && (
        <Section title="Time of day">
          {DAY_PARTS.map((p) => (
            <Bar key={p} label={p} count={dayPartCountsObj[p]} max={dayPartMax} />
          ))}
        </Section>
      )}

      <Section title="A few numbers">
        <div className="history__stat-grid history__stat-grid--two">
          <Stat value={`${shePct}%`} label="involve her" />
          <Stat value={`${lowEnergyPct}%`} label="hit during low energy" />
        </div>
      </Section>
    </>
  );
}

function CalendarView({ entries }) {
  const weeks = useMemo(() => buildWeeks(entries), [entries]);
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="calendar">
      <p className="history__count">Last {weeks.length} weeks · gold means more present, lavender means more elsewhere</p>
      <div className="calendar__grid" style={{ gridTemplateColumns: `repeat(${weeks.length}, 1fr)` }}>
        {weeks.map((week, wi) => (
          <div className="calendar__col" key={wi}>
            {week.map((day) => (
              <div
                key={day.key}
                className="calendar__cell"
                title={day.total ? `${day.key}: ${Math.round(day.ratio * 100)}% present` : day.key}
                style={{
                  opacity: day.isFuture ? 0 : 1,
                  background:
                    day.total === 0
                      ? 'var(--bg-surface)'
                      : `color-mix(in srgb, var(--glow-gold) ${Math.round(day.ratio * 100)}%, var(--lavender))`,
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="calendar__legend">
        {dayLabels.map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>
    </div>
  );
}

function LogView({ entries, onDelete }) {
  const sorted = [...entries].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <div className="log">
      {sorted.map((e) => (
        <div key={e.id} className="log__row">
          <div className="log__row-main">
            <span className={`log__badge log__badge--${e.state}`}>
              {e.state === 'reality' ? 'Here' : e.state === 'precommit' ? 'Pre-commit' : e.state === 'reflection' ? 'Reflection' : e.state === 'preempted' ? 'Cut off early' : 'Elsewhere'}
            </span>
            <span className="log__time">
              {new Date(e.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              {' · '}
              {new Date(e.timestamp).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
            </span>
          </div>

          {e.state === 'fantasy' && (
            <div className="log__tags">
              <span className="log__tag">{labelFor(defaultStorylines, e.storyline)}</span>
              {e.feeling && <span className="log__tag">{labelFor(precedingStates, e.feeling)}</span>}
              {e.need && <span className="log__tag">{labelFor(needDefs, e.need)}</span>}
              {e.urge && <span className="log__tag">{labelFor(urgeLevels, e.urge)} pull</span>}
              {e.duration && <span className="log__tag">{labelFor(durations, e.duration)}</span>}
              {e.ladderChoice && e.ladderChoice !== 'log' && (
                <span className={`log__tag log__tag--outcome-${e.outcome || 'unknown'}`}>
                  {TOOL_LABELS[e.ladderChoice] || e.ladderChoice}
                  {e.outcome === 'worked' ? ' ✓' : e.outcome === 'notWorked' ? ' ✗' : ''}
                </span>
              )}
            </div>
          )}

          {e.state === 'preempted' && (
            <div className="log__tags">
              <span className={`log__tag log__tag--outcome-${e.outcome || 'unknown'}`}>
                Wonder prompt{e.outcome === 'worked' ? ' ✓' : e.outcome === 'notWorked' ? ' ✗' : ''}
              </span>
            </div>
          )}

          {e.state === 'reflection' && e.text && (
            <div className="log__detail log__detail--reflection">{e.text}</div>
          )}

          <button className="log__delete" onClick={() => onDelete(e.id)} aria-label="Delete entry">
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

function TrendRow({ label, current, previous, format = (v) => v, suffix = '', lowerIsBetter = true }) {
  if (current === null || current === undefined) return null;
  const currentText = `${format(current)}${suffix}`;

  if (previous === null || previous === undefined) {
    return (
      <div className="trend-row">
        <span className="trend-row__label">{label}</span>
        <span className="trend-row__value">{currentText}</span>
      </div>
    );
  }

  const diff = current - previous;
  const flat = Math.abs(diff) < 0.05;
  const improved = lowerIsBetter ? diff < 0 : diff > 0;
  const deltaClass = flat ? 'flat' : improved ? 'better' : 'worse';
  const arrow = flat ? '·' : diff > 0 ? '↑' : '↓';

  return (
    <div className="trend-row">
      <span className="trend-row__label">{label}</span>
      <span className="trend-row__value-group">
        <span className="trend-row__value">{currentText}</span>
        <span className={`trend-row__delta trend-row__delta--${deltaClass}`}>
          {flat ? 'same as last week' : `${arrow} from ${format(previous)}${suffix}`}
        </span>
      </span>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="history__section">
      <h2>{title}</h2>
      <div className="history__bars">{children}</div>
    </div>
  );
}

function Bar({ label, count, max }) {
  const pct = max ? Math.round((count / max) * 100) : 0;
  return (
    <div className="bar">
      <div className="bar__row">
        <span className="bar__label">{label}</span>
        <span className="bar__count">{count}</span>
      </div>
      <div className="bar__track">
        <div className="bar__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div className="stat">
      <span className="stat__value">{value}</span>
      <span className="stat__label">{label}</span>
    </div>
  );
}
