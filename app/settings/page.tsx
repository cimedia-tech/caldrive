'use client';

import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import TopBar from '@/components/layout/TopBar';
import Button from '@/components/ui/Button';
import Toggle from '@/components/ui/Toggle';
import { AGENT_CAPABILITIES } from '@/lib/agents/types';
import {
  useSettingsStore,
  WeekStart,
  TimeFormat,
  CalendarDefaultView,
  DocsViewMode,
  DocsSortField,
} from '@/lib/store/settings-store';
import styles from './settings.module.css';

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={`${styles.sectionTitle} serif`}>{title}</h2>
        <p className={styles.sectionDescription}>{description}</p>
      </div>
      <div className={styles.sectionBody}>{children}</div>
    </section>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className={styles.row}>
      <div className={styles.rowText}>
        <div className={`${styles.rowLabel} mono uppercase`}>{label}</div>
        {hint && <div className={styles.rowHint}>{hint}</div>}
      </div>
      <div className={styles.rowControl}>{children}</div>
    </div>
  );
}

function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className={styles.segmented}>
      {options.map((opt) => (
        <button
          key={String(opt.value)}
          className={`${styles.segmentBtn} ${value === opt.value ? styles.segmentActive : ''} mono`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const settings = useSettingsStore();
  const [resetConfirm, setResetConfirm] = useState(false);

  const handleReset = () => {
    if (!resetConfirm) {
      setResetConfirm(true);
      setTimeout(() => setResetConfirm(false), 4000);
      return;
    }
    settings.resetToDefaults();
    setResetConfirm(false);
  };

  return (
    <div className={styles.page}>
      <TopBar title="SETTINGS" />
      <div className={styles.content}>
        <div className={styles.intro}>
          <h1 className="serif">Settings</h1>
          <p>Preferences are saved automatically on this device.</p>
        </div>

        <Section title="Calendar" description="Control how your schedule is displayed and how new events behave.">
          <Row label="Week starts on" hint="Sets the first column of the month and week grids.">
            <SegmentedControl<WeekStart>
              options={[{ label: 'MONDAY', value: 1 }, { label: 'SUNDAY', value: 0 }]}
              value={settings.weekStartsOn}
              onChange={settings.setWeekStartsOn}
            />
          </Row>
          <Row label="Default view" hint="The view the calendar opens in.">
            <SegmentedControl<CalendarDefaultView>
              options={[
                { label: 'MONTH', value: 'month' },
                { label: 'WEEK', value: 'week' },
                { label: 'AGENDA', value: 'agenda' },
              ]}
              value={settings.defaultCalendarView}
              onChange={settings.setDefaultCalendarView}
            />
          </Row>
          <Row label="Time format" hint="Applies to the week view time axis and event times.">
            <SegmentedControl<TimeFormat>
              options={[{ label: '12-HOUR', value: '12h' }, { label: '24-HOUR', value: '24h' }]}
              value={settings.timeFormat}
              onChange={settings.setTimeFormat}
            />
          </Row>
          <Row label="Day starts at" hint="The week view scrolls to this hour when opened.">
            <select
              className={styles.select}
              value={settings.dayStartHour}
              onChange={(e) => settings.setDayStartHour(Number(e.target.value))}
            >
              {Array.from({ length: 24 }, (_, h) => (
                <option key={h} value={h}>
                  {settings.timeFormat === '24h'
                    ? `${h.toString().padStart(2, '0')}:00`
                    : `${h % 12 === 0 ? 12 : h % 12} ${h < 12 ? 'AM' : 'PM'}`}
                </option>
              ))}
            </select>
          </Row>
          <Row label="Default event length" hint="Pre-filled duration when creating a new event.">
            <select
              className={styles.select}
              value={settings.defaultEventDurationMin}
              onChange={(e) => settings.setDefaultEventDurationMin(Number(e.target.value))}
            >
              <option value={15}>15 MIN</option>
              <option value={30}>30 MIN</option>
              <option value={45}>45 MIN</option>
              <option value={60}>1 HOUR</option>
              <option value={90}>90 MIN</option>
              <option value={120}>2 HOURS</option>
            </select>
          </Row>
        </Section>

        <Section title="Documents" description="Defaults for the document library.">
          <Row label="Default layout">
            <SegmentedControl<DocsViewMode>
              options={[{ label: 'GRID', value: 'grid' }, { label: 'LIST', value: 'list' }]}
              value={settings.docsViewMode}
              onChange={settings.setDocsViewMode}
            />
          </Row>
          <Row label="Sort files by">
            <SegmentedControl<DocsSortField>
              options={[
                { label: 'NAME', value: 'name' },
                { label: 'MODIFIED', value: 'modifiedTime' },
                { label: 'SIZE', value: 'size' },
              ]}
              value={settings.docsSortBy}
              onChange={settings.setDocsSortBy}
            />
          </Row>
        </Section>

        <Section title="Agents" description="Enable or disable individual agents. Disabled agents stop posting to the activity feed.">
          {AGENT_CAPABILITIES.map((agent) => (
            <Row key={agent.id} label={agent.name} hint={agent.description}>
              <Toggle
                checked={settings.agentsEnabled[agent.id] !== false}
                onChange={(checked) => settings.setAgentEnabled(agent.id, checked)}
              />
            </Row>
          ))}
          <Row label="Feed notifications" hint="Show the agent activity count in the top bar.">
            <Toggle checked={settings.agentNotifications} onChange={settings.setAgentNotifications} />
          </Row>
        </Section>

        <Section title="Account" description="Your connected Google account powers Calendar and Drive.">
          <Row
            label="Google account"
            hint={session?.user?.email || 'Not signed in — connect Google to sync Calendar and Drive.'}
          >
            {session ? (
              <Button variant="outline" onClick={() => signOut()}>SIGN OUT</Button>
            ) : (
              <span className={`${styles.badge} mono`}>OFFLINE MODE</span>
            )}
          </Row>
        </Section>

        <Section title="Data" description="Preferences live in this browser's local storage. Nothing here touches your Google data.">
          <Row label="Reset preferences" hint="Restores every setting on this page to its default.">
            <Button variant={resetConfirm ? 'danger' : 'outline'} onClick={handleReset}>
              {resetConfirm ? 'CLICK AGAIN TO CONFIRM' : 'RESET TO DEFAULTS'}
            </Button>
          </Row>
        </Section>
      </div>
    </div>
  );
}
