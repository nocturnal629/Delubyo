import { StoryNode, Ending, EndingType } from '../models/types';

export const CHARACTER_MAYA = 'maya';
export const CHARACTER_PLAYER = 'player';
export const CHARACTER_SYSTEM = 'system';

export const storyNodes: StoryNode[] = [

{
  id: 'prologue_1',
  character: CHARACTER_SYSTEM,
  text: "You are a researcher working with Dr. Maya Avarelo at Batanes Climate Station. A typhoon is approaching the island...",
  delay: 3500,
  activityMessage: "Two days before the typhoon...",
  followupMessages: [
    {
      text: "Research Log: Day 37 at Batanes Climate Station. The weather service issued a typhoon alert this morning.",
      delay: 3500,
      character: CHARACTER_MAYA
    },
    {
      text: "Typhoon Mani is predicted to make landfall in 48 hours. Most of the team is preparing to evacuate tomorrow morning.",
      delay: 3500,
      character: CHARACTER_MAYA
    },
    {
      text: "Dr. Solon wants me to evacuate with them, but I'm hesitant.",
      delay: 2000,
      character: CHARACTER_MAYA
    },
    {
      text: "We've been collecting climate data for months, and the backup system isn't reliable.",
      delay: 2000,
      character: CHARACTER_MAYA
    },
    {
      text: "If the power goes out for too long, we could lose everything. This research could help coastal communities prepare for future storms.",
      delay: 3500,
      character: CHARACTER_MAYA
    },
    {
      text: "The weather service classifies Mani as only Signal no. 1. I've weathered storms like this before.",
      delay: 2500,
      character: CHARACTER_MAYA
    }
  ],
  choices: [
    {
      id: 'choice_prologue_1',
      text: "You should consider your safety first. What exactly is this research about?",
      nextNodeId: 'prologue_2'
    }
  ]
},

{
  id: 'prologue_2',
  character: CHARACTER_MAYA,
  text: "We're studying how climate change is affecting typhoon patterns in the Philippine Sea.",
  delay: 2500,
  followupMessages: [
    {
      text: "Our monitoring equipment captures real-time data on sea temperatures, pressure systems, and wind patterns.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "We've documented a disturbing trend of rapid intensification that traditional models haven't accounted for.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "The team is packing up now. Dr. Solon just reminded me that the evacuation transport leaves at 7 AM.",
      delay: 2000,
      character: CHARACTER_MAYA
    },
    {
      text: "I need to decide tonight: leave with them or stay with the equipment. The director said it's my call since I designed the monitoring system.",
      delay: 2500,
      character: CHARACTER_MAYA
    }
  ],
  choices: [
    {
      id: 'choice_prologue_2',
      text: "This sounds important, but your life is irreplaceable. What safety measures are in place if you stay?",
      nextNodeId: 'prologue_3'
    }
  ]
},

{
  id: 'prologue_3',
  character: CHARACTER_MAYA,
  text: "The station has weathered Signal no. 2 storms before without major damage.",
  delay: 2000,
  followupMessages: [
    {
      text: "We have a reinforced storage bunker built into the hillside, emergency supplies for a week, and a generator with fuel.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "There's also an emergency transmitter and radio for communications if the main systems go down.",
      delay: 2000,
      character: CHARACTER_MAYA
    },
    {
      text: "I'd just need to secure loose equipment, download the data every few hours, and wait it out.",
      delay: 2000,
      character: CHARACTER_MAYA
    },
    {
      text: "Dr. Solon thinks I'm being foolish, but he doesn't understand how crucial this data is.",
      delay: 2000,
      character: CHARACTER_MAYA
    },
    {
      text: "Their evacuation will take them so far away that coming back quickly won't be an option.",
      delay: 2000,
      character: CHARACTER_MAYA
    }
  ],
  choices: [
    {
      id: 'choice_prologue_3_1',
      text: "I think you should evacuate. The data isn't worth risking your life.",
      nextNodeId: 'prologue_evacuation'
    },
    {
      id: 'choice_prologue_3_2',
      text: "If you're determined to stay, make sure you have multiple backup plans for safety.",
      nextNodeId: 'prologue_staying'
    }
  ]
},

{
  id: 'prologue_evacuation',
  character: CHARACTER_MAYA,
  text: "You're probably right... let me think about it overnight.",
  delay: 2000,
  waitTime: 300000,
  activityMessage: "The night before evacuation...",
  followupMessages: [
    {
      text: "[The next morning]",
      delay: 1500,
      character: CHARACTER_SYSTEM
    },
    {
      text: "I've decided to evacuate with the team. Dr. Solon was relieved when I told him.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "I've set up the automated backup system and secured everything as best I can.",
      delay: 2000,
      character: CHARACTER_MAYA
    },
    {
      text: "Wait... the latest weather update just came in. Mani has been downgraded to a tropical storm!",
      delay: 2000,
      character: CHARACTER_MAYA
    },
    {
      text: "They're saying it might dissipate before making landfall.",
      delay: 1500,
      character: CHARACTER_MAYA
    },
    {
      text: "This changes things. If I leave, I'll be abandoning weeks of potential data collection for nothing.",
      delay: 2500,
      character: CHARACTER_MAYA
    }
  ],
  choices: [
    {
      id: 'choice_evacuation_reconsider_1',
      text: "Weather forecasts can change rapidly. Stick with your evacuation plan.",
      nextNodeId: 'evacuation_confirmed'
    },
    {
      id: 'choice_evacuation_reconsider_2',
      text: "If you're confident in your safety measures, staying might be reasonable now.",
      nextNodeId: 'evacuation_reversed'
    }
  ]
},

{
  id: 'evacuation_confirmed',
  character: CHARACTER_MAYA,
  text: "You're right. I've seen storms strengthen unexpectedly before.",
  delay: 2000,
  waitTime: 600000,
  activityMessage: "Maya is evacuating with her team...",
  followupMessages: [
    {
      text: "We've evacuated to Manila. The transport was bumpy but we made it safely.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "I'm watching the weather reports closely... Mani has suddenly intensified again! It's back to Signal no. 1 and still strengthening.",
      delay: 3000,
      character: CHARACTER_MAYA
    },
    {
      text: "I'm thankful we evacuated. The latest satellite images show it heading directly for Batanes.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "[36 hours later]",
      delay: 1500,
      character: CHARACTER_SYSTEM
    },
    {
      text: "Mani hit as a Signal no. 4 storm. The monitoring station has gone completely offline. Reports say the damage is catastrophic.",
      delay: 3000,
      character: CHARACTER_SYSTEM
    },
    {
      text: "If I'd stayed... I likely wouldn't have survived. Thank you for your advice.",
      delay: 2500,
      character: CHARACTER_MAYA
    }
  ],
  choices: [
    {
      id: 'choice_evacuation_confirmed',
      text: "You made the right decision. Equipment can be replaced, but your life cannot.",
      nextNodeId: 'evacuation_epilogue'
    }
  ]
},

{
  id: 'evacuation_epilogue',
  character: CHARACTER_MAYA,
  text: "You're right. And surprisingly, some of our remote sensors continued transmitting through the worst of the storm.",
  delay: 2000,
  followupMessages: [
    {
      text: "The data we managed to collect remotely is still valuable - it shows how the storm intensified so rapidly.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "We're already planning a more resilient monitoring system for the future. One that can be fully operated remotely.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "Dr. Solon told me there's a lesson here about scientific persistence that doesn't require martyrdom.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "I'll carry that wisdom with me throughout my career. Sometimes the bravest decision is walking away.",
      delay: 2000,
      character: CHARACTER_MAYA
    }
  ],
  choices: []
},

{
  id: 'evacuation_reversed',
  character: CHARACTER_MAYA,
  text: "I think I will stay. The forecasts show the storm continuing to weaken.",
  delay: 2000,
  waitTime: 360000,
  activityMessage: "Maya is preparing to stay alone...",
  followupMessages: [
    {
      text: "Dr. Solon wasn't happy, but he respects my decision. The team has just left.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "I've doubled-checked all my emergency supplies and communication equipment.",
      delay: 2000,
      character: CHARACTER_MAYA
    },
    {
      text: "I'll keep monitoring the weather updates and—",
      delay: 1500,
      character: CHARACTER_MAYA
    },
    {
      text: "[24 hours later]",
      delay: 3000,
      character: CHARACTER_SYSTEM
    },
    {
      text: "The weather has changed dramatically. Mani has intensified to Signal no. 3 and is still strengthening.",
      delay: 3500,
      character: CHARACTER_SYSTEM
    },
    {
      text: "I've tried calling for emergency evacuation, but they've suspended all transport to the area. I'm on my own now.",
      delay: 2500,
      character: CHARACTER_MAYA
    }
  ],
  choices: [
    {
      id: 'choice_evacuation_reversed',
      text: "Focus on survival now. Secure what you can and prepare for the worst.",
      nextNodeId: 'intro_1'
    }
  ]
},

{
  id: 'prologue_staying',
  character: CHARACTER_MAYA,
  text: "I appreciate your understanding. I know this is a risk, but it's a calculated one.",
  delay: 2000,
  activityMessage: "Maya is preparing contingency plans...",
  followupMessages: [
    {
      text: "I've mapped out three potential shelter locations in the facility depending on how the storm develops.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "I've also set up hourly data backups to our cloud server as long as the connection holds.",
      delay: 2000,
      character: CHARACTER_MAYA
    },
    {
      text: "The team has just left. Dr. Solon looked worried, but he knows how important this research is.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "I've promised to maintain regular contact with headquarters throughout the storm.",
      delay: 2000,
      character: CHARACTER_MAYA
    },
    {
      text: "[30 hours later]",
      delay: 1500,
      character: CHARACTER_SYSTEM
    },
    {
      text: "The situation has changed rapidly. Mani has intensified to Signal no. 3 and is still strengthening. Forecasters now predict it could get stronger.",
      delay: 3500,
      character: CHARACTER_SYSTEM
    },
    {
      text: "I've tried arranging emergency evacuation, but all transport to the area has been suspended. I'm committed now.",
      delay: 2500,
      character: CHARACTER_MAYA
    }
  ],
  choices: [
    {
      id: 'choice_prologue_staying',
      text: "Focus on your survival plan now. Secure what you can and prepare for the worst.",
      nextNodeId: 'intro_1'
    }
  ]
},

{
  id: 'intro_1',
  character: CHARACTER_SYSTEM,
  text: "You've received an emergency signal on an old frequency channel. Someone appears to be broadcasting from the Batanes Climate Station...",
  delay: 2500,
  followupMessages: [
    {
      text: "Hello? Is anyone there?",
      delay: 2000,
      character: CHARACTER_MAYA
    },
    {
      text: "This is Maya Avarelo from Paraiso Climate Research. Our station in Batanes was hit by Typhoon Mani.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "It was only Signal no. 1 when I decided to stay behind... now it's a Signal no. 5.",
      delay: 1500,
      character: CHARACTER_MAYA
    },
    {
      text: "The main comm tower is down but I found this old emergency transmitter.",
      delay: 1500,
      character: CHARACTER_MAYA
    },
    {
      text: "Please, if you can hear this, respond!",
      delay: 2000,
      character: CHARACTER_MAYA
    }
  ],
  choices: [
    {
      id: 'choice_intro_1',
      text: "I'm receiving you. What's your situation?",
      nextNodeId: 'intro_2'
    }
  ]
},

{
  id: 'intro_2',
  character: CHARACTER_MAYA,
  text: "Thank God! I thought no one would hear me!",
  delay: 1000,
  followupMessages: [
    {
      text: "I'm in what's left of the research station. Half the roof is gone, and our equipment is wrecked.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "My colleagues evacuated two days ago, but I stayed for our climate data. The roads are completely flooded, power lines down everywhere...",
      delay: 3000,
      character: CHARACTER_MAYA
    },
    {
      text: "Wait. I'm hearing something concerning.",
      delay: 2000,
      character: CHARACTER_MAYA
    },
    {
      text: "There's a deep rumbling sound coming from the mountain. The ground is vibrating beneath me. I think the mountainside might be unstable.",
      delay: 2500,
      character: CHARACTER_MAYA
    }
  ],
  choices: [
    {
      id: 'choice_intro_2_1',
      text: "Focus on your immediate safety. What supplies do you have?",
      nextNodeId: 'intro_3'
    },
    {
      id: 'choice_intro_2_2',
      text: "You need to leave that area immediately if possible.",
      nextNodeId: 'intro_4'
    }
  ],
  aiPrompt: "Generate a response describing a researcher's situation after a typhoon hit their remote station in Batanes, Philippines. Include details about damaged infrastructure and strange, ominous sounds."
},

{
  id: 'intro_3',
  character: CHARACTER_MAYA,
  text: "I'm scratched up but okay physically.",
  delay: 1500,
  waitTime: 300000,
  activityMessage: "Maya is gathering her supplies...",
  followupMessages: [
    {
      text: "I've got about 2 liters of water, canned food for maybe 2 days, a first aid kit, and a flashlight with extra batteries.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "The emergency radio works but it's just static. This transmitter is on battery backup that won't last long.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "The wind's getting worse...",
      delay: 1500,
      character: CHARACTER_MAYA
    },
    {
      text: "The vibrations from the mountain are getting stronger. I think there might be a landslide forming.",
      delay: 2500,
      character: CHARACTER_MAYA
    }
  ],
  choices: [
    {
      id: 'choice_intro_3',
      text: "You need to find the safest shelter immediately. The typhoon isn't over.",
      nextNodeId: 'shelter_1'
    }
  ]
},

{
  id: 'intro_4',
  character: CHARACTER_MAYA,
  text: "I've tried!",
  delay: 1000,
  waitTime: 240000,
  activityMessage: "Maya is attempting to find a way out...",
  followupMessages: [
    {
      text: "The main road is completely washed out. I almost got swept away when I attempted to leave an hour ago.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "The emergency radio said the eye of the storm just passed over us. The second half is coming, and it'll be worse.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "The vibrations from the mountain are getting stronger. I think the soil is saturated - there could be a landslide any minute.",
      delay: 3000,
      character: CHARACTER_MAYA
    },
    {
      text: "I need better shelter now.",
      delay: 1500,
      character: CHARACTER_MAYA
    }
  ],
  choices: [
    {
      id: 'choice_intro_4',
      text: "You're right. Focus on finding the safest place in the station.",
      nextNodeId: 'shelter_1'
    }
  ]
},

{
  id: 'shelter_1',
  character: CHARACTER_MAYA,
  text: "There are three areas that are still somewhat intact.",
  delay: 2000,
  waitTime: 180000,
  activityMessage: "Maya is examining shelter options...",
  followupMessages: [
    {
      text: "The main lab has the strongest walls but large windows that could shatter.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "The storage bunker is underground but its entrance is already flooding.",
      delay: 2000,
      character: CHARACTER_MAYA
    },
    {
      text: "The equipment shed is on higher ground but it's the flimsiest structure.",
      delay: 2000,
      character: CHARACTER_MAYA
    },
    {
      text: "I'm not sure which is safest... what do you think?",
      delay: 1500,
      character: CHARACTER_MAYA
    }
  ],
  choices: [
    {
      id: 'choice_shelter_1',
      text: "Choose the storage bunker. You need to prioritize protection from potential landslides.",
      nextNodeId: 'shelter_2a'
    },
    {
      id: 'choice_shelter_2',
      text: "The lab is your best bet. You can barricade the windows and have better resources.",
      nextNodeId: 'shelter_2b'
    },
    {
      id: 'choice_shelter_3',
      text: "Head for the equipment shed. Higher ground is crucial if there's flooding and landslides.",
      nextNodeId: 'shelter_2c'
    }
  ]
},

{
  id: 'shelter_2a',
  character: CHARACTER_MAYA,
  text: "I'm heading to the bunker now.",
  delay: 5000,
  waitTime: 600000,
  activityMessage: "Maya is making her way to the bunker...",
  followupMessages: [
    {
      text: "I made it to the bunker. The water's already ankle-deep at the entrance and rising, but the main room is still dry.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "It's pretty claustrophobic down here.",
      delay: 1500,
      character: CHARACTER_MAYA
    },
    {
      text: "The concrete walls should protect me from a landslide, but there's only one way out if it floods.",
      delay: 2000,
      character: CHARACTER_MAYA
    },
    {
      text: "I found a hand-crank radio down here. I can't hear the mountain as clearly in here, but I can feel vibrations through the floor.",
      delay: 2500,
      character: CHARACTER_MAYA
    }
  ],
  effect: (state) => ({
    ...state,
    location: 'storage bunker',
    inventory: [...state.inventory, 'hand-crank radio'],
    flags: { ...state.flags, madeRiskyChoice: true }
  }),
  choices: [
    {
      id: 'choice_shelter_2a',
      text: "Find something to block the entrance to slow the flooding, but don't seal yourself in completely.",
      nextNodeId: 'shelter_3a'
    }
  ]
},

{
  id: 'shelter_2b',
  character: CHARACTER_MAYA,
  text: "I'm heading to the lab now.",
  delay: 2000,
  waitTime: 480000,
  activityMessage: "Maya is moving to the lab...",
  followupMessages: [
    {
      text: "I'm in the lab now. I've pushed cabinets against the windows and covered them with plywood.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "The building is creaking but holding. I found some emergency MREs and water purification tablets.",
      delay: 2000,
      character: CHARACTER_MAYA
    },
    {
      text: "It's so loud in here - the wind and rain are hammering the building, and there's a constant rumbling sound from the mountain.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "The doppler radar's still working and shows the entire mountainside might be unstable. I don't like what I'm seeing on the display.",
      delay: 3000,
      character: CHARACTER_MAYA
    }
  ],
  effect: (state) => ({
    ...state,
    location: 'lab',
    inventory: [...state.inventory, 'MREs', 'water purification tablets', 'doppler data'],
    flags: { ...state.flags, hasValuableData: true }
  }),
  choices: [
    {
      id: 'choice_shelter_2b',
      text: "Download the radar data and prepare to move if necessary. That data could save lives.",
      nextNodeId: 'shelter_3b'
    }
  ]
},

{
  id: 'shelter_2c',
  character: CHARACTER_MAYA,
  text: "I'll try to reach the equipment shed on the ridge!",
  delay: 1500,
  waitTime: 720000,
  activityMessage: "Maya is climbing to the equipment shed...",
  followupMessages: [
    {
      text: "I've made it to the equipment shed! I'm completely out of breath. The wind nearly knocked me off my feet twice on the way up here.",
      delay: 3000,
      character: CHARACTER_MAYA
    },
    {
      text: "It's pretty flimsy, but I can see the whole area from here. The flooding is spreading below...",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "Oh God. I can see the entire mountainside starting to slide.",
      delay: 1000,
      character: CHARACTER_MAYA
    },
    {
      text: "Mud and rocks are beginning to move. It's slow now, but picking up speed. The main station buildings are directly in its path.",
      delay: 3000,
      character: CHARACTER_MAYA
    },
    {
      text: "The shed is shaking in the wind, but at least I'm out of the landslide's way.",
      delay: 2000,
      character: CHARACTER_MAYA
    }
  ],
  effect: (state) => ({
    ...state,
    location: 'equipment shed',
    inventory: [...state.inventory, 'binoculars'],
    flags: { ...state.flags, hasEarlyWarning: true }
  }),
  choices: [
    {
      id: 'choice_shelter_2c',
      text: "Secure yourself as best you can. You made the right choice to avoid the landslide.",
      nextNodeId: 'shelter_3c'
    }
  ]
},

{
  id: 'shelter_3a',
  character: CHARACTER_MAYA,
  text: "I'm looking for materials to block the entrance...",
  delay: 2000,
  waitTime: 900000,
  activityMessage: "Maya is gathering materials for protection...",
  followupMessages: [
    {
      text: "I used a plastic tarp and some crates to create a barrier at the entrance. It's slowing the water, but not stopping it.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "The water's up to my knees now.",
      delay: 1500,
      character: CHARACTER_MAYA
    },
    {
      text: "The radio says the typhoon has triggered multiple landslides across the region.",
      delay: 2000,
      character: CHARACTER_MAYA
    },
    {
      text: "I just felt a massive vibration and there's a sound like thunder overhead. I think a landslide just hit somewhere above us.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "The ceiling is starting to crack... water and mud are seeping through.",
      delay: 2000,
      character: CHARACTER_MAYA
    }
  ],
  effect: (state) => ({
    ...state,
    flags: { ...state.flags, inImmediateDanger: true }
  }),
  choices: [
    {
      id: 'choice_shelter_3a_1',
      text: "You need to leave now! The bunker might collapse or completely flood.",
      nextNodeId: 'escape_bunker'
    },
    {
      id: 'choice_shelter_3a_2',
      text: "Find the highest spot in the bunker. Leaving now might put you directly in the landslide's path.",
      nextNodeId: 'bunker_collapse'
    }
  ]
},

{
  id: 'escape_bunker',
  character: CHARACTER_MAYA,
  text: "I'm fighting through the water to get out!",
  delay: 1500,
  waitTime: 600000,
  activityMessage: "Maya is struggling to escape the flooding bunker...",
  followupMessages: [
    {
      text: "It's up to my waist and the current is strong! The entrance is partially blocked by debris.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "There are loud crashes above me - the landslide is getting worse. Almost to the entrance...",
      delay: 2000,
      character: CHARACTER_MAYA
    },
    {
      text: "The ceiling's collapsing! Mud is pouring in everywhere!",
      delay: 1500,
      character: CHARACTER_MAYA
    },
    {
      text: "I'm swimming... made it through the gap!",
      delay: 2000,
      character: CHARACTER_MAYA
    },
    {
      text: "I'm outside, soaked but alive. The main buildings are gone - buried under mud. The equipment shed is still standing though.",
      delay: 2500,
      character: CHARACTER_MAYA
    }
  ],
  effect: (state) => ({
    ...state,
    location: 'outside',
    health: 80,
    flags: { ...state.flags, narrowEscape: true }
  }),
  choices: [
    {
      id: 'choice_escape_bunker',
      text: "Head for the equipment shed immediately. It's your only option now.",
      nextNodeId: 'reach_shed_injured'
    }
  ]
},

{
  id: 'bunker_collapse',
  character: CHARACTER_MAYA,
  text: "I'm climbing onto a storage shelf to escape the water.",
  delay: 2000,
  followupMessages: [
    {
      text: "The rumbling is getting louder and...",
      delay: 1500,
      character: CHARACTER_MAYA
    },
    {
      text: "[Transmission cuts out]",
      delay: 7000,
      character: CHARACTER_SYSTEM
    },
    {
      text: "...can you hear me? The ceiling collapsed. I'm trapped in a pocket of air.",
      delay: 4500,
      character: CHARACTER_MAYA
    },
    {
      text: "I can't move my right leg - it's pinned under something. The water keeps rising.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "As I wait here, I keep thinking about my grandfather. He was a fisherman who died in a typhoon when I was ten.",
      delay: 3000,
      character: CHARACTER_MAYA
    },
    {
      text: "He always said the sea and sky demand respect. I should have listened.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "I don't think I'm going to make it out. If anyone finds this transmission, please tell my family I love them.",
      delay: 3500,
      character: CHARACTER_MAYA
    },
    {
      text: "I should have evacuated when I had the chance.",
      delay: 1500,
      character: CHARACTER_MAYA
    }
  ],
  effect: (state) => ({
    ...state,
    health: 30,
    flags: { ...state.flags, trapped: true, criticallyInjured: true }
  }),
  choices: [
    {
      id: 'choice_bunker_collapse',
      text: "Stay calm and conserve energy. Try to find anything that can help free your leg.",
      nextNodeId: 'ending_bad'
    }
  ]
},

{
  id: 'shelter_3b',
  character: CHARACTER_MAYA,
  text: "I'm copying the radar data to a portable drive.",
  delay: 2000,
  waitTime: 900000,
  activityMessage: "Maya is backing up critical research data...",
  followupMessages: [
    {
      text: "The images are frightening - the entire hillside is unstable. I can see the landslide developing in real-time on the radar.",
      delay: 3500,
      character: CHARACTER_MAYA
    },
    {
      text: "According to these readings, we have maybe 20 minutes before it hits the station. The lab is directly in its path.",
      delay: 3000,
      character: CHARACTER_MAYA
    },
    {
      text: "I've packed essential supplies in a waterproof backpack.",
      delay: 2000,
      character: CHARACTER_MAYA
    },
    {
      text: "The wind sounds like a freight train, but I think the landslide is the bigger threat right now.",
      delay: 3000,
      character: CHARACTER_MAYA
    }
  ],
  choices: [
    {
      id: 'choice_shelter_3b_1',
      text: "You need to evacuate to the equipment shed on the ridge immediately.",
      nextNodeId: 'race_to_shed'
    },
    {
      id: 'choice_shelter_3b_2',
      text: "Stay put. The lab is the strongest structure and leaving means exposing yourself to the storm.",
      nextNodeId: 'lab_destruction'
    }
  ]
},

{
  id: 'race_to_shed',
  character: CHARACTER_MAYA,
  text: "I'm going to try to reach the shed!",
  delay: 2000,
  waitTime: 1200000,
  activityMessage: "Maya is racing against time to reach the shed...",
  followupMessages: [
    {
      text: "The wind is incredible - I can barely stand! The rain feels like needles against my skin.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "I can see the landslide starting - trees falling as the mud flows down. It's gaining speed.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "I'm running as fast as I can up the ridge path. The noise is deafening.",
      delay: 2000,
      character: CHARACTER_MAYA
    },
    {
      text: "Made it to the shed!",
      delay: 1500,
      character: CHARACTER_MAYA
    },
    {
      text: "From here I can see the landslide hitting the main station. My God... the buildings are just gone. If I'd stayed even two more minutes...",
      delay: 3500,
      character: CHARACTER_MAYA
    }
  ],
  effect: (state) => ({
    ...state,
    location: 'equipment shed',
    health: 85,
    flags: { ...state.flags, hasCriticalData: true, narrowEscape: true }
  }),
  choices: [
    {
      id: 'choice_race_to_shed',
      text: "Secure yourself in the shed. That was incredibly close.",
      nextNodeId: 'night_in_shed'
    }
  ]
},

{
  id: 'lab_destruction',
  character: CHARACTER_MAYA,
  text: "I've decided to stay in the lab. The reinforced walls should be safer than risking the storm outside.",
  delay: 2500,
  followupMessages: [
    {
      text: "I can track the landslide on the radar, but... wait, it's moving faster than predicted.",
      delay: 2000,
      character: CHARACTER_MAYA
    },
    {
      text: "I can hear the landslide approaching - it's getting louder. The building is starting to shake.",
      delay: 2000,
      character: CHARACTER_MAYA
    },
    {
      text: "The windows are breaking! Mud and rocks are coming through!",
      delay: 1500,
      character: CHARACTER_MAYA
    },
    {
      text: "I'm thinking of my mother now. She always worried about my fieldwork. 'Nature doesn't care about your research deadlines,' she'd say.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "She was right. I should have listened.",
      delay: 2000,
      character: CHARACTER_MAYA
    },
    {
      text: "I need to...",
      delay: 1500,
      character: CHARACTER_MAYA
    },
    {
      text: "[Transmission cuts out]",
      delay: 2000,
      character: CHARACTER_SYSTEM
    }
  ],
  effect: (state) => ({
    ...state,
    health: 20,
    flags: { ...state.flags, criticallyInjured: true, trapped: true }
  }),
  choices: [
    {
      id: 'choice_lab_destruction',
      text: "Maya! Can you hear me? Try to respond!",
      nextNodeId: 'ending_bad'
    }
  ]
},

{
  id: 'shelter_3c',
  character: CHARACTER_MAYA,
  text: "I'm looking for something to secure myself with...",
  delay: 2000,
  waitTime: 900000,
  activityMessage: "Maya is securing herself in the equipment shed...",
  followupMessages: [
    {
      text: "I've tied myself to one of the structural beams with some cable. The shed is creaking and swaying, but it's holding.",
      delay: 3500,
      character: CHARACTER_MAYA
    },
    {
      text: "The view is both terrifying and mesmerizing. I can see the landslide picking up speed, taking trees with it.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "It just hit the main station buildings - they disappeared in seconds. The bunker entrance is completely buried.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "I would have died there.",
      delay: 1500,
      character: CHARACTER_MAYA
    },
    {
      text: "The rain is hammering the metal roof so hard I can barely think.",
      delay: 2000,
      character: CHARACTER_MAYA
    }
  ],
  choices: [
    {
      id: 'choice_shelter_3c',
      text: "You made the right choice. Use anything available to reinforce your shelter for the night.",
      nextNodeId: 'night_in_shed'
    }
  ]
},

{
  id: 'reach_shed_injured',
  character: CHARACTER_MAYA,
  text: "I'm trying to make it up to the shed...",
  delay: 2000,
  waitTime: 900000,
  activityMessage: "Maya is struggling uphill with her injuries...",
  followupMessages: [
    {
      text: "I made it to the shed, but I'm hurt. My left arm is badly cut, and I think I might have a broken rib.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "Every breath hurts.",
      delay: 1000,
      character: CHARACTER_MAYA
    },
    {
      text: "The shed is barely standing, but at least it's above the landslide area. I found a first aid kit and bandaged my arm.",
      delay: 3000,
      character: CHARACTER_MAYA
    },
    {
      text: "Through the window I can see nothing but darkness and rain, with occasional lightning showing the devastation.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "Everything below is gone - buried under mud and debris.",
      delay: 2000,
      character: CHARACTER_MAYA
    }
  ],
  effect: (state) => ({
    ...state,
    location: 'equipment shed',
    health: 60,
    flags: { ...state.flags, isInjured: true }
  }),
  choices: [
    {
      id: 'choice_reach_shed_injured',
      text: "Tend to your injuries as best you can and secure yourself for the night. You've survived the worst.",
      nextNodeId: 'night_in_shed_injured'
    }
  ]
},

{
  id: 'night_check_1',
  character: CHARACTER_MAYA,
  text: "It's been a few hours. The wind is still howling, but the shed is holding.",
  delay: 2500,
  waitTime: 3600000,
  activityMessage: "Maya is checking the roof integrity...",
  followupMessages: [
    {
      text: "I've had to reinforce part of the roof that started leaking. Used some plastic sheeting and tape from a supply box.",
      delay: 3000,
      character: CHARACTER_MAYA
    },
    {
      text: "The temperature is dropping. I'm wrapped in all the clothing I could find, but I'm still shivering.",
      delay: 2000,
      character: CHARACTER_MAYA
    },
    {
      text: "The landslides seem to have stopped, but there's so much water running down the mountain. I can hear it gushing past the shed.",
      delay: 3500,
      character: CHARACTER_MAYA
    },
    {
      text: "I should try to rest more, but it's hard with the noise and cold.",
      delay: 2000,
      character: CHARACTER_MAYA
    }
  ],
  choices: [
    {
      id: 'choice_night_check_1',
      text: "You're doing well. Try to conserve your body heat and energy for the morning.",
      nextNodeId: 'night_check_2'
    }
  ]
},

{
  id: 'night_check_2',
  character: CHARACTER_MAYA,
  text: "I managed to doze off for a bit, but something woke me up.",
  delay: 2000,
  waitTime: 3600000,
  activityMessage: "Maya is investigating strange sounds...",
  followupMessages: [
    {
      text: "I heard something moving outside. Could be debris, animals, or... I hope it's not another landslide forming.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "I'm using the flashlight to check through the window, but can't see much through the rain.",
      delay: 2000,
      character: CHARACTER_MAYA
    },
    {
      text: "There it is again! It's... it's a group of monkeys seeking shelter! They must have been displaced by the landslides.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "They're huddled under the shed's small overhang. Poor creatures - they look as miserable as I feel.",
      delay: 2500,
      character: CHARACTER_MAYA
    }
  ],
  choices: [
    {
      id: 'choice_night_check_2',
      text: "Leave them be. They're just trying to survive too. Try to get more rest now.",
      nextNodeId: 'night_in_shed'
    }
  ]
},

{
  id: 'night_in_shed',
  character: CHARACTER_MAYA,
  text: "The storm is still raging outside. I've done what I can to secure the shed.",
  delay: 2500,
  waitTime: 14400000,
  activityMessage: "Maya is trying to rest for a few hours...",
  followupMessages: [
    {
      text: "It's been hours now. The storm is still raging but the worst of the landslides seem to have passed.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "Parts of the roof have torn away. I'm soaked and freezing. Found an emergency blanket that's helping a little.",
      delay: 3000,
      character: CHARACTER_MAYA
    },
    {
      text: "The transmitter battery is getting low - need to conserve it.",
      delay: 2000,
      character: CHARACTER_MAYA
    },
    {
      text: "Radio says rescue operations won't start until the typhoon passes completely, maybe another 10-12 hours.",
      delay: 3000,
      character: CHARACTER_MAYA
    },
    {
      text: "I've never felt so alone, knowing everything below me is gone.",
      delay: 2000,
      character: CHARACTER_MAYA
    }
  ],
  choices: [
    {
      id: 'choice_night_in_shed',
      text: "Try to rest. You'll need your strength tomorrow. Keep the transmitter off except for hourly check-ins.",
      nextNodeId: 'morning_shed'
    }
  ]
},

{
  id: 'night_in_shed_injured',
  character: CHARACTER_MAYA,
  text: "I'm trying to make myself comfortable, but it's not easy with these injuries.",
  delay: 2500,
  waitTime: 7200000,
  activityMessage: "Maya is struggling through the night...",
  followupMessages: [
    {
      text: "This night feels endless. My injuries make it impossible to sleep.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "My ribs hurt with every breath, and my arm is throbbing. I'm worried about infection - the cut is deep and I didn't have much to clean it with.",
      delay: 4000,
      character: CHARACTER_MAYA
    },
    {
      text: "I can't stop shivering - from cold, pain, or shock, I don't know.",
      delay: 2000,
      character: CHARACTER_MAYA
    },
    {
      text: "To keep my mind off the pain, I'm thinking about why I became a climate researcher.",
      delay: 2000,
      character: CHARACTER_MAYA
    },
    {
      text: "My hometown was hit by three major typhoons in two years when I was a teenager.",
      delay: 2000,
      character: CHARACTER_MAYA
    },
    {
      text: "I wanted to understand why storms were getting worse, to help communities prepare. Now I'm the one who wasn't prepared.",
      delay: 3500,
      character: CHARACTER_MAYA
    },
    {
      text: "The storm seems to be weakening, but the wind still threatens to tear this shed apart.",
      delay: 2000,
      character: CHARACTER_MAYA
    },
    {
      text: "I keep thinking about how close I came to dying in that bunker.",
      delay: 2000,
      character: CHARACTER_MAYA
    }
  ],
  effect: (state) => ({
    ...state,
    health: state.health - 10,
    flags: { ...state.flags, feverish: true }
  }),
  choices: [
    {
      id: 'choice_night_in_shed_injured',
      text: "Focus on your breathing to manage the pain. You need to stay awake and monitor your condition.",
      nextNodeId: 'morning_shed_injured'
    }
  ]
},

{
  id: 'morning_shed',
  character: CHARACTER_MAYA,
  text: "I think I finally see some light...",
  delay: 1500,
  followupMessages: [
    {
      text: "The sun is rising. The storm has weakened to strong winds and light rain.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "I can finally see the full extent of destruction. The landscape has completely changed - where the station stood is now just mud and debris.",
      delay: 3000,
      character: CHARACTER_MAYA
    },
    {
      text: "Several landslides are visible across the valley. The road is gone in multiple places.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "My transmitter is down to 10% battery. Radio says rescue teams are mobilizing, but dealing with widespread devastation.",
      delay: 3000,
      character: CHARACTER_MAYA
    },
    {
      text: "What should I do?",
      delay: 1500,
      character: CHARACTER_MAYA
    }
  ],
  choices: [
    {
      id: 'choice_morning_shed_1',
      text: "Stay where you are. The shed is visible from the air and rescue teams will be looking for survivors.",
      nextNodeId: 'wait_for_rescue'
    },
    {
      id: 'choice_morning_shed_2',
      text: "Try to find a way down to the valley road. You might encounter rescue teams coming from that direction.",
      nextNodeId: 'attempt_descent'
    }
  ]
},

{
  id: 'morning_shed_injured',
  character: CHARACTER_MAYA,
  text: "The light is starting to come through the cracks in the walls...",
  delay: 2000,
  followupMessages: [
    {
      text: "Morning has finally come. The typhoon has mostly passed, but I'm in bad shape.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "My arm is infected - red streaks moving up from the wound. I'm feverish and weak.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "Standing makes me dizzy.",
      delay: 1500,
      character: CHARACTER_MAYA
    },
    {
      text: "The radio says emergency response is underway, but the destruction is unprecedented. They're prioritizing populated areas first.",
      delay: 3500,
      character: CHARACTER_MAYA
    },
    {
      text: "This research station wasn't even on their evacuation list. I don't think I can walk far in this condition.",
      delay: 3000,
      character: CHARACTER_MAYA
    }
  ],
  effect: (state) => ({
    ...state,
    health: state.health - 15,
    flags: { ...state.flags, seriousInfection: true }
  }),
  choices: [
    {
      id: 'choice_morning_shed_injured_1',
      text: "Use the last of your transmitter battery to send an emergency medical distress signal with your location.",
      nextNodeId: 'call_for_medical'
    },
    {
      id: 'choice_morning_shed_injured_2',
      text: "Create a large SOS sign outside the shed that would be visible from rescue helicopters.",
      nextNodeId: 'create_sos'
    }
  ]
},

{
  id: 'wait_for_rescue',
  character: CHARACTER_MAYA,
  text: "I've decided to stay at the shed.",
  delay: 2000,
  waitTime: 10800000,
  activityMessage: "Maya is waiting for rescue (3+ hours)...",
  followupMessages: [
    {
      text: "I hung some bright yellow equipment tarps outside to make it more visible. I'm rationing my remaining food and water carefully.",
      delay: 3000,
      character: CHARACTER_MAYA
    },
    {
      text: "It's been hours since sunrise, and I've heard helicopters twice, but they didn't come this way.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "The radio reports are concerning - rescue resources are stretched thin. Entire villages are cut off and hundreds missing.",
      delay: 3000,
      character: CHARACTER_MAYA
    },
    {
      text: "I might not be a priority.",
      delay: 1500,
      character: CHARACTER_MAYA
    }
  ],
  choices: [
    {
      id: 'choice_wait_for_rescue_1',
      text: "Use the last of your transmitter battery to emphasize that you have critical landslide data that could save lives.",
      nextNodeId: 'emphasis_on_data'
    },
    {
      id: 'choice_wait_for_rescue_2',
      text: "Try to boost your radio signal to contact the rescue coordination directly.",
      nextNodeId: 'radio_contact'
    }
  ]
},

{
  id: 'emphasis_on_data',
  character: CHARACTER_MAYA,
  text: "I'm sending a final message emphasizing the critical landslide data I saved that could help predict other slides and potentially save lives.",
  delay: 2500,
  waitTime: 1800000,
  activityMessage: "Maya is sending an urgent message about her data...",
  followupMessages: [
    {
      text: "The battery's dead now...",
      delay: 2000,
      character: CHARACTER_MAYA
    },
    {
      text: "Wait! I can hear a helicopter coming this way!",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "Yes! I can see it circling the area!",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "They're... wait, they're flying away! No! They must not have seen me!",
      delay: 3000,
      character: CHARACTER_MAYA
    },
    {
      text: "I can't believe it. They were so close.",
      delay: 2000,
      character: CHARACTER_MAYA
    },
    {
      text: "Wait - they're coming back! They're hovering now. I think they spotted the tarps!",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "They're preparing to lower a rescue worker!",
      delay: 2000,
      character: CHARACTER_MAYA
    }
  ],
  effect: (state) => ({
    ...state,
    flags: { ...state.flags, dataEmphasisWorked: true, nearlymissedRescue: true }
  }),
  choices: [
    {
      id: 'choice_emphasis_on_data',
      text: "Gather the data drive and your most essential belongings only. Prepare for extraction.",
      nextNodeId: 'successful_rescue'
    }
  ]
},

{
  id: 'radio_contact',
  character: CHARACTER_MAYA,
  text: "I'm trying to boost the radio signal...",
  delay: 2000,
  waitTime: 7200000,
  activityMessage: "Maya is working on the radio (2+ hours)...",
  followupMessages: [
    {
      text: "I managed to boost the radio by connecting it to a solar panel I found in the shed.",
      delay: 3000,
      character: CHARACTER_MAYA
    },
    {
      text: "After hours trying different frequencies, I finally reached a rescue coordinator!",
      delay: 3000,
      character: CHARACTER_MAYA
    },
    {
      text: "They said they're dealing with massive casualties but will try to add me to the evacuation list.",
      delay: 3500,
      character: CHARACTER_MAYA
    },
    {
      text: "Just reported in that the first helicopter had mechanical issues and had to return to base.",
      delay: 3000,
      character: CHARACTER_MAYA
    },
    {
      text: "They're sending another one, but it will be at least 2 more hours.",
      delay: 2000,
      character: CHARACTER_MAYA
    },
    {
      text: "Wait - they just radioed back. A military helicopter was already in the area and can attempt pickup within the hour if weather permits!",
      delay: 2500,
      character: CHARACTER_MAYA
    }
  ],
  choices: [
    {
      id: 'choice_radio_contact',
      text: "Prepare a clear landing zone near the shed by moving any debris. Make yourself as visible as possible.",
      nextNodeId: 'helicopter_complications'
    }
  ]
},

{
  id: 'helicopter_complications',
  character: CHARACTER_MAYA,
  text: "I've cleared as much space as possible around the shed and spread out bright tarps.",
  delay: 2000,
  waitTime: 1800000,
  activityMessage: "Maya is preparing for helicopter extraction...",
  followupMessages: [
    {
      text: "I can hear the helicopter approaching!",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "The wind is still strong - they're having trouble maintaining position.",
      delay: 2000,
      character: CHARACTER_MAYA
    },
    {
      text: "They're attempting to lower a rescue worker, but... they're being blown around badly.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "The pilot's deciding it's too dangerous - they're pulling back up!",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "They're radioing something to me... they need to find a better approach angle. They're going to circle around and try again from the other side.",
      delay: 3500,
      character: CHARACTER_MAYA
    },
    {
      text: "Here they come again! They're lower this time, more sheltered from the wind.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "The rescue worker is being lowered... they made it to the ground!",
      delay: 2000,
      character: CHARACTER_MAYA
    }
  ],
  choices: [
    {
      id: 'choice_helicopter_complications',
      text: "Follow all the rescue worker's instructions exactly. This extraction will be dangerous.",
      nextNodeId: 'successful_rescue'
    }
  ]
},

{
  id: 'attempt_descent',
  character: CHARACTER_MAYA,
  text: "I'm going to try to make my way down to the valley.",
  delay: 3000,
  waitTime: 1800000,
  activityMessage: "Maya is attempting to descend the ridge...",
  followupMessages: [
    {
      text: "The path is treacherous - mud, fallen trees, debris everywhere.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "I'm using a piece of metal conduit as a walking stick to test the ground. Going extremely slow, nearly slipped several times.",
      delay: 2500
    },
    {
      text: "I can see what's left of the road below, but reaching it is harder than I thought.",
      delay: 2000,
      character: CHARACTER_MAYA
    },
    {
      text: "Wait - I see something moving on the road. It looks like... yes! It's a rescue vehicle!",
      delay: 2500,
      character: CHARACTER_MAYA
    }
  ],
  choices: [
    {
      id: 'choice_attempt_descent_1',
      text: "Use anything reflective you have to signal to them. Try to get their attention!",
      nextNodeId: 'signal_ground_team'
    },
    {
      id: 'choice_attempt_descent_2',
      text: "Continue making your way down carefully. Better to reach the road safely than risk a fall.",
      nextNodeId: 'descent_accident'
    }
  ]
},

{
  id: 'signal_ground_team',
  character: CHARACTER_MAYA,
  text: "I'm using the reflective emergency blanket to catch sunlight, waving frantically.",
  delay: 3000,
  waitTime: 900000,
  activityMessage: "Maya is signaling to the rescue team...",
  followupMessages: [
    {
      text: "Please see me!",
      delay: 1500,
      character: CHARACTER_MAYA
    },
    {
      text: "Yes! They're stopping! Someone's pointing up in my direction!",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "They've spotted me! They're setting up some kind of equipment... a loudspeaker.",
      delay: 300,
      character: CHARACTER_MAYA
    },
    {
      text: "I can hear them - they're telling me to stay where I am, that it's too dangerous to continue down. They're sending someone up with a rescue line.",
      delay: 4000,
      character: CHARACTER_MAYA
    },
    {
      text: "I've never been so happy to see another human being.",
      delay: 2000,
      character: CHARACTER_MAYA
    }
  ],
  choices: [
    {
      id: 'choice_signal_ground_team',
      text: "Stay exactly where you are and wait for the rescue team to reach you.",
      nextNodeId: 'successful_rescue'
    }
  ]
},

{
  id: 'descent_accident',
  character: CHARACTER_MAYA,
  text: "I'm continuing down carefully...",
  delay: 3000,
  followupMessages: [
    {
      text: "The ground just gave way beneath me!",
      delay: 1500,
      character: CHARACTER_MAYA
    },
    {
      text: "I'm sliding down the slope, grabbing at anything!",
      delay: 2000,
      character: CHARACTER_MAYA
    },
    {
      text: "I've stopped against a tree, but my leg is twisted badly - possibly broken.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "I can still see the rescue vehicle, but they're moving away - they didn't see me.",
      delay: 3000,
      character: CHARACTER_MAYA
    },
    {
      text: "I'm trying to call out but they're too far now. The pain is intense, and I'm in a precarious position on the hillside.",
      delay: 3500,
      character: CHARACTER_MAYA
    }
  ],
  effect: (state) => ({
    ...state,
    health: 40,
    flags: { ...state.flags, fallInjury: true, isStranded: true }
  }),
  choices: [
    {
      id: 'choice_descent_accident',
      text: "Try to stabilize your position and use your emergency whistle to signal for help.",
      nextNodeId: 'stranded_rescue'
    }
  ]
},

{
  id: 'call_for_medical',
  character: CHARACTER_MAYA,
  text: "I'm sending an emergency medical distress signal with my coordinates and condition details.",
  delay: 3000,
  waitTime: 7200000,
  activityMessage: "Maya is waiting for medical help (2+ hours)...",
  followupMessages: [
    {
      text: "The transmitter's dead now. Hours have passed with no response.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "My fever is worse, and I'm drifting in and out of consciousness.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "Wait... I hear something. A helicopter?",
      delay: 2000,
      character: CHARACTER_MAYA
    },
    {
      text: "Yes! It's hovering nearby! They're searching the area.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "I've dragged myself outside where they can see me. They're lowering a medic!",
      delay: 3000,
      character: CHARACTER_MAYA
    },
    {
      text: "I think I'm going to make it...",
      delay: 1500,
      character: CHARACTER_MAYA
    }
  ],
  effect: (state) => ({
    ...state,
    health: state.health - 5
  }),
  choices: [
    {
      id: 'choice_call_for_medical',
      text: "Wave whatever you can to ensure they spot you exactly.",
      nextNodeId: 'medical_evacuation'
    }
  ]
},

{
  id: 'create_sos',
  character: CHARACTER_MAYA,
  text: "I'm going to try to create an SOS sign...",
  delay: 3000,
  waitTime: 1800000,
  activityMessage: "Maya is struggling to create an SOS sign...",
  followupMessages: [
    {
      text: "I used equipment parts and tarp pieces to create a large SOS sign outside. It took all my remaining strength.",
      delay: 3500,
      character: CHARACTER_MAYA
    },
    {
      text: "My condition is getting worse. The infection is spreading, and I'm barely staying conscious.",
      delay: 3000,
      character: CHARACTER_MAYA
    },
    {
      text: "It's been hours with no sign of rescue. I keep checking the skies, but nothing.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "The radio says rescue efforts will continue for days, but they're prioritizing areas with confirmed survivors.",
      delay: 3500,
      character: CHARACTER_MAYA
    },
    {
      text: "My vision is getting blurry... I don't know how much longer I can hold on.",
      delay: 2500,
      character: CHARACTER_MAYA
    }
  ],
  effect: (state) => ({
    ...state,
    health: state.health - 20
  }),
  choices: [
    {
      id: 'choice_create_sos_1',
      text: "Try to find antibiotics or any medical supplies you might have missed in the shed.",
      nextNodeId: 'find_medicine'
    },
    {
      id: 'choice_create_sos_2',
      text: "Focus on staying awake and hydrated. Rescue could still come.",
      nextNodeId: 'late_rescue'
    }
  ]
},

{
  id: 'find_medicine',
  character: CHARACTER_MAYA,
  text: "I'm going to search every container in here...",
  delay: 3000,
  waitTime: 1800000,
  activityMessage: "Maya is desperately searching for medicine...",
  followupMessages: [
    {
      text: "In a forgotten emergency kit, I found a bottle of antibiotics!",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "They're expired, but it's all I have. I've taken a dose, but I'm not sure if it'll help at this stage.",
      delay: 3500,
      character: CHARACTER_MAYA
    },
    {
      text: "My fever is causing hallucinations now. I keep seeing people outside, but when I look again, no one's there.",
      delay: 3500,
      character: CHARACTER_MAYA
    },
    {
      text: "I'm trying to stay lucid... need to hold on just a little longer...",
      delay: 2500,
      character: CHARACTER_MAYA
    }
  ],
  effect: (state) => ({
    ...state,
    health: state.health + 5,
    flags: { ...state.flags, foundAntibiotics: true }
  }),
  choices: [
    {
      id: 'choice_find_medicine',
      text: "The antibiotics might buy you time. Focus on staying conscious and watching for rescue.",
      nextNodeId: 'late_rescue'
    }
  ]
},

{
  id: 'late_rescue',
  character: CHARACTER_MAYA,
  text: "I've been drifting in and out of consciousness.",
  delay: 2500,
  waitTime: 10800000,
  activityMessage: "Maya is losing consciousness (3+ hours)...",
  followupMessages: [
    {
      text: "The pain feels distant now, which I know isn't good.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "Wait... is that a helicopter, or am I hallucinating again?",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "No, it's real! They've found me!",
      delay: 2000,
      character: CHARACTER_MAYA
    },
    {
      text: "I can see rescue workers approaching. They're saying something, but I can't focus enough to understand.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "They're lifting me onto a stretcher. The movement sends waves of pain through my body.",
      delay: 3000,
      character: CHARACTER_MAYA
    },
    {
      text: "Everything is fading...",
      delay: 1500,
      character: CHARACTER_MAYA
    }
  ],
  effect: (state) => ({
    ...state,
    health: state.health - 10
  }),
  choices: [
    {
      id: 'choice_late_rescue',
      text: "You're in good hands now. Let the rescue team take over.",
      nextNodeId: 'hospital_recovery_1'
    }
  ]
},

{
  id: 'hospital_recovery_1',
  character: CHARACTER_MAYA,
  text: "I'm... in a hospital bed. They tell me I've been here for two days.",
  delay: 2000,
  followupMessages: [
    {
      text: "The infection was severe. I had sepsis by the time they got me here. The doctor says I was lucky to make it.",
      delay: 3500,
      character: CHARACTER_MAYA
    },
    {
      text: "I've been given strong antibiotics and fluids. My fever has finally broken.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "The nurses told me the death toll from Typhoon Mani has passed 500, with thousands still missing.",
      delay: 3500,
      character: CHARACTER_MAYA
    },
    {
      text: "I keep thinking about all the decisions that led me here - the pride that made me stay, the fear that paralyzed me, the hope that kept me going.",
      delay: 4000,
      character: CHARACTER_MAYA
    }
  ],
  choices: [
    {
      id: 'choice_hospital_recovery_1',
      text: "You've been through a traumatic experience. Give yourself time to recover and process.",
      nextNodeId: 'hospital_recovery_2'
    }
  ]
},

{
  id: 'hospital_recovery_2',
  character: CHARACTER_MAYA,
  text: "The doctors say I'll need several weeks of recovery.",
  delay: 2000,
  followupMessages: [
    {
      text: "Dr. Solon came to visit me today. He didn't say 'I told you so,' but I could see it in his eyes.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "He did say something that will stay with me: 'Nature deserves our respect, not our defiance.'",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "I think about the data I was trying to save. Was it worth nearly dying for? I'm not sure anymore.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "Next time, I'll leave when the first warning comes.",
      delay: 2000,
      character: CHARACTER_MAYA
    }
  ],
  choices: [
    {
      id: 'choice_hospital_recovery_2',
      text: "Your experience will make you a better researcher. Sometimes wisdom comes at a high price.",
      nextNodeId: 'ending_neutral'
    }
  ]
},

{
  id: 'successful_rescue',
  character: CHARACTER_MAYA,
  text: "The rescue was successful!",
  delay: 1500,
  waitTime: 1800000,
  activityMessage: "Maya is being evacuated by helicopter...",
  followupMessages: [
    {
      text: "I'm on the helicopter now, heading to a medical facility. The paramedic says I'm dehydrated and exhausted, but otherwise okay.",
      delay: 3500,
      character: CHARACTER_MAYA
    },
    {
      text: "Looking out the window, I can see dozens of landslides throughout the region. Entire communities washed away.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "The pilot says I'm incredibly lucky - they weren't planning to search this area today.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "Your guidance through this nightmare saved my life. I can't thank you enough.",
      delay: 2500,
      character: CHARACTER_MAYA
    }
  ],
  choices: [
    {
      id: 'choice_successful_rescue',
      text: "I'm just glad you're safe now. Your survival is a testament to your resilience.",
      nextNodeId: 'recovery_center'
    }
  ]
},

{
  id: 'recovery_center',
  character: CHARACTER_MAYA,
  text: "I've been at the emergency recovery center for 24 hours now.",
  delay: 2500,
  waitTime: 3600000,
  activityMessage: "Maya is being debriefed by authorities...",
  followupMessages: [
    {
      text: "The disaster response team has debriefed me about my experience. They were particularly interested in the landslide data I saved.",
      delay: 3500,
      character: CHARACTER_MAYA
    },
    {
      text: "They've already used it to predict and evacuate three other at-risk areas. They estimate it saved hundreds of lives.",
      delay: 3500,
      character: CHARACTER_MAYA
    },
    {
      text: "News reporters want to interview me as the 'hero scientist who risked her life for data that saved others.'",
      delay: 3000,
      character: CHARACTER_MAYA
    },
    {
      text: "I'm not comfortable with that narrative. The truth is, I made a series of poor decisions that nearly got me killed.",
      delay: 3500,
      character: CHARACTER_MAYA
    },
    {
      text: "If I do these interviews, I want to emphasize the importance of evacuation and preparation, not glorify staying behind.",
      delay: 3500,
      character: CHARACTER_MAYA
    }
  ],
  choices: [
    {
      id: 'choice_recovery_center',
      text: "That's a wise perspective. Your honest story could help others make better decisions in the future.",
      nextNodeId: 'research_reflection'
    }
  ]
},

{
  id: 'research_reflection',
  character: CHARACTER_MAYA,
  text: "I've been thinking about the future of our climate research program.",
  delay: 3000,
  followupMessages: [
    {
      text: "This experience has changed me completely. I was arrogant to think I could weather this storm alone.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "I've learned that survival means knowing when to leave, when to stay, and when to ask for help.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "I'm going to propose a redesign of our monitoring stations to be more resilient and remotely operable during extreme weather.",
      delay: 3500,
      character: CHARACTER_MAYA
    },
    {
      text: "We need systems that protect both our data and our people.",
      delay: 2000,
      character: CHARACTER_MAYA
    },
    {
      text: "Thank you for being my lifeline when I needed it most. Your guidance helped me survive when my own judgment failed.",
      delay: 2500,
      character: CHARACTER_MAYA
    }
  ],
  choices: [
    {
      id: 'choice_research_reflection',
      text: "Your experience will save lives in more ways than one. I wish you the best in your recovery and future work.",
      nextNodeId: 'ending_good'
    }
  ]
},

{
  id: 'medical_evacuation',
  character: CHARACTER_MAYA,
  text: "The medical team has me on the helicopter now.",
  delay: 2000,
  waitTime: 1800000,
  activityMessage: "Maya is receiving emergency medical care...",
  followupMessages: [
    {
      text: "They've started IV antibiotics and fluids. The medic says the infection could have been fatal if left untreated much longer.",
      delay: 3500,
      character: CHARACTER_MAYA
    },
    {
      text: "As we fly over the region, I can see the full scale of destruction. Homes, roads, entire communities - gone.",
      delay: 3000,
      character: CHARACTER_MAYA
    },
    {
      text: "I made a series of bad decisions staying behind, but with your help, I survived when many others didn't.",
      delay: 3000,
      character: CHARACTER_MAYA
    }
  ],
  choices: [
    {
      id: 'choice_medical_evacuation',
      text: "You showed incredible courage. Focus on recovery now - your experience can help others in the future.",
      nextNodeId: 'hospital_recovery_1'
    }
  ]
},

{
  id: 'stranded_rescue',
  character: CHARACTER_MAYA,
  text: "I'm blowing the emergency whistle as loud as I can.",
  delay: 2500,
  waitTime: 7200000,
  activityMessage: "Maya is signaling for help (2+ hours)...",
  followupMessages: [
    {
      text: "I've been blowing the emergency whistle for hours, conserving my strength between attempts.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "The pain in my leg is excruciating.",
      delay: 1500,
      character: CHARACTER_MAYA
    },
    {
      text: "Just as I was losing hope, I heard voices calling back! A rescue team heard my whistle!",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "They're making their way to me now. I can see them carefully climbing up the slope - local volunteers and emergency responders.",
      delay: 3500,
      character: CHARACTER_MAYA
    },
    {
      text: "They're reaching me now, stabilizing my leg. They say I'm lucky - many others are still missing.",
      delay: 2500,
      character: CHARACTER_MAYA
    }
  ],
  choices: [
    {
      id: 'choice_stranded_rescue',
      text: "You've made it through an incredible ordeal. Let them help you now.",
      nextNodeId: 'hospital_recovery_1'
    }
  ]
},

{
  id: 'ending_good',
  character: CHARACTER_MAYA,
  text: "It's been three days since my rescue.",
  delay: 1500,
  followupMessages: [
    {
      text: "I'm recovering well and the disaster response team debriefed me.",
      delay: 2000,
      character: CHARACTER_MAYA
    },
    {
      text: "The landslide data I saved has already helped them predict and evacuate three other at-risk areas.",
      delay: 2000,
      character: CHARACTER_MAYA
    },
    {
      text: "They estimate it saved hundreds of lives.",
      delay: 1500,
      character: CHARACTER_MAYA
    },
    {
      text: "This experience has changed me completely. I was arrogant to think I could weather this storm alone.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "I've learned that survival means knowing when to leave, when to stay, and when to ask for help.",
      delay: 2500,
      character: CHARACTER_MAYA
    },
    {
      text: "I've been offered a position leading a new research initiative on climate disaster prediction and response.",
      delay: 2000,
      character: CHARACTER_MAYA
    },
    {
      text: "My experience will inform how we protect both people and data.",
      delay: 1500,
      character: CHARACTER_MAYA
    },
    {
      text: "Thank you for being my lifeline when I needed it most.",
      delay: 2000,
      character: CHARACTER_MAYA
    }
  ],
  choices: []
},

{
  id: 'ending_neutral',
  character: CHARACTER_MAYA,
  text: "I'm writing this from my hospital bed.",
  delay: 1500,
  followupMessages: [
    {
      text: "The doctors say I'll recover, but it will take time.",
      delay: 1500,
      character: CHARACTER_MAYA
    },
    {
      text: "My injuries could have been avoided if I'd evacuated with the others, but your guidance prevented them from becoming fatal.",
      delay: 3500,
      character: CHARACTER_MAYA
    },
    {
      text: "The official death toll from Typhoon Mani has passed 500, with thousands still missing.",
      delay: 2000,
      character: CHARACTER_MAYA
    },
    {
      text: "I keep thinking about all the decisions that led me here - the pride that made me stay, the fear that paralyzed me, the hope that kept me going.",
      delay: 4000,
      character: CHARACTER_MAYA
    },
    {
      text: "I've been asked to write a report about my experience for future training of research staff. Perhaps my mistakes can become valuable lessons.",
      delay: 4000,
      character: CHARACTER_MAYA
    },
    {
      text: "I've learned that nature deserves our respect, not our defiance.",
      delay: 2000,
      character: CHARACTER_MAYA
    },
    {
      text: "Next time, I'll leave when the first warning comes.",
      delay: 2000,
      character: CHARACTER_MAYA
    }
  ],
  choices: []
},
  
{
  id: 'ending_bad',
  character: CHARACTER_SYSTEM,
  text: "[This is an automated message from the Philippine Disaster Response Agency]",
  delay: 2000,
  followupMessages: [
    {
      text: "The final transmission from Maya Avarelo was received three days ago.",
      delay: 2500,
      character: CHARACTER_SYSTEM
    },
    {
      text: "Despite extensive search and rescue operations, we regret to inform you that Maya's location has been buried under a secondary landslide.",
      delay: 3500,
      character: CHARACTER_SYSTEM
    },
    {
      text: "Recovery operations are not possible at this time due to continued ground instability.",
      delay: 2500,
      character: CHARACTER_SYSTEM
    },
    {
      text: "A memorial service will be held at Paraiso Climate Research headquarters next week to honor her dedication to science and climate research.",
      delay: 3500,
      character: CHARACTER_SYSTEM
    },
    {
      text: "Her colleagues have established a scholarship fund in her name to support students researching climate disaster preparedness.",
      delay: 3000,
      character: CHARACTER_SYSTEM
    },
    {
      text: "This tragic outcome reminds us of the importance of heeding evacuation warnings and the unpredictable power of nature.",
      delay: 3000,
      character: CHARACTER_SYSTEM
    },
    {
      text: "Maya's final transmissions have been archived to help train future disaster response protocols.",
      delay: 2500,
      character: CHARACTER_SYSTEM
    }
  ],
  choices: []
}
];

export const endings: Ending[] = [
{
  id: 'good_ending',
  type: EndingType.GOOD,
  text: "Maya survived with minimal injuries and her scientific data helped save many other lives. This ending reminds us that preparation, making good decisions under pressure, and knowing when to prioritize different risks can make the difference between life and death. It also shows how expertise and information can have value beyond personal survival.",
  condition: (state) => {
    return !state.flags.isInjured && state.currentNodeId === 'ending_good';
  }
},
{
  id: 'neutral_ending',
  type: EndingType.NEUTRAL,
  text: "Maya survived but sustained significant injuries that could have been avoided with better initial decisions. This ending highlights how pride and overconfidence can lead us into dangerous situations, but that perseverance and adaptability can still see us through. Sometimes we must accept the consequences of our poor choices while still fighting to survive them.",
  condition: (state) => {
    return (state.flags.isInjured && state.health > 30) || state.currentNodeId === 'ending_neutral';
  }
},
{
  id: 'bad_ending',
  type: EndingType.BAD,
  text: "Maya did not survive the disaster. This sobering outcome emphasizes the importance of heeding evacuation warnings and the unpredictable power of nature. Sometimes the most important decision is made days before the critical moment - the decision to leave while you still can. Maya's tragedy serves as a reminder that scientific data, no matter how valuable, is never worth a human life.",
  condition: (state) => {
    return state.health <= 30 || state.flags.trapped;
  }
},
{
  id: 'evacuation_ending',
  type: EndingType.GOOD,
  text: "Maya chose to evacuate before the typhoon hit, saving her life though losing some research data. This ending shows the wisdom of prioritizing personal safety over material possessions or work, no matter how important. It demonstrates that sometimes the brave choice is walking away from danger rather than facing it.",
  condition: (state) => {
    return state.currentNodeId === 'evacuation_epilogue';
  }
}
];

export const INITIAL_NODE_ID = 'prologue_1';