import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { defaultStorylines } from '../data/storylines';
import { needs, triggerContexts } from '../data/needs';
import { precedingStates } from '../data/precedingState';
import { urgeLevels } from '../data/urge';
import { durations } from '../data/duration';
import { breathingTechnique, microActions, pickGentleLine } from '../data/ladder';
import { randomWonderPrompt } from '../data/wonder';
import FollowLight from './FollowLight';
import { addEntry, getSettings } from '../lib/storage';
import './CheckIn.css';

const STEPS = {
  STATE: 'state',
  STORYLINE: 'storyline',
  FEELING: 'feeling',
  NEED: 'need',
  TRIGGER: 'trigger',
  URGE: 'urge',
  DURATION: 'duration',
  ENERGY: 'energy',
  LADDER: 'ladder',
  DONE: 'done',
};

export default function CheckIn() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const source = searchParams.get('source') || 'manual';
  const isPing = source === 'ping';

  const settings = getSettings();
  const storylines = settings.storylines || defaultStorylines;
  const breathing = settings.breathing || breathingTechnique;

  const [step, setStep] = useState(isPing ? STEPS.STATE : STEPS.STORYLINE);
  const [data, setData] = useState({
    state: isPing ? null : 'fantasy',
    source,
    storyline: null,
    shePresent: null,
    feeling: null,
    need: null,
    trigger: null,
    urge: null,
    duration: null,
    energy: null,
    ladderChoice: null,
    outcome: null,
    holdPct: null,
  });
  const [line] = useState(() => pickGentleLine(settings.whyStatements));
  const [action] = useState(() => microActions[Math.floor(Math.random() * microActions.length)]);
  const [breathRound, setBreathRound] = useState(0);
  const [wonder, setWonder] = useState(null);
  const [pendingOutcome, setPendingOutcome] = useState(false);
  const [showFollowLight, setShowFollowLight] = useState(false);

  function patch(fields) {
    setData((d) => ({ ...d, ...fields }));
  }

  function finish(finalPatch = {}) {
    const full = { ...data, ...finalPatch };
    addEntry(full);
    setStep(STEPS.DONE);
  }

  function chooseState(state) {
    patch({ state });
    if (state === 'reality') {
      finish({ state });
    } else {
      setStep(STEPS.STORYLINE);
    }
  }

  return (
    <div className="screen checkin">
      {step === STEPS.STATE && (
        <StepShell eyebrow="Right now">
          <h1>Reality, or somewhere else?</h1>
          <div className="checkin__choices checkin__choices--two">
            <button className="choice choice--reality" onClick={() => chooseState('reality')}>Here</button>
            <button className="choice choice--fantasy" onClick={() => chooseState('fantasy')}>Elsewhere</button>
          </div>
        </StepShell>
      )}

      {step === STEPS.STORYLINE && (
        <StepShell eyebrow="Which world">
          <h1>What was it?</h1>
          <div className="checkin__choices">
            {storylines.map((s) => (
              <button
                key={s.id}
                className={`choice choice--wide${data.storyline === s.id ? ' choice--selected' : ''}`}
                onClick={() => patch({ storyline: s.id })}
              >
                <span className="choice__label">{s.label}</span>
                <span className="choice__hint">{s.hint}</span>
              </button>
            ))}
          </div>
          <div className="checkin__toggle-row">
            <span>Was she part of it?</span>
            <div className="checkin__toggle">
              <button className={data.shePresent === true ? 'toggle--on' : ''} onClick={() => patch({ shePresent: true })}>Yes</button>
              <button className={data.shePresent === false ? 'toggle--on' : ''} onClick={() => patch({ shePresent: false })}>No</button>
            </div>
          </div>
          <NextButton disabled={!data.storyline || data.shePresent === null} onClick={() => setStep(STEPS.FEELING)} />
        </StepShell>
      )}

      {step === STEPS.FEELING && (
        <StepShell eyebrow="Just before">
          <h1>What were you feeling, right before?</h1>
          <div className="checkin__choices">
            {precedingStates.map((f) => (
              <button
                key={f.id}
                className={`choice${data.feeling === f.id ? ' choice--selected' : ''}`}
                onClick={() => patch({ feeling: f.id })}
              >
                {f.label}
              </button>
            ))}
          </div>
          <NextButton disabled={!data.feeling} onClick={() => setStep(STEPS.NEED)} />
        </StepShell>
      )}

      {step === STEPS.NEED && (
        <StepShell eyebrow="Underneath it">
          <h1>What was it giving you?</h1>
          <div className="checkin__choices">
            {needs.map((n) => (
              <button
                key={n.id}
                className={`choice${data.need === n.id ? ' choice--selected' : ''}`}
                onClick={() => patch({ need: n.id })}
              >
                {n.label}
              </button>
            ))}
          </div>
          <NextButton disabled={!data.need} onClick={() => setStep(STEPS.TRIGGER)} />
        </StepShell>
      )}

      {step === STEPS.TRIGGER && (
        <StepShell eyebrow="Right before">
          <h1>What was happening just before?</h1>
          <div className="checkin__choices">
            {triggerContexts.map((t) => (
              <button
                key={t.id}
                className={`choice${data.trigger === t.id ? ' choice--selected' : ''}`}
                onClick={() => patch({ trigger: t.id })}
              >
                {t.label}
                {t.note && <span className="choice__note">{t.note}</span>}
              </button>
            ))}
          </div>
          <NextButton disabled={!data.trigger} onClick={() => setStep(STEPS.URGE)} />
        </StepShell>
      )}

      {step === STEPS.URGE && (
        <StepShell eyebrow="Intensity">
          <h1>How strong was the pull?</h1>
          <div className="checkin__choices">
            {urgeLevels.map((u) => (
              <button
                key={u.id}
                className={`choice${data.urge === u.id ? ' choice--selected' : ''}`}
                onClick={() => patch({ urge: u.id })}
              >
                <span className="choice__label">{u.label}</span>
                <span className="choice__hint">{u.hint}</span>
              </button>
            ))}
          </div>
          <NextButton disabled={!data.urge} onClick={() => setStep(STEPS.DURATION)} />
        </StepShell>
      )}

      {step === STEPS.DURATION && (
        <StepShell eyebrow="Roughly">
          <h1>About how long were you in it?</h1>
          <div className="checkin__choices">
            {durations.map((d) => (
              <button
                key={d.id}
                className={`choice${data.duration === d.id ? ' choice--selected' : ''}`}
                onClick={() => patch({ duration: d.id })}
              >
                {d.label}
              </button>
            ))}
          </div>
          <NextButton disabled={!data.duration} onClick={() => setStep(STEPS.ENERGY)} />
        </StepShell>
      )}

      {step === STEPS.ENERGY && (
        <StepShell eyebrow="Last thing">
          <h1>Energy to do anything about it?</h1>
          <div className="checkin__choices checkin__choices--three">
            {['low', 'medium', 'high'].map((lvl) => (
              <button
                key={lvl}
                className={`choice${data.energy === lvl ? ' choice--selected' : ''}`}
                onClick={() => patch({ energy: lvl })}
              >
                {lvl[0].toUpperCase() + lvl.slice(1)}
              </button>
            ))}
          </div>
          <NextButton disabled={!data.energy} label="Continue" onClick={() => setStep(STEPS.LADDER)} />
        </StepShell>
      )}

      {step === STEPS.LADDER && (
        <StepShell eyebrow="No pressure">
          <p className="checkin__gentle-line">{line.text}</p>
          {line.mine && <p className="checkin__line-attribution">— something you wrote</p>}
          <div className="checkin__ladder">
            <button className="ladder-option" onClick={() => finish({ ladderChoice: 'log' })}>
              <span className="ladder-option__title">Just log it</span>
              <span className="ladder-option__sub">That's enough for right now</span>
            </button>

            <button
              className="ladder-option"
              onClick={() => { setBreathRound(1); patch({ ladderChoice: 'breathing' }); }}
            >
              <span className="ladder-option__title">{breathing.title}</span>
              <span className="ladder-option__sub">{breathing.steps.join(' · ')}</span>
            </button>

            <button
              className="ladder-option"
              onClick={() => { patch({ ladderChoice: 'action', action: action.id }); setPendingOutcome(true); }}
            >
              <span className="ladder-option__title">{action.label}</span>
              <span className="ladder-option__sub">One small thing, that's all</span>
            </button>

            <button
              className="ladder-option"
              onClick={() => { setWonder(randomWonderPrompt()); patch({ ladderChoice: 'wonder' }); }}
            >
              <span className="ladder-option__title">Something to sit with</span>
              <span className="ladder-option__sub">A question, not a fix</span>
            </button>

            <button
              className="ladder-option"
              onClick={() => { setShowFollowLight(true); patch({ ladderChoice: 'followlight' }); }}
            >
              <span className="ladder-option__title">Follow the light</span>
              <span className="ladder-option__sub">Physical focus, not thought</span>
            </button>
          </div>

          {breathRound > 0 && (
            <div className="checkin__breathing-overlay">
              <div className="breathing-orb" />
              <p className="breathing-round">Round {breathRound} of {breathing.rounds}</p>
              <div className="checkin__choices checkin__choices--two" style={{ marginTop: 24 }}>
                {breathRound < breathing.rounds ? (
                  <button className="choice choice--wide" onClick={() => setBreathRound((r) => r + 1)}>Next round</button>
                ) : (
                  <button className="choice choice--wide choice--selected" onClick={() => { setBreathRound(0); setPendingOutcome(true); }}>Done</button>
                )}
              </div>
            </div>
          )}

          {wonder && (
            <div className="checkin__breathing-overlay">
              <p className="eyebrow">{wonder.type}</p>
              <p className="checkin__wonder-text">{wonder.text}</p>
              <div className="checkin__choices checkin__choices--two" style={{ marginTop: 28 }}>
                <button className="choice choice--wide" onClick={() => setWonder(randomWonderPrompt())}>Another one</button>
                <button className="choice choice--wide choice--selected" onClick={() => { setWonder(null); setPendingOutcome(true); }}>Done</button>
              </div>
            </div>
          )}

          {showFollowLight && (
            <div className="checkin__breathing-overlay">
              <FollowLight
                onDone={(holdPct) => {
                  setShowFollowLight(false);
                  patch({ holdPct });
                  setPendingOutcome(true);
                }}
              />
            </div>
          )}

          {pendingOutcome && (
            <div className="checkin__breathing-overlay">
              <p className="eyebrow">One more thing</p>
              <p className="checkin__wonder-text">Did it help?</p>
              <div className="checkin__choices checkin__choices--two" style={{ marginTop: 28 }}>
                <button className="choice choice--wide choice--selected" onClick={() => finish({ outcome: 'worked' })}>Back to it</button>
                <button className="choice choice--wide" onClick={() => finish({ outcome: 'notWorked' })}>Still pulled</button>
              </div>
            </div>
          )}
        </StepShell>
      )}

      {step === STEPS.DONE && (
        <StepShell>
          <div className="checkin__done">
            <div className="checkin__done-orb" />
            <h1>Logged.</h1>
            <p className="checkin__done-sub">Back to it, whenever you're ready.</p>
            <button className="choice choice--wide choice--selected" onClick={() => navigate('/')}>Home</button>
          </div>
        </StepShell>
      )}
    </div>
  );
}

function StepShell({ eyebrow, children }) {
  return (
    <div className="checkin__step">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      {children}
    </div>
  );
}

function NextButton({ disabled, onClick, label = 'Next' }) {
  return (
    <button className="checkin__next" disabled={disabled} onClick={onClick}>
      {label}
    </button>
  );
}
