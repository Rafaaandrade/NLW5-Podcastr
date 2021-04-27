import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticProps } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { useContext } from 'react';
import { PlayerContext } from './../context/PlayerContext';
import api from './../services/api';
import { convertDurationToTimeString } from './../utils/convertDurationToTimeString';
import styles from './home.module.scss';
import Head from 'next/head';

type Episode = {
  id: string;
  title: string;
  members: string;
  published_at: string;
  thumbnail: string;
  duration: number;
  durationAsString: string;
  url: string;
  publishedAt: string;
};

type HomeProps = {
  latestEpisodes: Episode[];
  allEpisodes: Episode[];
};

const Home = ({ latestEpisodes, allEpisodes }: HomeProps) => {
  const { playList } = useContext(PlayerContext);

  const episodeList = [...latestEpisodes, ...allEpisodes];

  return (
    <div className={styles.homepage}>
      <Head>
        <title>Home | Podcastr </title>
      </Head>

      <section className={styles.latestEpisodes}>
        <h2>Últimos lançamentos</h2>

        <ul>
          {latestEpisodes.map((ep, index) => {
            return (
              <li key={ep.id}>
                <Image
                  width={192}
                  height={192}
                  src={ep.thumbnail}
                  alt={ep.title}
                  objectFit='cover'
                />

                <div className={styles.episodeDetails}>
                  <Link href={`/episode/${ep.id}`}>
                    <a>{ep.title}</a>
                  </Link>
                  <p>{ep.members}</p>
                  <span>{ep.publishedAt}</span>
                  <span>{ep.durationAsString}</span>
                </div>

                <button type='button'>
                  <img
                    src='/play-green.svg'
                    alt='Tocar episódio'
                    onClick={() => playList(episodeList, index)}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={styles.allEpisodes}>
        <h2>Todos episódios</h2>
        <table cellSpacing={0}>
          <thead>
            <tr>
              <th></th>
              <th>Podcast</th>
              <th>Integrantes</th>
              <th>Data</th>
              <th>Duração</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {allEpisodes.map((ep, index) => {
              return (
                <tr key={ep.id}>
                  <td style={{ width: 100 }}>
                    <Image
                      width={120}
                      height={120}
                      src={ep.thumbnail}
                      alt={ep.title}
                      objectFit='cover'
                    />
                  </td>
                  <td>
                    <Link href={`/episode/${ep.id}`}>
                      <a>{ep.title}</a>
                    </Link>
                  </td>
                  <td>{ep.members}</td>
                  <td style={{ width: 100 }}>{ep.publishedAt}</td>
                  <td>{ep.durationAsString}</td>
                  <td>
                    <button
                      type='button'
                      onClick={() =>
                        playList(episodeList, index + latestEpisodes.length)
                      }
                    >
                      <img src='/play-green.svg' alt='Tocar episódio' />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const { data } = await api.get('episodes', {
    params: {
      _limit: 12,
      _sort: 'published_at',
      _order: 'desc',
    },
  });

  const episodes = data.map((episode) => {
    return {
      id: episode.id,
      title: episode.title,
      thumbnail: episode.thumbnail,
      members: episode.members,
      publishedAt: format(parseISO(episode.published_at), 'd MMM yy', {
        locale: ptBR,
      }),
      duration: Number(episode.file.duration),
      durationAsString: convertDurationToTimeString(
        Number(episode.file.duration)
      ),
      url: episode.file.url,
    };
  });

  const latestEpisodes = episodes.slice(0, 2);
  const allEpisodes = episodes.slice(2, episodes.length);

  return {
    props: {
      latestEpisodes,
      allEpisodes,
    },
    revalidate: 60 * 60 * 8,
  };
};

export default Home;
