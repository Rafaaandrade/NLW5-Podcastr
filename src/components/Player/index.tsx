import { useContext, useRef, useEffect, useState } from 'react';
import { PlayerContext } from './../../context/PlayerContext';
import styles from './styles.module.scss';
import Image from 'next/image';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';

const Player = () => {
  const audioRef = useRef<HTMLAudioElement>(null);

  const [timer, setTimer] = useState(0);

  const setTimerListener = () => {
    audioRef.current.currentTime = 0;
    //*
    audioRef.current.addEventListener('timeupdate', () =>
      setTimer(Math.floor(audioRef.current.currentTime))
    );
  };

  const handlePush = (time: number) => {
    audioRef.current.currentTime = time;
    setTimer(time);
  };

  const handleAudioEnded = () => {
    if (hasNext) {
      playNext();
    } else {
      clearPlayer();
    }
  };

  const {
    episodeList,
    currentEpisodeIndex,
    isPlaying,
    togglePlay,
    setPlayingState,
    playNext,
    playPrevious,
    hasNext,
    hasPrevious,
    isLooping,
    toggleLoop,
    toggleShuffle,
    isShuffling,
    clearPlayer,
  } = useContext(PlayerContext);
  const episode = episodeList[currentEpisodeIndex];

  //useEffect utilizado para controlar saida de áudio do Player
  useEffect(() => {
    if (!audioRef.current) {
      return;
    }
    if (isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  return (
    <div className={styles.playerContainer}>
      <header>
        <img src='/playing.svg' alt='Tocando agora' />
        <strong>Tocando agora </strong>
      </header>

      {episode ? (
        <div className={styles.currentEpisode}>
          <Image
            width={592}
            height={592}
            src={episode.thumbnail}
            objectFit='cover'
          />
          <strong>{episode.title}</strong>
          <span>{episode.members}</span>
        </div>
      ) : (
        <div className={styles.emptyPlayer}>
          <strong>Selecione um podcast para ouvir</strong>
        </div>
      )}

      <footer className={!episode ? styles.empty : ''}>
        <div className={styles.progress}>
          <span>{convertDurationToTimeString(timer)}</span>
          <div className={styles.slider}>
            {episode ? (
              <Slider
                max={episode.duration}
                value={timer}
                onChange={handlePush}
                trackStyle={{ backgroundColor: '#04d361' }}
                railStyle={{ backgroundColor: '#9f75ff' }}
                handleStyle={{ borderColor: '#04d361', borderWidth: 4 }}
              />
            ) : (
              <div className={styles.emptySlider} />
            )}
          </div>
          <span>{convertDurationToTimeString(episode?.duration ?? 0)}</span>
        </div>

        {episode && (
          <audio
            src={episode.url}
            autoPlay
            ref={audioRef}
            loop={isLooping}
            onPlay={() => setPlayingState(true)}
            onPause={() => setPlayingState(false)}
            onLoadedMetadata={setTimerListener}
            onEnded={handleAudioEnded}
          />
        )}

        <div className={styles.buttons}>
          <button
            type='button'
            disabled={!episode || episodeList.length === 1}
            onClick={toggleShuffle}
            className={isShuffling ? styles.isActive : ''}
          >
            <img src='./shuffle.svg' alt='Aleatorio' />
          </button>

          <button
            type='button'
            disabled={!episode || !hasPrevious}
            onClick={playPrevious}
          >
            <img src='./play-previous.svg' alt='Tocar anterior' />
          </button>

          <button
            type='button'
            className={styles.playButton}
            disabled={!episode}
            onClick={togglePlay}
          >
            {isPlaying ? (
              <img src='./pause.svg' alt='Pausar' />
            ) : (
              <img src='./play.svg' alt='Tocar' />
            )}
          </button>

          <button
            type='button'
            disabled={!episode || !hasNext}
            onClick={playNext}
          >
            <img src='./play-next.svg' alt='Tocar próxima' />
          </button>

          <button
            type='button'
            disabled={!episode}
            onClick={toggleLoop}
            className={isLooping ? styles.isActive : ''}
          >
            <img src='./repeat.svg' alt='Repetir' />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Player;
