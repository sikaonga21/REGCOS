'use client';

import { useState } from 'react';
import { Envelope, Phone, Trash } from 'phosphor-react';
import {
  Button,
  Field,
  Modal,
  StatusBadge,
  Textarea,
  useToast,
} from '@/components/admin/ui';
import { formatDateTime } from '@/lib/dates';
import type { Enrollment, EnrollmentStatus } from '@/lib/db/types';

/** Labels for the enrollment form fields, matching the public form's wording. */
const FIELD_LABELS: Record<string, string> = {
  childName: "Child's name",
  childDob: 'Date of birth',
  gender: 'Gender',
  residentialAddress: 'Residential address',
  expectedStartDate: 'Expected start date',
  homeLanguage: 'Language spoken at home',
  previousSchool: 'Attended another school',
  comfortableInGroups: 'Comfortable in group situations',
  hasSiblings: 'Has siblings',
  hasPet: 'Has a pet',
  fatherName: "Father/Guardian's name",
  fatherOccupation: "Father/Guardian's occupation",
  fatherWorkPlace: "Father/Guardian's workplace",
  fatherPhone: "Father/Guardian's phone",
  fatherEmail: "Father/Guardian's email",
  fatherNationality: "Father/Guardian's nationality",
  fatherReligion: "Father/Guardian's religion",
  motherName: "Mother/Guardian's name",
  motherOccupation: "Mother/Guardian's occupation",
  motherWorkPlace: "Mother/Guardian's workplace",
  motherPhone: "Mother/Guardian's phone",
  motherEmail: "Mother/Guardian's email",
  motherNationality: "Mother/Guardian's nationality",
  motherReligion: "Mother/Guardian's religion",
  specialDiet: 'Special diet',
  hasAllergies: 'Has allergies',
  allergyDetails: 'Allergy details',
  usesDiapers: 'Uses diapers',
  usesPotty: 'Uses a potty or toilet',
  toiletReminders: 'Needs toilet reminders',
  developmentalConcern: 'Developmental concern',
  developmentalDetails: 'Developmental details',
  dayToDayCare: 'Day-to-day care at home',
};

/** Groups the flat form payload into the sections a reviewer reads in order. */
const SECTIONS: Array<{ title: string; keys: string[] }> = [
  {
    title: 'About the child',
    keys: [
      'childName', 'childDob', 'gender', 'residentialAddress',
      'expectedStartDate', 'homeLanguage', 'previousSchool', 'comfortableInGroups',
      'hasSiblings', 'hasPet',
    ],
  },
  {
    title: 'Father / guardian',
    keys: [
      'fatherName', 'fatherOccupation', 'fatherWorkPlace', 'fatherPhone',
      'fatherEmail', 'fatherNationality', 'fatherReligion',
    ],
  },
  {
    title: 'Mother / guardian',
    keys: [
      'motherName', 'motherOccupation', 'motherWorkPlace', 'motherPhone',
      'motherEmail', 'motherNationality', 'motherReligion',
    ],
  },
  {
    title: 'Care and health',
    keys: [
      'specialDiet', 'hasAllergies', 'allergyDetails', 'usesDiapers',
      'usesPotty', 'toiletReminders', 'developmentalConcern',
      'developmentalDetails', 'dayToDayCare',
    ],
  },
];

const STATUS_FLOW: EnrollmentStatus[] = ['new', 'reviewing', 'accepted', 'waitlist', 'declined'];

export default function EnrollmentDetail({
  enrollment,
  busy,
  onClose,
  onStatusChange,
  onDelete,
  onSaved,
}: {
  enrollment: Enrollment;
  busy: boolean;
  onClose: () => void;
  onStatusChange: (next: EnrollmentStatus) => void;
  onDelete: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [notes, setNotes] = useState(enrollment.notes ?? '');
  const [savingNotes, setSavingNotes] = useState(false);

  const payload = (enrollment.payload ?? {}) as Record<string, unknown>;

  // Anything the form sends that isn't in a named section still gets shown.
  const knownKeys = new Set(SECTIONS.flatMap((section) => section.keys));
  const extraKeys = Object.keys(payload).filter((key) => !knownKeys.has(key));

  const saveNotes = async () => {
    setSavingNotes(true);
    try {
      const response = await fetch(`/api/admin/enrollments/${enrollment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) toast.push(result.error ?? 'Could not save your notes.', 'error');
      else {
        toast.push('Notes saved.');
        onSaved();
      }
    } catch {
      toast.push('Could not reach the server.', 'error');
    } finally {
      setSavingNotes(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={enrollment.child_name}
      description={`Received ${formatDateTime(enrollment.created_at)}`}
      size="lg"
      footer={
        <>
          <Button
            variant="ghost"
            onClick={onDelete}
            className="mr-auto text-accent hover:bg-accent/10"
          >
            <Trash size={15} />
            Delete
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => void saveNotes()} loading={savingNotes}>
            Save notes
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-bg-light p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Status
            </span>
            <StatusBadge status={enrollment.status} />
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {STATUS_FLOW.map((option) => (
              <Button
                key={option}
                size="sm"
                variant={option === enrollment.status ? 'primary' : 'outline'}
                disabled={busy || option === enrollment.status}
                onClick={() => onStatusChange(option)}
                className="capitalize"
              >
                {option}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {enrollment.email ? (
            <a href={`mailto:${enrollment.email}?subject=Regcos Christian Academy — your application`}>
              <Button variant="outline" size="sm">
                <Envelope size={14} />
                Email {enrollment.email}
              </Button>
            </a>
          ) : null}
          {enrollment.phone ? (
            <a href={`tel:${enrollment.phone}`}>
              <Button variant="outline" size="sm">
                <Phone size={14} />
                {enrollment.phone}
              </Button>
            </a>
          ) : null}
        </div>

        {SECTIONS.map((section) => {
          const entries = section.keys
            .filter((key) => payload[key] !== undefined && payload[key] !== '')
            .map((key) => [key, payload[key]] as const);

          if (entries.length === 0) return null;

          return (
            <section key={section.title}>
              <h3 className="mb-2.5 font-heading text-sm font-semibold text-primary-dark">
                {section.title}
              </h3>
              <dl className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
                {entries.map(([key, value]) => (
                  <div key={key} className="min-w-0">
                    <dt className="text-xs text-slate-500">{FIELD_LABELS[key] ?? key}</dt>
                    <dd className="break-words text-sm text-slate-800">{String(value)}</dd>
                  </div>
                ))}
              </dl>
            </section>
          );
        })}

        {extraKeys.length > 0 ? (
          <section>
            <h3 className="mb-2.5 font-heading text-sm font-semibold text-primary-dark">
              Other answers
            </h3>
            <dl className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
              {extraKeys.map((key) => (
                <div key={key} className="min-w-0">
                  <dt className="text-xs text-slate-500">{FIELD_LABELS[key] ?? key}</dt>
                  <dd className="break-words text-sm text-slate-800">{String(payload[key])}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        <Field
          label="Internal notes"
          hint="Only visible to admin users. Never shown to parents."
        >
          <Textarea
            rows={4}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Called the parent on 20 Oct — happy to start in January."
          />
        </Field>
      </div>
    </Modal>
  );
}
