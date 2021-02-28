import {createContext, useState, ReactNode, useEffect} from 'react';
import Cookies from 'js-cookie'; 
import challenges from '../../challenges.json';
import { LevelUpModal } from '../components/LevelUpModal';


interface Challenge{
  type:'body'| 'eye';
  description: String,
  amount: number
}

interface ChallengesContextdata {
    level: number; 
    currentExperience:number;
    experienceToNextlevel:number;
    challengesCompleted: number;
    activeChallenge: Challenge;
    levelup: () => void;
    startNewChallenges: () => void;
    resetChallenge: () => void;
    completeChallenge: () => void;
    closeLevelUpModal: () => void;
}

interface ChallengesProviderProps {
  children: ReactNode;
  level: number;
  currentExperience: number;
  challengesCompleted: number;
}

export const ChallengesContext = createContext({} as ChallengesContextdata);

export function ChallengesProvider({ 
  children,
  ...rest 
}) {
  const [level, setLevel] = useState(rest. level ?? 1);
  const [currentExperience, setCurrentExperience] = useState(rest. currentExperience ?? 0);
  const [challengesCompleted, setChallengesCompleted] = useState(rest. challengesCompleted ?? 0);

  const [activeChallenge, setActiveChallenge] = useState(null);

  const [isLevelUpModalOpen, setIsLevelUpModalOpen] = useState(false);

  const experienceToNextlevel = Math.pow((level + 1)* 4, 2);

  useEffect(() => {
    Notification.requestPermission();
  }, [])

  useEffect(() => {
    Cookies.set('level', String(level));
    Cookies.set('currentExperience', String(currentExperience));
    Cookies.set('challengesCompleted', String(challengesCompleted));
  }, [level, currentExperience, challengesCompleted])

  function levelup(){
    setLevel(level + 1);
    setIsLevelUpModalOpen(true);
  }

  function closeLevelUpModal(){
    setIsLevelUpModalOpen(false);
  }

  function startNewChallenges(){
    const randomChallengeIndex = Math.floor(Math.random() * challenges.length);
    const challenge = challenges[randomChallengeIndex];

    setActiveChallenge(challenge);

    new Audio('/notification.mp3').play();

    if (Notification.permission === 'granted') {
      new Notification('Novo Desafio 🎊', { 
         body: `Valendo ${challenge.amount}xp!`
      })
    }
  }

  function resetChallenge() {
    setActiveChallenge(null);
  }

  function completeChallenge() {
    if (!activeChallenge) {
      return;
    }

    const {amount} = activeChallenge;

    let finalExperience = currentExperience + amount;

    if (finalExperience >= experienceToNextlevel) {
      finalExperience + finalExperience - experienceToNextlevel;
      levelup();
    }

    setCurrentExperience(finalExperience);
    setActiveChallenge(null);
    setChallengesCompleted(challengesCompleted + 1);

  }


  return (
    <ChallengesContext.Provider 
    value={{
      level, 
      currentExperience,
      experienceToNextlevel, 
      challengesCompleted, 
      levelup,
      startNewChallenges,
      activeChallenge,
      resetChallenge,
      completeChallenge,
      closeLevelUpModal,
      }}
    >
      {children}
      { isLevelUpModalOpen && <LevelUpModal/>}
    </ChallengesContext.Provider>
  )

}