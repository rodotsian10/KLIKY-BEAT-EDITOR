import React, { useState, useEffect, useRef } from 'react';
import IntroScreen from './components/IntroScreen';
import PlaylistScreen from './components/PlaylistScreen';
import SongDetailsScreen from './components/SongDetailsScreen';
import GamePlayScreen from './components/GamePlayScreen';
import SettingsModal from './components/SettingsModal';
import './App.css';

const SONGS = [
  {
    id: 'my-heart',
    title: 'My Heart',
    artist: 'Different Heaven, EH!DE',
    path: '/my_heart.mp3',
    bpm: 140,
    duration: '2:01',
    difficulty: 'HARD',
    highScoreKey: 'high_score_my_heart',
    coverColor: '#00ffff',
    chart: [
      { beat: 1.00, lane: 0, type: 'hold', durationBeats: 1.00 },
      { beat: 2.50, lane: 1, type: 'short' },
      { beat: 3.00, lane: 2, type: 'short' },
      { beat: 3.25, lane: 3, type: 'hold', durationBeats: 1.00 },
      { beat: 4.75, lane: 1, type: 'short' },
      { beat: 5.00, lane: 2, type: 'short' },
      { beat: 6.75, lane: 0, type: 'short' },
      { beat: 6.75, lane: 3, type: 'short' },
      { beat: 7.00, lane: 1, type: 'short' },
      { beat: 7.00, lane: 2, type: 'short' },
      { beat: 7.75, lane: 1, type: 'short' },
      { beat: 7.75, lane: 2, type: 'short' },
      { beat: 8.25, lane: 0, type: 'short' },
      { beat: 8.25, lane: 3, type: 'short' },
      { beat: 9.75, lane: 1, type: 'short' },
      { beat: 10.00, lane: 2, type: 'short' },
      { beat: 10.25, lane: 1, type: 'short' },
      { beat: 10.50, lane: 2, type: 'short' },
      { beat: 12.00, lane: 0, type: 'short' },
      { beat: 12.25, lane: 1, type: 'short' },
      { beat: 12.50, lane: 2, type: 'short' },
      { beat: 12.75, lane: 3, type: 'short' },
      { beat: 13.25, lane: 0, type: 'hold', durationBeats: 0.75 },
      { beat: 14.50, lane: 1, type: 'short' },
      { beat: 14.75, lane: 2, type: 'short' },
      { beat: 15.00, lane: 3, type: 'hold', durationBeats: 1.00 },
      { beat: 16.25, lane: 1, type: 'short' },
      { beat: 17.25, lane: 1, type: 'hold', durationBeats: 1.00 },
      { beat: 19.00, lane: 1, type: 'short' },
      { beat: 19.25, lane: 2, type: 'short' },
      { beat: 20.25, lane: 2, type: 'hold', durationBeats: 1.50 },
      { beat: 23.25, lane: 0, type: 'short' },
      { beat: 23.25, lane: 3, type: 'short' },
      { beat: 23.75, lane: 1, type: 'short' },
      { beat: 23.75, lane: 2, type: 'short' },
      { beat: 25.25, lane: 0, type: 'short' },
      { beat: 26.25, lane: 1, type: 'short' },
      { beat: 27.00, lane: 1, type: 'short' },
      { beat: 27.25, lane: 2, type: 'short' },
      { beat: 28.00, lane: 2, type: 'short' },
      { beat: 28.25, lane: 3, type: 'short' },
      { beat: 28.50, lane: 2, type: 'short' },
      { beat: 29.75, lane: 2, type: 'hold', durationBeats: 1.75 },
      { beat: 32.25, lane: 1, type: 'short' },
      { beat: 32.50, lane: 0, type: 'short' },
      { beat: 33.00, lane: 1, type: 'short' },
      { beat: 33.75, lane: 0, type: 'short' },
      { beat: 34.50, lane: 1, type: 'short' },
      { beat: 35.50, lane: 3, type: 'short' },
      { beat: 35.75, lane: 2, type: 'hold', durationBeats: 2.75 },
      { beat: 39.75, lane: 0, type: 'short' },
      { beat: 39.75, lane: 1, type: 'short' },
      { beat: 40.00, lane: 1, type: 'short' },
      { beat: 40.75, lane: 2, type: 'short' },
      { beat: 40.75, lane: 3, type: 'short' },
      { beat: 41.00, lane: 2, type: 'short' },
      { beat: 41.75, lane: 0, type: 'short' },
      { beat: 41.75, lane: 1, type: 'short' },
      { beat: 42.00, lane: 1, type: 'short' },
      { beat: 42.75, lane: 3, type: 'short' },
      { beat: 43.00, lane: 2, type: 'short' },
      { beat: 44.00, lane: 0, type: 'hold', durationBeats: 2.25 },
      { beat: 47.00, lane: 1, type: 'short' },
      { beat: 47.75, lane: 2, type: 'short' },
      { beat: 48.75, lane: 3, type: 'short' },
      { beat: 49.75, lane: 0, type: 'short' },
      { beat: 49.75, lane: 3, type: 'short' },
      { beat: 50.25, lane: 1, type: 'short' },
      { beat: 50.25, lane: 2, type: 'short' },
      { beat: 50.50, lane: 1, type: 'short' },
      { beat: 50.50, lane: 2, type: 'short' },
      { beat: 50.75, lane: 0, type: 'short' },
      { beat: 50.75, lane: 3, type: 'short' },
      { beat: 51.00, lane: 1, type: 'short' },
      { beat: 51.00, lane: 2, type: 'short' },
      { beat: 51.25, lane: 1, type: 'short' },
      { beat: 51.25, lane: 2, type: 'short' },
      { beat: 51.50, lane: 3, type: 'short' },
      { beat: 51.50, lane: 0, type: 'short' },
      { beat: 51.75, lane: 1, type: 'short' },
      { beat: 51.75, lane: 2, type: 'short' },
      { beat: 52.25, lane: 0, type: 'hold', durationBeats: 0.75 },
      { beat: 53.25, lane: 3, type: 'hold', durationBeats: 0.75 },
      { beat: 54.25, lane: 1, type: 'short' },
      { beat: 54.75, lane: 2, type: 'short' },
      { beat: 55.25, lane: 1, type: 'short' },
      { beat: 55.75, lane: 2, type: 'short' },
      { beat: 56.00, lane: 3, type: 'short' },
      { beat: 56.25, lane: 3, type: 'short' },
      { beat: 56.50, lane: 3, type: 'short' },
      { beat: 56.75, lane: 3, type: 'short' },
      { beat: 57.00, lane: 3, type: 'short' },
      { beat: 57.25, lane: 3, type: 'short' },
      { beat: 57.50, lane: 3, type: 'short' },
      { beat: 57.75, lane: 0, type: 'short' },
      { beat: 58.50, lane: 0, type: 'short' },
      { beat: 58.75, lane: 0, type: 'short' },
      { beat: 59.25, lane: 3, type: 'short' },
      { beat: 59.75, lane: 3, type: 'short' },
      { beat: 60.25, lane: 0, type: 'short' },
      { beat: 60.50, lane: 1, type: 'short' },
      { beat: 60.75, lane: 2, type: 'short' },
      { beat: 61.00, lane: 3, type: 'short' },
      { beat: 61.75, lane: 0, type: 'short' },
      { beat: 62.00, lane: 0, type: 'short' },
      { beat: 62.25, lane: 0, type: 'short' },
      { beat: 62.50, lane: 0, type: 'short' },
      { beat: 62.75, lane: 0, type: 'short' },
      { beat: 63.00, lane: 0, type: 'short' },
      { beat: 63.25, lane: 0, type: 'short' },
      { beat: 63.50, lane: 0, type: 'short' },
      { beat: 63.75, lane: 0, type: 'short' },
      { beat: 64.00, lane: 0, type: 'short' },
      { beat: 64.50, lane: 1, type: 'short' },
      { beat: 64.75, lane: 2, type: 'short' },
      { beat: 65.50, lane: 3, type: 'short' },
      { beat: 66.00, lane: 0, type: 'short' },
      { beat: 66.25, lane: 3, type: 'short' },
      { beat: 66.50, lane: 0, type: 'short' },
      { beat: 67.00, lane: 3, type: 'short' },
      { beat: 67.25, lane: 3, type: 'short' },
      { beat: 67.50, lane: 3, type: 'hold', durationBeats: 6.50 },
      { beat: 67.75, lane: 0, type: 'short' },
      { beat: 68.00, lane: 0, type: 'short' },
      { beat: 68.25, lane: 0, type: 'short' },
      { beat: 68.50, lane: 0, type: 'short' },
      { beat: 68.75, lane: 0, type: 'short' },
      { beat: 69.00, lane: 0, type: 'short' },
      { beat: 69.25, lane: 0, type: 'short' },
      { beat: 69.50, lane: 0, type: 'short' },
      { beat: 69.75, lane: 0, type: 'short' },
      { beat: 70.00, lane: 0, type: 'short' },
      { beat: 70.25, lane: 0, type: 'short' },
      { beat: 70.50, lane: 0, type: 'short' },
      { beat: 70.75, lane: 0, type: 'short' },
      { beat: 71.25, lane: 2, type: 'short' },
      { beat: 71.50, lane: 2, type: 'short' },
      { beat: 72.00, lane: 1, type: 'short' },
      { beat: 72.25, lane: 0, type: 'short' },
      { beat: 72.50, lane: 1, type: 'short' },
      { beat: 72.75, lane: 2, type: 'short' },
      { beat: 73.00, lane: 1, type: 'short' },
      { beat: 73.25, lane: 0, type: 'short' },
      { beat: 73.50, lane: 1, type: 'short' },
      { beat: 73.75, lane: 2, type: 'short' },
      { beat: 74.00, lane: 1, type: 'short' },
      { beat: 76.00, lane: 3, type: 'short' },
      { beat: 77.00, lane: 0, type: 'hold', durationBeats: 1.50 },
      { beat: 77.00, lane: 3, type: 'hold', durationBeats: 1.50 },
      { beat: 78.75, lane: 0, type: 'short' },
      { beat: 78.75, lane: 3, type: 'short' },
      { beat: 79.50, lane: 0, type: 'short' },
      { beat: 79.50, lane: 3, type: 'short' },
      { beat: 79.75, lane: 1, type: 'short' },
      { beat: 79.75, lane: 2, type: 'short' },
      { beat: 80.00, lane: 0, type: 'short' },
      { beat: 80.00, lane: 3, type: 'short' },
      { beat: 80.25, lane: 1, type: 'short' },
      { beat: 80.25, lane: 2, type: 'short' },
      { beat: 80.50, lane: 0, type: 'short' },
      { beat: 80.50, lane: 3, type: 'short' },
      { beat: 81.25, lane: 3, type: 'hold', durationBeats: 2.75 },
      { beat: 81.50, lane: 0, type: 'short' },
      { beat: 81.75, lane: 1, type: 'short' },
      { beat: 82.00, lane: 0, type: 'short' },
      { beat: 82.25, lane: 1, type: 'short' },
      { beat: 82.50, lane: 0, type: 'short' },
      { beat: 82.75, lane: 1, type: 'short' },
      { beat: 83.00, lane: 0, type: 'short' },
      { beat: 83.25, lane: 1, type: 'short' },
      { beat: 84.00, lane: 0, type: 'hold', durationBeats: 3.00 },
      { beat: 87.25, lane: 1, type: 'hold', durationBeats: 0.75 },
      { beat: 87.50, lane: 3, type: 'short' },
      { beat: 87.75, lane: 3, type: 'short' },
      { beat: 88.00, lane: 3, type: 'short' },
      { beat: 88.25, lane: 3, type: 'short' },
      { beat: 88.50, lane: 3, type: 'short' },
      { beat: 88.75, lane: 3, type: 'short' },
      { beat: 89.00, lane: 3, type: 'short' },
      { beat: 89.25, lane: 3, type: 'short' },
      { beat: 90.00, lane: 1, type: 'short' },
      { beat: 90.00, lane: 2, type: 'short' },
      { beat: 90.25, lane: 0, type: 'hold', durationBeats: 1.75 },
      { beat: 92.50, lane: 3, type: 'short' },
      { beat: 92.75, lane: 2, type: 'short' },
      { beat: 93.00, lane: 3, type: 'short' },
      { beat: 93.25, lane: 2, type: 'short' },
      { beat: 93.75, lane: 0, type: 'short' },
      { beat: 94.00, lane: 0, type: 'short' },
      { beat: 94.25, lane: 0, type: 'short' },
      { beat: 94.50, lane: 0, type: 'short' },
      { beat: 94.75, lane: 0, type: 'short' },
      { beat: 95.00, lane: 0, type: 'short' },
      { beat: 95.50, lane: 0, type: 'short' },
      { beat: 95.75, lane: 0, type: 'short' },
      { beat: 96.00, lane: 2, type: 'hold', durationBeats: 1.25 },
      { beat: 97.50, lane: 2, type: 'short' },
      { beat: 98.25, lane: 3, type: 'short' },
      { beat: 98.25, lane: 2, type: 'short' },
      { beat: 98.50, lane: 1, type: 'short' },
      { beat: 98.50, lane: 2, type: 'short' },
      { beat: 98.75, lane: 0, type: 'short' },
      { beat: 98.75, lane: 1, type: 'short' },
      { beat: 99.00, lane: 2, type: 'short' },
      { beat: 99.00, lane: 1, type: 'short' },
      { beat: 100.00, lane: 1, type: 'short' },
      { beat: 100.00, lane: 2, type: 'short' },
      { beat: 100.25, lane: 1, type: 'short' },
      { beat: 100.25, lane: 2, type: 'short' },
      { beat: 100.50, lane: 2, type: 'short' },
      { beat: 100.75, lane: 1, type: 'short' },
      { beat: 101.00, lane: 2, type: 'short' },
      { beat: 101.25, lane: 1, type: 'short' },
      { beat: 101.50, lane: 2, type: 'short' },
      { beat: 101.75, lane: 1, type: 'short' },
      { beat: 103.25, lane: 0, type: 'hold', durationBeats: 1.50 },
      { beat: 105.00, lane: 2, type: 'short' },
      { beat: 105.50, lane: 1, type: 'short' },
      { beat: 105.75, lane: 2, type: 'short' },
      { beat: 106.25, lane: 1, type: 'short' },
      { beat: 107.00, lane: 3, type: 'short' },
      { beat: 107.25, lane: 3, type: 'short' },
      { beat: 107.50, lane: 3, type: 'short' },
      { beat: 107.75, lane: 3, type: 'short' },
      { beat: 108.00, lane: 3, type: 'short' },
      { beat: 108.25, lane: 3, type: 'short' },
      { beat: 108.50, lane: 3, type: 'short' },
      { beat: 108.75, lane: 3, type: 'short' },
      { beat: 109.00, lane: 3, type: 'short' },
      { beat: 109.25, lane: 3, type: 'short' },
      { beat: 109.50, lane: 3, type: 'short' },
      { beat: 109.75, lane: 3, type: 'hold', durationBeats: 1.25 },
      { beat: 111.50, lane: 3, type: 'short' },
      { beat: 111.75, lane: 2, type: 'short' },
      { beat: 112.00, lane: 3, type: 'short' },
      { beat: 112.50, lane: 0, type: 'short' },
      { beat: 112.75, lane: 0, type: 'short' },
      { beat: 113.00, lane: 0, type: 'short' },
      { beat: 113.25, lane: 0, type: 'short' },
      { beat: 113.50, lane: 0, type: 'short' },
      { beat: 114.75, lane: 0, type: 'short' },
      { beat: 115.00, lane: 1, type: 'short' },
      { beat: 115.25, lane: 2, type: 'short' },
      { beat: 115.50, lane: 3, type: 'short' },
      { beat: 116.00, lane: 1, type: 'hold', durationBeats: 1.75 },
      { beat: 116.75, lane: 2, type: 'hold', durationBeats: 1.75 },
      { beat: 119.00, lane: 0, type: 'hold', durationBeats: 1.25 },
      { beat: 120.50, lane: 0, type: 'short' },
      { beat: 120.75, lane: 3, type: 'short' },
      { beat: 121.00, lane: 3, type: 'short' },
      { beat: 121.25, lane: 3, type: 'short' },
      { beat: 121.50, lane: 3, type: 'short' },
      { beat: 121.75, lane: 3, type: 'short' },
      { beat: 122.00, lane: 3, type: 'short' },
      { beat: 122.25, lane: 3, type: 'short' },
      { beat: 122.50, lane: 3, type: 'short' },
      { beat: 122.75, lane: 1, type: 'hold', durationBeats: 1.50 },
      { beat: 122.75, lane: 2, type: 'hold', durationBeats: 1.50 },
      { beat: 124.50, lane: 1, type: 'short' },
      { beat: 125.25, lane: 0, type: 'short' },
      { beat: 125.25, lane: 3, type: 'short' },
      { beat: 125.50, lane: 1, type: 'short' },
      { beat: 125.50, lane: 2, type: 'short' },
      { beat: 125.75, lane: 1, type: 'short' },
      { beat: 125.75, lane: 2, type: 'short' },
      { beat: 126.00, lane: 0, type: 'short' },
      { beat: 126.00, lane: 3, type: 'short' },
      { beat: 126.75, lane: 0, type: 'short' },
      { beat: 127.00, lane: 3, type: 'short' },
      { beat: 127.25, lane: 0, type: 'short' },
      { beat: 127.50, lane: 3, type: 'short' },
      { beat: 127.75, lane: 0, type: 'short' },
      { beat: 128.00, lane: 3, type: 'short' },
      { beat: 128.25, lane: 1, type: 'hold', durationBeats: 2.25 },
      { beat: 131.25, lane: 1, type: 'short' },
      { beat: 131.50, lane: 2, type: 'short' },
      { beat: 131.75, lane: 1, type: 'short' },
      { beat: 132.00, lane: 1, type: 'hold', durationBeats: 1.50 },
      { beat: 133.75, lane: 3, type: 'short' },
      { beat: 134.00, lane: 3, type: 'short' },
      { beat: 134.25, lane: 3, type: 'short' },
      { beat: 134.50, lane: 3, type: 'short' },
      { beat: 134.75, lane: 3, type: 'short' },
      { beat: 135.50, lane: 0, type: 'hold', durationBeats: 1.25 },
      { beat: 137.00, lane: 0, type: 'short' },
      { beat: 137.25, lane: 0, type: 'short' },
      { beat: 137.50, lane: 3, type: 'short' },
      { beat: 137.75, lane: 3, type: 'short' },
      { beat: 138.00, lane: 3, type: 'short' },
      { beat: 138.25, lane: 2, type: 'short' },
      { beat: 138.75, lane: 0, type: 'short' },
      { beat: 139.00, lane: 0, type: 'short' },
      { beat: 139.25, lane: 0, type: 'short' },
      { beat: 139.50, lane: 0, type: 'short' },
      { beat: 139.75, lane: 0, type: 'short' },
      { beat: 140.00, lane: 0, type: 'short' },
      { beat: 140.25, lane: 0, type: 'short' },
      { beat: 140.50, lane: 0, type: 'short' },
      { beat: 140.75, lane: 0, type: 'short' },
      { beat: 141.00, lane: 0, type: 'short' },
      { beat: 141.25, lane: 0, type: 'hold', durationBeats: 0.75 },
      { beat: 141.25, lane: 3, type: 'hold', durationBeats: 0.75 },
      { beat: 142.25, lane: 1, type: 'hold', durationBeats: 1.75 },
      { beat: 144.25, lane: 2, type: 'short' },
      { beat: 144.50, lane: 3, type: 'short' },
      { beat: 144.75, lane: 2, type: 'short' },
      { beat: 145.00, lane: 3, type: 'short' },
      { beat: 145.25, lane: 0, type: 'short' },
      { beat: 145.50, lane: 0, type: 'short' },
      { beat: 145.75, lane: 0, type: 'short' },
      { beat: 146.00, lane: 0, type: 'short' },
      { beat: 146.25, lane: 0, type: 'short' },
      { beat: 146.50, lane: 0, type: 'short' },
      { beat: 146.75, lane: 0, type: 'short' },
      { beat: 147.00, lane: 3, type: 'hold', durationBeats: 1.00 },
      { beat: 148.75, lane: 0, type: 'short' },
      { beat: 148.75, lane: 1, type: 'short' },
      { beat: 149.25, lane: 1, type: 'short' },
      { beat: 150.00, lane: 2, type: 'short' },
      { beat: 150.25, lane: 2, type: 'short' },
      { beat: 151.00, lane: 2, type: 'short' },
      { beat: 151.00, lane: 3, type: 'short' },
      { beat: 151.50, lane: 1, type: 'short' },
      { beat: 151.50, lane: 2, type: 'short' },
      { beat: 152.00, lane: 0, type: 'short' },
      { beat: 152.00, lane: 1, type: 'short' },
      { beat: 152.50, lane: 2, type: 'short' },
      { beat: 152.50, lane: 3, type: 'short' },
      { beat: 153.25, lane: 1, type: 'short' },
      { beat: 153.75, lane: 1, type: 'short' },
      { beat: 154.25, lane: 1, type: 'short' },
      { beat: 154.75, lane: 1, type: 'short' },
      { beat: 155.25, lane: 1, type: 'short' },
      { beat: 155.75, lane: 3, type: 'hold', durationBeats: 1.75 },
      { beat: 157.50, lane: 0, type: 'short' },
      { beat: 158.25, lane: 1, type: 'short' },
      { beat: 158.50, lane: 0, type: 'short' },
      { beat: 159.25, lane: 1, type: 'short' },
      { beat: 159.75, lane: 1, type: 'short' },
      { beat: 160.00, lane: 1, type: 'short' },
      { beat: 160.25, lane: 1, type: 'short' },
      { beat: 160.50, lane: 1, type: 'short' },
      { beat: 160.75, lane: 1, type: 'short' },
      { beat: 161.25, lane: 2, type: 'hold', durationBeats: 1.75 },
      { beat: 163.25, lane: 3, type: 'short' },
      { beat: 163.50, lane: 3, type: 'short' },
      { beat: 163.75, lane: 3, type: 'short' },
      { beat: 164.25, lane: 2, type: 'short' },
      { beat: 164.75, lane: 1, type: 'short' },
      { beat: 165.25, lane: 0, type: 'short' },
      { beat: 165.75, lane: 0, type: 'short' },
      { beat: 166.00, lane: 0, type: 'short' },
      { beat: 166.25, lane: 0, type: 'short' },
      { beat: 166.50, lane: 0, type: 'short' },
      { beat: 166.75, lane: 0, type: 'short' },
      { beat: 167.00, lane: 0, type: 'short' },
      { beat: 167.25, lane: 0, type: 'short' },
      { beat: 167.50, lane: 0, type: 'short' },
      { beat: 167.75, lane: 1, type: 'hold', durationBeats: 0.75 },
      { beat: 168.50, lane: 2, type: 'hold', durationBeats: 0.50 },
      { beat: 169.00, lane: 1, type: 'hold', durationBeats: 0.50 },
      { beat: 169.50, lane: 2, type: 'hold', durationBeats: 0.50 },
      { beat: 170.00, lane: 1, type: 'hold', durationBeats: 0.50 },
      { beat: 170.75, lane: 0, type: 'hold', durationBeats: 2.25 },
      { beat: 172.50, lane: 3, type: 'short' },
      { beat: 172.75, lane: 2, type: 'short' },
      { beat: 173.50, lane: 0, type: 'short' },
      { beat: 174.25, lane: 0, type: 'short' },
      { beat: 174.25, lane: 3, type: 'hold', durationBeats: 2.00 },
      { beat: 176.25, lane: 0, type: 'short' },
      { beat: 176.75, lane: 0, type: 'short' },
      { beat: 177.25, lane: 0, type: 'short' },
      { beat: 178.00, lane: 1, type: 'short' },
      { beat: 178.75, lane: 1, type: 'short' },
      { beat: 179.50, lane: 1, type: 'short' },
      { beat: 181.25, lane: 1, type: 'short' },
      { beat: 182.00, lane: 1, type: 'short' },
      { beat: 183.00, lane: 1, type: 'short' },
      { beat: 184.00, lane: 3, type: 'short' },
      { beat: 185.50, lane: 0, type: 'short' },
      { beat: 187.00, lane: 0, type: 'hold', durationBeats: 1.75 },
      { beat: 189.00, lane: 3, type: 'short' },
      { beat: 190.00, lane: 3, type: 'short' },
      { beat: 191.00, lane: 3, type: 'short' },
      { beat: 192.00, lane: 0, type: 'hold', durationBeats: 2.25 },
      { beat: 194.25, lane: 3, type: 'short' },
      { beat: 195.00, lane: 3, type: 'short' },
      { beat: 196.00, lane: 3, type: 'short' },
      { beat: 196.50, lane: 0, type: 'hold', durationBeats: 1.00 },
      { beat: 198.00, lane: 3, type: 'short' },
      { beat: 199.00, lane: 2, type: 'short' },
      { beat: 199.50, lane: 0, type: 'hold', durationBeats: 1.00 },
      { beat: 200.75, lane: 1, type: 'hold', durationBeats: 1.00 },
      { beat: 201.75, lane: 3, type: 'hold', durationBeats: 1.25 },
      { beat: 202.75, lane: 0, type: 'hold', durationBeats: 1.00 },
      { beat: 203.75, lane: 1, type: 'hold', durationBeats: 1.50 },
      { beat: 205.25, lane: 2, type: 'short' },
      { beat: 205.50, lane: 2, type: 'short' },
      { beat: 205.75, lane: 2, type: 'short' },
      { beat: 206.00, lane: 2, type: 'short' },
      { beat: 206.25, lane: 2, type: 'short' },
      { beat: 206.50, lane: 2, type: 'short' }
    ]
  }
];

const KEY_SOUNDS = Array.from({ length: 10 }, (_, i) => `/key${i + 1}.mp3`);

function App() {
  // Navigation & Screens state: INTRO, PLAYLIST, DETAILS, LOADING, PLAYING, GAME_OVER
  const [gameState, setGameState] = useState('INTRO');
  const [selectedSong, setSelectedSong] = useState(SONGS[0]);
  const [showSettings, setShowSettings] = useState(false);
  
  // Game metrics
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [songHighScores, setSongHighScores] = useState({});
  
  // Modifiers
  const [noteSpeed, setNoteSpeed] = useState(4.0);
  const [bgmVolume, setBgmVolume] = useState(0.3);
  const [sfxVolume, setSfxVolume] = useState(0.8);
  const [keyLabels, setKeyLabels] = useState(['D', 'F', 'J', 'K']);
  const [debugMode, setDebugMode] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [isCustomChart, setIsCustomChart] = useState(false);
  const [gameResult, setGameResult] = useState(null);
  const [loadProgress, setLoadProgress] = useState(0);

  // Audio Cache Refs
  const audioCtxRef = useRef(null);
  const loadedBgmBuffersRef = useRef({}); // Caches loaded bgm buffers
  const sfxBuffersRef = useRef([]); // Caches loaded key click sfx buffers
  const bgmBufferRef = useRef(null); // Active BGM buffer for gameplay session

  // Intro Screen timeout (2s)
  useEffect(() => {
    if (gameState === 'INTRO') {
      const timer = setTimeout(() => {
        setGameState('PLAYLIST');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [gameState]);

  // Load High Scores on mount and status change
  useEffect(() => {
    const scores = {};
    SONGS.forEach(song => {
      scores[song.id] = parseInt(localStorage.getItem(song.highScoreKey) || '0', 10);
    });
    setSongHighScores(scores);
  }, [gameState]);

  // Handle app pause/minimize events on Android/iOS via Capacitor App Plugin
  useEffect(() => {
    let appStateListener = null;

    const initListener = async () => {
      try {
        const { App: CapApp } = await import('@capacitor/app');
        appStateListener = await CapApp.addListener('appStateChange', (state) => {
          if (!state.isActive) {
            // App minimized → suspend audio + signal GamePlayScreen to auto-pause
            if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
              audioCtxRef.current.suspend();
            }
            window.dispatchEvent(new CustomEvent('kliky-auto-pause'));
          }
          // On foreground return: intentionally do NOT auto-resume.
          // User must press RESUME button manually.
        });
      } catch (err) {
        console.warn('Capacitor App plugin not available, falling back to document visibility API:', err);
        const handleVisibilityChange = () => {
          if (document.hidden) {
            if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
              audioCtxRef.current.suspend();
            }
            window.dispatchEvent(new CustomEvent('kliky-auto-pause'));
          }
          // Foreground: do NOT auto-resume. User presses RESUME.
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        appStateListener = {
          remove: () => document.removeEventListener('visibilitychange', handleVisibilityChange)
        };
      }
    };

    initListener();

    return () => {
      if (appStateListener) {
        appStateListener.remove();
      }
    };
  }, []);

  const setupAudioContext = () => {
    if (audioCtxRef.current) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtxRef.current = new AudioContextClass();
  };

  const calculateTier = (judgmentCounts, accuracy) => {
    const { perfect, great, good, miss } = judgmentCounts || { perfect: 0, great: 0, good: 0, miss: 0 };
    const totalHits = perfect + great + good + miss;
    
    if (totalHits > 0 && miss === 0 && great === 0 && good === 0 && perfect > 0) {
      return { name: 'SSS', label: 'ALL PERFECT', color: '#ff007f', glow: 'rgba(255, 0, 127, 0.8)' };
    }
    if (accuracy >= 98) {
      return { name: 'SS', label: 'SUPERB', color: '#ff66cc', glow: 'rgba(255, 102, 204, 0.8)' };
    }
    if (accuracy >= 95) {
      return { name: 'S', label: 'EXCELLENT', color: '#ffd700', glow: 'rgba(255, 215, 0, 0.8)' };
    }
    if (accuracy >= 85) {
      return { name: 'A', label: 'GREAT', color: '#e0e0e0', glow: 'rgba(224, 224, 224, 0.8)' };
    }
    if (accuracy >= 70) {
      return { name: 'B', label: 'GOOD', color: '#cd7f32', glow: 'rgba(205, 127, 50, 0.8)' };
    }
    if (accuracy >= 55) {
      return { name: 'C', label: 'CLEAR', color: '#008cff', glow: 'rgba(0, 140, 255, 0.8)' };
    }
    return { name: 'F', label: 'FAILED', color: '#ff3333', glow: 'rgba(255, 51, 51, 0.8)' };
  };

  // Preload audio assets
  const loadSongAssets = async (song) => {
    setupAudioContext();
    const ctx = audioCtxRef.current;
    
    setGameState('LOADING');
    setLoadProgress(10);
    setSelectedSong(song);
    setIsCustomChart(!!song.chart);

    try {
      // Check cache for BGM
      let bgmBuffer = loadedBgmBuffersRef.current[song.id];
      if (!bgmBuffer) {
        const response = await fetch(encodeURI(song.path));
        if (!response.ok) throw new Error('BGM failed to fetch');
        let arrayBuf = await response.arrayBuffer();

        // If track is encrypted asset, perform in-memory XOR decryption
        if (song.encrypted) {
          const secretKey = new TextEncoder().encode('KLIKY_BEAT_NEKO_LEGENDS_CANON_HARP_2026');
          const view = new Uint8Array(arrayBuf);
          const decrypted = new Uint8Array(arrayBuf.byteLength);
          for (let i = 0; i < view.length; i++) {
            decrypted[i] = view[i] ^ secretKey[i % secretKey.length];
          }
          arrayBuf = decrypted.buffer;
        }

        bgmBuffer = await ctx.decodeAudioData(arrayBuf);
        loadedBgmBuffersRef.current[song.id] = bgmBuffer;
      }
      bgmBufferRef.current = bgmBuffer;
      setLoadProgress(60);

      // Load Keycap SFX
      if (sfxBuffersRef.current.length === 0) {
        const sfxBuffers = [];
        for (let i = 0; i < KEY_SOUNDS.length; i++) {
          const res = await fetch(KEY_SOUNDS[i]);
          if (!res.ok) throw new Error(`SFX ${i} failed`);
          const arrayBuf = await res.arrayBuffer();
          const decoded = await ctx.decodeAudioData(arrayBuf);
          sfxBuffers.push(decoded);
          setLoadProgress(Math.floor(60 + (i / KEY_SOUNDS.length) * 40));
        }
        sfxBuffersRef.current = sfxBuffers;
      }

      setLoadProgress(100);
      setTimeout(() => {
        setGameState('PLAYING');
      }, 400);
    } catch (e) {
      console.error(e);
      alert('오디오를 로드하는 데 실패했습니다.');
      setGameState('PLAYLIST');
    }
  };

  const handleResetHighscores = () => {
    SONGS.forEach(song => {
      localStorage.removeItem(song.highScoreKey);
    });
    setSongHighScores({ 'my-heart': 0 });
    alert('모든 하이스코어가 초기화되었습니다.');
  };

  const playKeycapSound = () => {
    setupAudioContext();
    if (!audioCtxRef.current || sfxBuffersRef.current.length === 0) return;
    const randIdx = Math.floor(Math.random() * sfxBuffersRef.current.length);
    const buffer = sfxBuffersRef.current[randIdx];
    const source = audioCtxRef.current.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.setValueAtTime(0.95 + Math.random() * 0.1, audioCtxRef.current.currentTime);
    
    // Quick gain play
    const gain = audioCtxRef.current.createGain();
    gain.gain.setValueAtTime(sfxVolume, audioCtxRef.current.currentTime);
    source.connect(gain);
    gain.connect(audioCtxRef.current.destination);
    source.start(0);
  };

  return (
    <div className="game-container">
      {/* 1. INTRO SCREEN */}
      {gameState === 'INTRO' && <IntroScreen />}

      {/* 2. PLAYLIST SCREEN */}
      {gameState === 'PLAYLIST' && (
        <PlaylistScreen 
          songs={SONGS}
          selectedSong={selectedSong}
          onSelectSong={(song) => {
            setSelectedSong(song);
            setGameState('DETAILS');
          }}
          songHighScores={songHighScores}
          onOpenSettings={() => setShowSettings(true)}
          playKeycapSound={playKeycapSound}
        />
      )}

      {/* 3. SONG DETAILS SCREEN */}
      {gameState === 'DETAILS' && (
        <SongDetailsScreen 
          song={selectedSong}
          noteSpeed={noteSpeed}
          setNoteSpeed={setNoteSpeed}
          debugMode={debugMode}
          isAutoPlay={isAutoPlay}
          setIsAutoPlay={setIsAutoPlay}
          onBack={() => setGameState('PLAYLIST')}
          onPlay={loadSongAssets}
          playKeycapSound={playKeycapSound}
        />
      )}

      {/* 4. TRANSITIONAL LOADING SCREEN */}
      {gameState === 'LOADING' && (
        <div className="overlay-screen">
          <div className="spinner"></div>
          <h2 style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)', letterSpacing: '2px' }}>
            PREPARING BEATMAP
          </h2>
          <div className="loading-progress-bar-container">
            <div className="loading-progress-bar-fill" style={{ width: `${loadProgress}%` }}></div>
          </div>
          <p style={{ marginTop: '10px', color: 'var(--text-secondary)' }}>
            {loadProgress}%
          </p>
        </div>
      )}

      {/* 5. IN-GAME LAYOUT */}
      {gameState === 'PLAYING' && (
        <GamePlayScreen 
          song={selectedSong}
          noteSpeed={noteSpeed}
          audioCtx={audioCtxRef.current}
          bgmVolume={bgmVolume}
          sfxVolume={sfxVolume}
          bgmBuffer={bgmBufferRef.current}
          sfxBuffers={sfxBuffersRef.current}
          keyLabels={keyLabels}
          isAutoPlay={isAutoPlay}
          isCustomChart={isCustomChart}
          playKeycapSound={playKeycapSound}
          onGameOver={(finalScore, finalMaxCombo, judgmentCounts, totalNotes) => {
            setScore(finalScore);
            setMaxCombo(finalMaxCombo);
            
            const counts = judgmentCounts || { perfect: 0, great: 0, good: 0, miss: 0 };
            const totalHits = counts.perfect + counts.great + counts.good + counts.miss;
            const accuracy = totalHits > 0 
              ? Math.min(100, Math.max(0, ((counts.perfect * 100 + counts.great * 80 + counts.good * 50) / (totalHits * 100)) * 100))
              : 0;

            const tier = calculateTier(counts, accuracy);
            const isUnranked = isAutoPlay || isCustomChart;

            // Security Rule: Only save high score if NOT unranked (No AutoPlay & No Custom Chart)
            if (!isUnranked) {
              const currentHigh = songHighScores[selectedSong.id] || 0;
              if (finalScore > currentHigh) {
                localStorage.setItem(selectedSong.highScoreKey, finalScore.toString());
                setSongHighScores(prev => ({ ...prev, [selectedSong.id]: finalScore }));
              }
            }

            setGameResult({
              counts,
              accuracy: accuracy.toFixed(1),
              tier,
              isUnranked
            });

            setGameState('GAME_OVER');
          }}
          onQuit={() => setGameState('PLAYLIST')}
        />
      )}

      {/* 6. GAME OVER / RESULT SCREEN */}
      {gameState === 'GAME_OVER' && (
        <div className="overlay-screen">
          <h1 className="menu-title" style={{ color: gameResult?.tier?.color || 'var(--neon-green)', textShadow: `0 0 20px ${gameResult?.tier?.glow}` }}>
            {gameResult?.tier?.label || 'FINISH!'}
          </h1>
          
          <div style={{ margin: '15px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            {/* Tier Badge */}
            <div className="result-tier-badge" style={{ borderColor: gameResult?.tier?.color, color: gameResult?.tier?.color, boxShadow: `0 0 25px ${gameResult?.tier?.glow}` }}>
              {gameResult?.tier?.name || 'CLEAR'}
            </div>

            {/* Unranked Warning Badge */}
            {gameResult?.isUnranked && (
              <div className="unranked-badge">
                ⚠️ UNRANKED (오토/커스텀 플레이로 기록 미반영)
              </div>
            )}

            <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '6px' }}>
              {selectedSong.title}
            </div>

            <div style={{ fontSize: '1.2rem', margin: '4px 0' }}>
              SCORE: <span style={{ color: '#fff', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>{score}</span>
              <span style={{ marginLeft: '16px', color: 'var(--neon-cyan)', fontSize: '1rem', fontFamily: 'var(--font-mono)' }}>
                ACC: {gameResult?.accuracy}%
              </span>
            </div>

            {/* Judgment Statistics Counter */}
            <div className="result-stats-grid">
              <div className="stat-item"><span className="stat-label cyan">PERFECT</span><span className="stat-val">{gameResult?.counts?.perfect || 0}</span></div>
              <div className="stat-item"><span className="stat-label green">GREAT</span><span className="stat-val">{gameResult?.counts?.great || 0}</span></div>
              <div className="stat-item"><span className="stat-label yellow">GOOD</span><span className="stat-val">{gameResult?.counts?.good || 0}</span></div>
              <div className="stat-item"><span className="stat-label magenta">MISS</span><span className="stat-val">{gameResult?.counts?.miss || 0}</span></div>
            </div>

            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              MAX COMBO: <span style={{ color: '#00ffff', fontWeight: 'bold' }}>{maxCombo}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="button-neon" onClick={() => { if (playKeycapSound) playKeycapSound(); loadSongAssets(selectedSong); }}>
              PLAY AGAIN
            </button>
            
            <button 
              className="button-neon" 
              style={{ borderColor: 'var(--neon-magenta)', boxShadow: '0 0 15px var(--neon-magenta-glow)' }}
              onClick={() => { if (playKeycapSound) playKeycapSound(); setGameState('PLAYLIST'); }}
            >
              SONG SELECT
            </button>
          </div>
        </div>
      )}

      {/* GLOBAL SETTINGS POPUP MODAL */}
      {showSettings && (
        <SettingsModal 
          bgmVolume={bgmVolume}
          sfxVolume={sfxVolume}
          setBgmVolume={setBgmVolume}
          setSfxVolume={setSfxVolume}
          keyLabels={keyLabels}
          setKeyLabels={setKeyLabels}
          debugMode={debugMode}
          setDebugMode={setDebugMode}
          isAutoPlay={isAutoPlay}
          setIsAutoPlay={setIsAutoPlay}
          onResetHighscores={handleResetHighscores}
          onClose={() => setShowSettings(false)}
          playKeycapSound={playKeycapSound}
        />
      )}
    </div>
  );
}

export default App;
