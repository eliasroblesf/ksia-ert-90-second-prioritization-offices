/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TriageTag = 'RED' | 'YEL' | 'GRN' | 'BLK';

export interface Telemetry {
  airway: string;
  resp: string;
  circ: string;
  neuro: string;
  visual: string;
  audio: string;
  vitals: {
    hr: number;
    rr: number;
    bp: string;
    avpu: string;
  };
}

export interface CasualtyProfile {
  id: string;
  name: string;
  telemetry: Telemetry;
  correctTag: TriageTag;
  isVocal: boolean;
  justification: string;
}

export interface Scenario {
  id: number;
  group: string;
  title: string;
  location: string;
  facilitySector: string;
  summary: string;
  officeContext: string;
  casualties: CasualtyProfile[];
  interventions: {
    label: string;
    isCorrect: boolean;
  }[];
}

export const scenarios: Scenario[] = [
  {
    id: 1,
    group: "DRILL 1",
    title: "Glass Wall Breaks in Meeting Room",
    location: "4th Floor - Executive Meeting Room 402",
    facilitySector: "Headquarters Meeting Rooms",
    summary: "During a morning presentation, a large glass wall divider broke loose and crashed onto a conference table. Broken glass and heavy metal frames injured three office staff members.",
    officeContext: "Airport Executive Directorate Offices - Meeting Room 402",
    casualties: [
      {
        id: 'A',
        name: 'Person A (Office Secretary)',
        telemetry: {
          airway: 'Gasping for air, breathing hard and fast',
          resp: '30 breaths per minute (Very fast)',
          circ: 'Severe bleeding: Bright red blood spurting fast from arm cut',
          neuro: 'Almost passed out, only makes a sound when touched',
          visual: 'Deep cut on upper arm, pool of bright red blood growing on the carpet, pale face',
          audio: 'Quiet weak groans, sound of blood spurting',
          vitals: { hr: 138, rr: 30, bp: '80/48 (Very low)', avpu: 'Reacts only to pain' }
        },
        correctTag: 'RED',
        isVocal: false,
        justification: 'Severe arterial bleeding! If you do not stop the bleeding immediately, she will lose too much blood and die within minutes.'
      },
      {
        id: 'B',
        name: 'Person B (Finance Manager)',
        telemetry: {
          airway: 'Breathing loudly while shouting and crying',
          resp: '24 breaths per minute',
          circ: 'Strong pulse in wrist (94 beats/min), dark blood dripping slowly',
          neuro: 'Fully awake and alert, standing up',
          visual: 'Scrapes and cuts on forearms, bloody shirt, pacing in panic',
          audio: 'Screaming loudly: "Help me! Look at all this blood on my arms!"',
          vitals: { hr: 94, rr: 24, bp: '130/82 (Normal)', avpu: 'Fully awake' }
        },
        correctTag: 'YEL',
        isVocal: true,
        justification: 'Loud screaming means her airway is wide open! Her bleeding is dark and dripping slowly (not spurting). She can safely wait a few minutes.'
      },
      {
        id: 'C',
        name: 'Person C (Office Guest)',
        telemetry: {
          airway: 'Not breathing at all, even after gently tilting head back',
          resp: '0 (No breathing)',
          circ: 'No pulse felt in neck or wrist',
          neuro: 'Unconscious, completely limp and not moving',
          visual: 'Very heavy head injury from falling metal frame, pupils not reacting',
          audio: 'Complete silence, no sound',
          vitals: { hr: 0, rr: 0, bp: '0/0', avpu: 'Not responding at all' }
        },
        correctTag: 'BLK',
        isVocal: false,
        justification: 'No heartbeat and not breathing at all. Catastrophic head injury that cannot be survived in an emergency drill.'
      }
    ],
    interventions: [
      { label: 'Put a tight tourniquet or hard direct pressure on Person A\'s spurting arm right now', isCorrect: true },
      { label: 'Clean and bandage Person B\'s small cuts first because she is screaming', isCorrect: false },
      { label: 'Start 2 minutes of chest compressions on Person C', isCorrect: false },
      { label: 'Sit Person A up on an office chair', isCorrect: false }
    ]
  },
  {
    id: 2,
    group: "DRILL 2",
    title: "Coffee Machine Fire & Smoke in Breakroom",
    location: "2nd Floor - Staff Kitchen & Break Room",
    facilitySector: "Office Breakroom & Kitchen",
    summary: "An electric coffee heater caught fire on a counter in the office breakroom. The small room quickly filled with thick hot smoke, burning hot water spilled, and workers panicked.",
    officeContext: "Airport Administrative IT Wing - Kitchen & Rest Area Suite 210",
    casualties: [
      {
        id: 'A',
        name: 'Person A (Computer Support Specialist)',
        telemetry: {
          airway: 'Choking, noisy high-pitched breathing, throat closing',
          resp: '36 breaths per minute (Struggling hard to breathe)',
          circ: 'Blue lips and blue fingernails, fast weak pulse (142 beats/min)',
          neuro: 'Drowsy, only opens eyes if you speak loudly',
          visual: 'Black soot on nose and mouth, singed facial hair, holding throat',
          audio: 'Loud whistling and choking sound with every breath',
          vitals: { hr: 142, rr: 36, bp: '88/54 (Low)', avpu: 'Responds only to voice' }
        },
        correctTag: 'RED',
        isVocal: false,
        justification: 'Inhaled hot smoke and toxic air! Throat is swelling shut and lips are turning blue. Immediate danger of suffocating.'
      },
      {
        id: 'B',
        name: 'Person B (Office Supplies Clerk)',
        telemetry: {
          airway: 'Open and clear, speaking loudly',
          resp: '22 breaths per minute',
          circ: 'Strong pulse in wrist, good color',
          neuro: 'Fully awake, walking out of the kitchen',
          visual: 'Red skin and small blisters on hands from hot water spill',
          audio: 'Yelling in panic: "My hands are burning! Where is the cold water?"',
          vitals: { hr: 108, rr: 22, bp: '136/84', avpu: 'Fully awake' }
        },
        correctTag: 'GRN',
        isVocal: true,
        justification: 'Walking wounded. She can walk and talk easily. Minor hot water burn on hands that can be treated later.'
      },
      {
        id: 'C',
        name: 'Person C (Accounting Clerk)',
        telemetry: {
          airway: 'Clear, talking in full sentences',
          resp: '20 breaths per minute',
          circ: 'Normal pulse (86 beats/min)',
          neuro: 'Fully awake and oriented',
          visual: 'Holding right shoulder tightly, deformed collarbone from tripping into a table',
          audio: 'Groaning with shoulder pain when moving, but talking clearly',
          vitals: { hr: 86, rr: 20, bp: '122/76 (Normal)', avpu: 'Fully awake' }
        },
        correctTag: 'YEL',
        isVocal: false,
        justification: 'Broken collarbone / dislocated shoulder. Painful injury that needs medical care, but heart and breathing are completely stable.'
      }
    ],
    interventions: [
      { label: 'Move Person A immediately out into fresh air and help open their breathing airway', isCorrect: true },
      { label: 'Put ice cubes on Person B\'s burned fingers', isCorrect: false },
      { label: 'Try to push Person C\'s broken shoulder back into place', isCorrect: false },
      { label: 'Give Person A cold water to drink right now', isCorrect: false }
    ]
  },
  {
    id: 3,
    group: "DRILL 3",
    title: "Heavy Filing Cabinet Falls in Badging Office",
    location: "Ground Floor - Staff Badging & ID Office",
    facilitySector: "Customer Badging Counters",
    summary: "A tall 4-drawer metal cabinet tipped over during morning badge renewal, falling directly across the employee service desks and crushing workers underneath.",
    officeContext: "Airport Security Badging Center - Counters 1 to 6",
    casualties: [
      {
        id: 'A',
        name: 'Person A (Badging Service Clerk)',
        telemetry: {
          airway: 'Very hard to breathe, chest moving unevenly',
          resp: '34 breaths per minute (Shallow, fast gasping)',
          circ: 'Weak pulse, swollen neck veins, pale skin',
          neuro: 'Nearly unconscious, only groans when pinched',
          visual: 'Right side of ribs crushed under steel cabinet edge, ribs moving opposite to breathing',
          audio: 'Short painful grunts, cannot speak words',
          vitals: { hr: 136, rr: 34, bp: '78/46 (Very low)', avpu: 'Reacts only to pain' }
        },
        correctTag: 'RED',
        isVocal: false,
        justification: 'Crushed chest with punctured lung! Lungs cannot get oxygen and blood pressure is dropping dangerously fast.'
      },
      {
        id: 'B',
        name: 'Person B (Job Applicant)',
        telemetry: {
          airway: 'Open and clear',
          resp: '24 breaths per minute',
          circ: 'Strong pulse in wrist, normal skin color',
          neuro: 'Fully awake, sitting on floor',
          visual: 'Twisted right ankle and small knee scrapes, no heavy bleeding',
          audio: 'Screaming at top of voice: "My ankle! Someone call an ambulance right now!"',
          vitals: { hr: 104, rr: 24, bp: '128/80 (Normal)', avpu: 'Fully awake' }
        },
        correctTag: 'GRN',
        isVocal: true,
        justification: 'Loud screaming, but only has a twisted ankle and knee scrapes. Can hop or walk with help. Minor injury.'
      },
      {
        id: 'C',
        name: 'Person C (Office Supervisor)',
        telemetry: {
          airway: 'Clear, speaking calmly',
          resp: '18 breaths per minute (Normal)',
          circ: 'Steady pulse (82 beats/min), dark blood oozing slowly from leg',
          neuro: 'Fully awake and calm',
          visual: 'Broken lower leg with piece of bone visible through skin; dark blood oozing slowly (no spurting)',
          audio: 'Calm voice: "My leg is broken under the desk, please help me get this off"',
          vitals: { hr: 82, rr: 18, bp: '124/78 (Normal)', avpu: 'Fully awake' }
        },
        correctTag: 'YEL',
        isVocal: false,
        justification: 'Open broken bone in leg. Looks serious and needs hospital surgery, but breathing is normal and bleeding is slow, not arterial.'
      }
    ],
    interventions: [
      { label: 'Lift cabinet weight off Person A and support chest to help breathing right away', isCorrect: true },
      { label: 'Put ice on Person B\'s ankle immediately', isCorrect: false },
      { label: 'Push the broken bone back inside Person C\'s leg wound', isCorrect: false },
      { label: 'Put a tight tourniquet on Person C\'s leg even though blood is not spurting', isCorrect: false }
    ]
  },
  {
    id: 4,
    group: "DRILL 4",
    title: "Electric Spark & Wire Flash in Dispatch Office",
    location: "3rd Floor - Flight Dispatch & Scheduling Office",
    facilitySector: "Operations & Dispatch Office",
    summary: "An electrician working under the office carpet accidentally cut a main electrical line. A loud bright electrical spark flashed under the desks, shocking workers and knocking chairs over.",
    officeContext: "Airport Operations Building - Flight Dispatch Desk 14",
    casualties: [
      {
        id: 'A',
        name: 'Person A (Senior Flight Dispatcher)',
        telemetry: {
          airway: 'Not breathing at all, jaw stiff',
          resp: '0 (Not breathing)',
          circ: 'No pulse felt (Heart has stopped beating from electric shock)',
          neuro: 'Unresponsive, collapsed on carpet beside desk',
          visual: 'Black burn spot on right hand and shoe, eyes closed, not moving',
          audio: 'Zero sound, completely silent',
          vitals: { hr: 0, rr: 0, bp: '0/0', avpu: 'Not responding at all' }
        },
        correctTag: 'RED',
        isVocal: false,
        justification: 'Sudden cardiac arrest from electric shock! Heart just stopped in front of you. Needs CPR chest compressions and AED shock machine right away to save his life.'
      },
      {
        id: 'B',
        name: 'Person B (Shift Coordinator)',
        telemetry: {
          airway: 'Clear, yelling in anger and pain',
          resp: '26 breaths per minute',
          circ: 'Strong pulse in wrist (110 beats/min)',
          neuro: 'Fully awake',
          visual: 'Dislocated shoulder after falling hard off office chair, holding arm',
          audio: 'Yelling loudly: "My shoulder popped out of place! It hurts so much!"',
          vitals: { hr: 110, rr: 26, bp: '138/88', avpu: 'Fully awake' }
        },
        correctTag: 'YEL',
        isVocal: true,
        justification: 'Very painful dislocated shoulder, but heart and breathing are strong. Not in danger of dying right now.'
      },
      {
        id: 'C',
        name: 'Person C (Trainee Assistant)',
        telemetry: {
          airway: 'Clear, talking normally',
          resp: '16 breaths per minute (Normal)',
          circ: 'Normal pulse (76 beats/min)',
          neuro: 'Fully awake and oriented',
          visual: 'Small red burn mark on index finger, sitting safely in chair',
          audio: 'Shaken voice, crying quietly: "I was so scared by the loud bang"',
          vitals: { hr: 76, rr: 16, bp: '118/74 (Normal)', avpu: 'Fully awake' }
        },
        correctTag: 'GRN',
        isVocal: false,
        justification: 'Only a small red mark on finger and nervous fear. Vital signs are completely normal.'
      }
    ],
    interventions: [
      { label: 'Make sure wire power is safe, then start CPR chest compressions and use AED shock machine for Person A', isCorrect: true },
      { label: 'Try to pull Person B\'s arm to fix the dislocated shoulder', isCorrect: false },
      { label: 'Put Person C\'s finger under the cold water tap for 20 minutes', isCorrect: false },
      { label: 'Move Person A onto an office sofa before checking breathing', isCorrect: false }
    ]
  },
  {
    id: 5,
    group: "DRILL 5",
    title: "Rolling File Shelf Traps Worker in Records Room",
    location: "Basement 1 - Employee Records & HR Archive",
    facilitySector: "Office File & Records Archive",
    summary: "A heavy electric rolling file cabinet system closed unexpectedly while office staff were pulling files, crushing workers against metal shelving units.",
    officeContext: "Airport Central Administration Records Archive - Room B-14",
    casualties: [
      {
        id: 'A',
        name: 'Person A (HR Records Officer)',
        telemetry: {
          airway: 'Weak breathing, moaning quietly',
          resp: '32 breaths per minute (Fast, shallow)',
          circ: 'Very weak rapid pulse (144 beats/min), very cold and sweaty skin',
          neuro: 'Drowsy, only answers with faint groans',
          visual: 'Crushed tightly across hips and stomach by heavy shelf, pale gray face, shivering',
          audio: 'Faint quiet moaning: "I feel so cold... please help me..."',
          vitals: { hr: 144, rr: 32, bp: '72/42 (Dangerously low)', avpu: 'Responds only to voice' }
        },
        correctTag: 'RED',
        isVocal: false,
        justification: 'Crushed hips with heavy internal bleeding inside the body. Heart is beating super fast and blood pressure is crashing. In life-threatening shock!'
      },
      {
        id: 'B',
        name: 'Person B (Archive Supervisor)',
        telemetry: {
          airway: 'Clear, shouting loudly',
          resp: '24 breaths per minute',
          circ: 'Strong pulse in wrist (112 beats/min)',
          neuro: 'Fully awake',
          visual: 'Deep cut on forearm with dark blood dripping, broken forearm bone',
          audio: 'Shouting loudly: "Turn the shelf off! My arm is broken and bleeding!"',
          vitals: { hr: 112, rr: 24, bp: '132/84 (Normal)', avpu: 'Fully awake' }
        },
        correctTag: 'YEL',
        isVocal: true,
        justification: 'Broken arm and deep cut, but blood is only dripping and he is shouting loudly. Vital signs are stable.'
      },
      {
        id: 'C',
        name: 'Person C (Archive Helper)',
        telemetry: {
          airway: 'Clear, talking',
          resp: '18 breaths per minute (Normal)',
          circ: 'Normal pulse (80 beats/min)',
          neuro: 'A bit confused, asks: "What happened? Where did the files go?"',
          visual: 'Small bump and scratch on forehead from falling books, sitting on floor',
          audio: 'Confused voice, repeating the same question twice',
          vitals: { hr: 80, rr: 18, bp: '120/78 (Normal)', avpu: 'A bit confused' }
        },
        correctTag: 'YEL',
        isVocal: false,
        justification: 'Bumped head with mild confusion. Needs to be watched for head injury, but breathing and pulse are normal.'
      }
    ],
    interventions: [
      { label: 'Wrap Person A\'s hips tightly with a jacket/binder, keep warm with blankets, and call emergency medics right now', isCorrect: true },
      { label: 'Bandage Person C\'s small forehead scratch and let them walk upstairs alone', isCorrect: false },
      { label: 'Lift Person A\'s legs up high without supporting their broken hips', isCorrect: false },
      { label: 'Take Person B to the bathroom to wash their arm with soap', isCorrect: false }
    ]
  }
];
