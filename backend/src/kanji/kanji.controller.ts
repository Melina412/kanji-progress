import fs from 'fs';
import { Request, Response } from 'express';

// daten aus duolingo user api
import duolingoData from '../data/sources/duolingoUserApi.json';
import rtkDeck from '../data/sources/deck.json';
import kanjiData from '../data/sources/kanji-data.json';

interface Kanji {
  character?: string;
  strokes?: number | null;
  frequency?: number | null;
  grade?: number | null;
  jlpt_level?: number | null;
  meanings?: string[] | null;
  on?: string[] | null;
  kun?: string[] | null;
  rtk_index?: number | null;
  rtk_keyword_eng?: string | null;
  rtk_keyword_de?: string | null;
  rtk_chapter?: number | null;
  wk_level?: number | null;
  wk_meanings?: string[] | null;
  dl_unit?: string | null;
  dl_unit_sub?: string | null;
}

const units = duolingoData?.alphabets[2].groups;
// console.log('units[0]', units[0]);

function getData() {
  const data = units.map((unit) => {
    const title = unit.title;
    const subtitle = unit.subtitle;
    const kanji = unit.characters
      .flatMap((group) => group.map((item) => (item ? item.character : null)))
      .filter((char) => char); // filtern der null werte
    return { title, subtitle, kanji };
  });
  // console.log(data[5]);
  return data;
}

const duolingoKanji = getData();
// console.log({duolingoKanji});

async function writeData() {
  fs.writeFile(
    '../backend/src/data/duolingoKanji.json',
    JSON.stringify(duolingoKanji),
    'utf-8',
    (error) => {
      if (error) {
        console.error(error);
        return;
      }
      console.log('json file created successfully');
    }
  );
}
// writeData();

async function findDuolingoKanji(kanji: string) {
  try {
    for (const element of duolingoKanji) {
      if (element.kanji.includes(kanji)) {
        return {
          title: element.title || null,
          subtitle: element.subtitle || null,
        };
      }
    }
  } catch (error) {
    console.log(error);
  }
}

async function findHeisigInfo(kanji: string) {
  try {
    const notes = rtkDeck.notes;
    const rtkMatch = notes.find((note) => note.fields[1] === kanji);
    if (rtkMatch) {
      return {
        index: Number(rtkMatch.fields[0]) || null,
        keyword_eng: rtkMatch.fields[11] || null,
        keyword_de: rtkMatch.fields[2] || null,
        chapter: Number(rtkMatch.fields[9]) || null,
      };
    }
  } catch (error) {
    console.log(error);
  }
}

// # combine data from kanji sources

async function createKanji() {
  // ***** 1. get all kanji from kanji-data as base list
  const kanjiList: Kanji[] = [];

  for (const [key, value] of Object.entries(kanjiData)) {
    // ***** 2. for each kanji extract needed values
    const {
      strokes,
      freq,
      grade,
      jlpt_new,
      meanings,
      readings_on,
      readings_kun,
      wk_level,
      wk_meanings,
    } = value;

    // ***** 3. from deck.json extract: rtk_index, rtk_keyword_eng, rtk_keyword_de, rtk_chapter
    const rtkMatch = await findHeisigInfo(key);

    // ***** 4. from duolingoKanji extract: duolingo_unit, duolingo_unit_sub
    const dlMatch = await findDuolingoKanji(key);

    // trick: spreading empty object has no effect
    const kanji: Kanji = {
      character: key,
      ...(strokes ? { strokes } : {}),
      ...(freq ? { frequency: freq } : {}),
      ...(grade ? { grade } : {}),
      ...(jlpt_new ? { jlpt_level: jlpt_new } : {}),
      ...(meanings && meanings.length > 0 ? { meanings } : {}),
      ...(readings_on && readings_on.length > 0 ? { on: readings_on } : {}),
      ...(readings_kun && readings_kun.length > 0 ? { kun: readings_kun } : {}),
      ...(wk_level ? { wk_level } : {}),
      ...(wk_meanings ? { wk_meanings } : {}),
      rtk_index: rtkMatch?.index,
      rtk_keyword_eng: rtkMatch?.keyword_eng,
      rtk_keyword_de: rtkMatch?.keyword_de,
      rtk_chapter: rtkMatch?.chapter,
      dl_unit: dlMatch?.title,
      dl_unit_sub: dlMatch?.subtitle,
    };

    kanjiList.push(kanji);
  }
  console.log(kanjiList[15]);

  // ***** 5. save kanji to json file
  (async () => {
    fs.writeFile(
      '../backend/src/data/kanji.json',
      JSON.stringify(kanjiList),
      'utf-8',
      (error) => {
        if (error) {
          console.error(error);
          return;
        }
        console.log('json file created successfully');
      }
    );
  })();
}

// createKanji();
