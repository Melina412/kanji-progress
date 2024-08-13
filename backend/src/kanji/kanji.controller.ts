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
  rtk_index?: number | null;
  rtk_keyword_eng?: string | null;
  rtk_keyword_de?: string | null;
  rtk_chapter?: number | null;
  wk_level?: number | null;
  wk_meanings?: string[] | null;
  duolingo_unit?: string | null;
  duolingo_unit_subtitle?: string | null;
}

const units = duolingoData?.alphabets[2].groups;
console.log('units[0]', units[0]);

function getData() {
  const data = units.map((unit) => {
    const title = unit.title;
    const subtitle = unit.subtitle;
    const kanji = unit.characters
      .flatMap((group) => group.map((item) => (item ? item.character : null)))
      .filter((char) => char); // filtern der null werte
    return { title, subtitle, kanji };
  });
  console.log(data[5]);
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

export async function getDuolingoKanji(req: Request, res: Response) {
  fs.readFile(
    '../backend/src/data/duolingoKanji.json',
    'utf-8',
    (error, data) => {
      if (error) {
        console.log('fehler beim lesen der json file', 'utf-8', error);
        return res.sendStatus(500);
      }
      console.log('data:', data);

      const parsed_data: Object = JSON.parse(data);
      console.log(parsed_data);
      return res.json({ data: parsed_data });
    }
  );
}

// export async function findDuolingoKanji(req: Request, res: Response) {
//   const kanji: string = '名';
//   try {
//     for (const element of duolingoKanji) {
//       if (element.kanji.includes(kanji)) {
//         return res.json(element.title);
//       }
//     }
//   } catch (error) {
//     console.log(error);
//   }
// }
async function findDuolingoKanji(kanji: string) {
  // const kanji: string = '名';
  try {
    for (const element of duolingoKanji) {
      if (element.kanji.includes(kanji)) {
        return {
          title: element.title,
          subtitle: element.subtitle,
        };
      }
    }
  } catch (error) {
    console.log(error);
  }
}

// ? als übersicht für die fields ??
function printFields() {
  const fields = rtkDeck?.note_models[0].flds;

  const fieldNames = fields?.map((obj) => {
    return { name: obj.name, order: obj.ord };
  });
  // console.log({ fieldNames });

  let result: string[] = [];
  fieldNames?.forEach((obj) => {
    result[obj.order] = obj.name;
  });
  // console.log({ result });
  return result;
}

const orderedFieldNames = printFields();
// console.log({ orderedFieldNames });

// # combine data from kanji sources

async function createKanji() {
  // 1. get all kanji from kanji-data as base list
  // 1.2 for each kanji extract: character, strokes, frequency, grade, jlpt_level,  wk_level, wk_meanings
  const kanjiList: Object[] = [];

  let kanji: Kanji = {};

  let matches = [];
  for (const [key, value] of Object.entries(kanjiData)) {
    // 2. from deck.json extract: rtk_index, rtk_keyword_eng, rtk_keyword_de, rtk_chapter
    const notes = rtkDeck.notes;
    const rtkMatch = notes.find((note) => note.fields[1] === kanji.character);
    // match ? matches.push(match) : null;

    // 3. from duolingoKanji extract: duolingo_unit
    const dlMatch = await findDuolingoKanji(kanji.character);

    if (dlMatch !== undefined) {
      // console.log('match', match.fields[0]);
      // console.log('dlMatch', dlMatch);
    }

    kanji = {
      character: key,
      strokes: value.strokes,
      frequency: value.freq,
      grade: value.grade,
      jlpt_level: value.jlpt_new,
      wk_level: value.wk_level,
      wk_meanings: value.wk_meanings,
      rtk_index: rtkMatch ? Number(rtkMatch.fields[0]) : null,
      rtk_keyword_eng: rtkMatch ? rtkMatch.fields[11] : null,
      rtk_keyword_de: rtkMatch ? rtkMatch.fields[2] : null,
      rtk_chapter: rtkMatch ? Number(rtkMatch.fields[9]) : null,
      duolingo_unit: dlMatch ? dlMatch.title : null,
      duolingo_unit_subtitle: dlMatch ? dlMatch.subtitle : null,
    };

    kanjiList.push(kanji);
  }
  // console.log('matches:', matches[0]);
  // console.log('match index:', matches[0].fields[0]);
  console.log(kanjiList[10]);

  // 4. save kanji to db OR save to json file ????? if json the i won't need the schema
}

const kanji = createKanji();

// console.log({ kanji });
